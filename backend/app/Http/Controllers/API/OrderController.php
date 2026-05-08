<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Sale;
use App\Models\Notification;
use App\Models\Coupon;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Services\LoyaltyService;

class OrderController extends Controller
{
    protected $loyaltyService;

    public function __construct(LoyaltyService $loyaltyService)
    {
        $this->loyaltyService = $loyaltyService;
    }
    public function index(Request $request)
    {
        $user = $request->user();
        if ($user->role == 3 || $user->role == 2) {
            return response()->json(Order::with('user', 'items.product')->latest()->get());
        }
        return response()->json($user->orders()->with('items.product')->latest()->get());
    }

    public function store(Request $request)
    {
        // 1. Validation khớp với Checkout.jsx
        $request->validate([
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'name' => 'required|string',
            'phone' => 'required|string',
            'address' => 'required|string',
            'total_amount' => 'required|numeric',
            'payment_method' => 'required|string',
            'coupon_code' => 'nullable|string',
            'points_to_redeem' => 'nullable|integer|min:0'
        ]);

        return DB::transaction(function () use ($request) {
            $user = $request->user();
            $totalAmount = $request->total_amount;
            $discount = 0;
            $coupon = null;

            // 2. Xử lý mã giảm giá (nếu có)
            if ($request->coupon_code) {
                $coupon = Coupon::where('code', $request->coupon_code)->first();
                if ($coupon && $coupon->isValid($totalAmount)) {
                    $discount = $coupon->calculateDiscount($totalAmount);
                    $totalAmount = $totalAmount - $discount;
                    
                    // Tăng lượt sử dụng
                    $coupon->increment('used_count');
                }
            }

            // 2.1 Xử lý tiêu điểm
            $pointsUsed = 0;
            $pointDiscount = 0;
            if ($request->points_to_redeem > 0) {
                try {
                    $pointDiscount = $this->loyaltyService->redeemPoints($user, $request->points_to_redeem);
                    $pointsUsed = $request->points_to_redeem;
                    $totalAmount = max(0, $totalAmount - $pointDiscount);
                } catch (\Exception $e) {
                    // Nếu lỗi (không đủ điểm), bỏ qua hoặc trả về lỗi tùy chọn. 
                    // Ở đây tôi chọn trả về lỗi để khách hàng biết.
                    return response()->json(['message' => $e->getMessage()], 400);
                }
            }

            // 3. Tạo đơn hàng
            $order = Order::create([
                'user_id' => $user->id,
                'name' => $request->name,
                'email' => $user->email,
                'phone' => $request->phone,
                'address' => $request->address,
                'pmode' => $request->payment_method,
                'note' => $request->note,
                'amount_paid' => $totalAmount,
                'points_used' => $pointsUsed,
                'status' => 'Pending',
            ]);

            // 4. Lưu chi tiết từng món ăn
            foreach ($request->items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                ]);

                // 5. Trừ số lượng trong kho
                $product = Product::find($item['product_id']);
                if ($product) {
                    $product->decrement('quantity', $item['quantity']);
                    if ($product->quantity <= 0) {
                        $product->update(['status' => 'Sold Out', 'quantity' => 0]);
                    }
                }
            }

            // 6. Gửi thông báo cho Staff và Admin
            $staffs = \App\Models\User::whereIn('role', [2, 3])->get();
            foreach ($staffs as $staff) {
                Notification::send(
                    $staff->id,
                    'Đơn hàng mới!',
                    "Bạn có đơn hàng mới #{$order->id} từ {$order->name}.",
                    'order',
                    '/staff/orders'
                );
            }

            return response()->json($order->load('items'), 201);
        });
    }


    public function show($id)
    {
        $order = Order::with('items.product', 'user')->findOrFail($id);
        return response()->json($order);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|string']);
        $order = Order::with('items')->findOrFail($id);
        $order->update(['status' => $request->status]);

        // Hoàn lại kho nếu đơn hàng bị hủy
        if ($request->status === 'Cancelled') {
            foreach ($order->items as $item) {
                $product = Product::find($item->product_id);
                if ($product) {
                    $product->increment('quantity', $item->quantity);
                    if ($product->quantity > 0 && $product->status === 'Sold Out') {
                        $product->update(['status' => 'Available']);
                    }
                }
            }
        }
        
        // Gửi thông báo cho khách hàng
        Notification::send(
            $order->user_id,
            'Cập nhật đơn hàng #' . $order->id,
            'Đơn hàng của bạn đã chuyển sang trạng thái: ' . $request->status,
            'order',
            '/orders'
        );

        // Cộng điểm khi đơn hàng hoàn thành
        if ($request->status === 'Completed' && $order->points_earned == 0) {
            $pointsEarned = $this->loyaltyService->awardPoints($order->user, $order->amount_paid, $order->id);
            $order->update(['points_earned' => $pointsEarned]);
        }
        
        return response()->json($order);
    }

    public function stats(Request $request)
    {
        $period = $request->query('period', 'daily');
        $date = $request->query('date', now()->toDateString());
        
        $query = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->select(
                'products.name',
                'products.category',
                DB::raw('SUM(order_items.quantity) as total_quantity'),
                DB::raw('SUM(order_items.quantity * order_items.price) as total_revenue')
            )
            ->where('orders.status', 'Completed');

        if ($period == 'daily') {
            $query->whereDate('orders.created_at', $date);
        } elseif ($period == 'weekly') {
            $start = Carbon::parse($date)->startOfWeek();
            $end = Carbon::parse($date)->endOfWeek();
            $query->whereBetween('orders.created_at', [$start, $end]);
        } elseif ($period == 'monthly') {
            $carbonDate = Carbon::parse($date);
            $query->whereMonth('orders.created_at', $carbonDate->month)
                  ->whereYear('orders.created_at', $carbonDate->year);
        }

        $stats = $query->groupBy('products.id', 'products.name', 'products.category')->get();
        
        return response()->json($stats);
    }

    public function dashboardStats()
    {
        // 1. So sánh doanh thu (Tuần này vs Tuần trước)
        $thisWeekStart = Carbon::now()->startOfWeek();
        $thisWeekEnd = Carbon::now()->endOfWeek();
        $lastWeekStart = Carbon::now()->subWeek()->startOfWeek();
        $lastWeekEnd = Carbon::now()->subWeek()->endOfWeek();

        $thisWeekData = Order::whereIn('status', ['Paid', 'Preparing', 'Completed'])
            ->whereBetween('created_at', [$thisWeekStart, $thisWeekEnd])
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(amount_paid) as total'))
            ->groupBy('date')
            ->get();

        $lastWeekData = Order::whereIn('status', ['Paid', 'Preparing', 'Completed'])
            ->whereBetween('created_at', [$lastWeekStart, $lastWeekEnd])
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(amount_paid) as total'))
            ->groupBy('date')
            ->get();

        // 2. Top 5 sản phẩm bán chạy nhất
        $topProducts = OrderItem::join('products', 'order_items.product_id', '=', 'products.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->whereIn('orders.status', ['Paid', 'Preparing', 'Completed'])
            ->select('products.name', DB::raw('SUM(order_items.quantity) as total_quantity'))
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total_quantity')
            ->limit(5)
            ->get();

        return response()->json([
            'revenue' => [
                'this_week' => $thisWeekData,
                'last_week' => $lastWeekData
            ],
            'top_products' => $topProducts
        ]);
    }

    public function getPendingCount()
    {
        $count = Order::whereIn('status', ['Pending', 'Paid'])->count();
        return response()->json(['count' => $count]);
    }
}
