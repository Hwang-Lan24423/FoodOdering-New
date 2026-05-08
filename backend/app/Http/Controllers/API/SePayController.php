<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use Illuminate\Support\Facades\Log;

class SePayController extends Controller
{
    /**
     * Xu ly Webhook tu SePay
     * SePay gui POST request khi co giao dich moi
     */
    public function webhook(Request $request)
    {
        // Log TOÀN BỘ dữ liệu thô để debug
        Log::info('SePay Webhook Incoming', [
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'headers' => $request->headers->all(),
            'body' => $request->all()
        ]);

        // 1. Kiểm tra Secret Key (Bảo mật)
        // SePay gửi Secret Key trong Header 'x-sepay-secret-key'
        $secretKey = $request->header('x-sepay-secret-key');
        
        // Bạn sẽ cần điền Secret Key của mình vào đây hoặc trong file .env
        /* 
        if ($secretKey !== env('SEPAY_SECRET_KEY')) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }
        */

        // 2. Lấy thông tin từ giao dịch
        $content = $request->input('content');     // Nội dung chuyển khoản
        $amountIn = $request->input('amount_in') ?? $request->input('transferAmount');   // Số tiền nhận được
        
        Log::info('SePay Webhook Validated', ['content' => $content, 'amount' => $amountIn]);

        // 3. Tìm Mã đơn hàng trong nội dung (Ví dụ: BNT1024)
        if (preg_match('/BNT(\d+)/i', $content, $matches)) {
            $orderId = $matches[1];
            $order = Order::find($orderId);
            
            if ($order) {
                // Kiểm tra xem đơn hàng đã thanh toán chưa để tránh xử lý trùng
                if ($order->status === 'Paid') {
                    return response()->json(['success' => true, 'message' => 'Order already paid']);
                }

                // Lấy số tiền cần thanh toán (thử cả 2 cột nếu có)
                $requiredAmount = $order->total_amount ?? $order->amount_paid ?? 0;

                if ($amountIn >= $requiredAmount) {
                    $order->update([
                        'status' => 'Paid',
                        'note' => $order->note . " [Đã thanh toán tự động qua SePay lúc " . now() . "]"
                    ]);
                    
                    Log::info("Order #{$orderId} marked as Paid via SePay");

                    // Gửi thông báo cho khách hàng
                    \App\Models\Notification::send(
                        $order->user_id,
                        'Thanh toán thành công!',
                        'Đơn hàng #' . $order->id . ' đã được thanh toán thành công. Chúng tôi đang chuẩn bị món ăn cho bạn.',
                        'payment',
                        '/orders'
                    );

                    return response()->json(['success' => true, 'message' => 'Xác nhận thanh toán thành công']);
                } else {
                    Log::warning("Order #{$orderId} insufficient amount. Received: {$amountIn}, Required: {$requiredAmount}");
                    return response()->json(['success' => false, 'message' => 'Insufficient amount'], 400);
                }
            }
        }


        return response()->json(['success' => false, 'message' => 'Order not found or invalid content'], 404);
    }
}
