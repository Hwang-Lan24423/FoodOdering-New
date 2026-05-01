<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Sale;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
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
        ]);

        return DB::transaction(function () use ($request) {
            $user = $request->user();

            // 2. Tạo đơn hàng
            $order = Order::create([
                'user_id' => $user->id,
                'name' => $request->name,
                'email' => $user->email, // Lấy email từ tài khoản đang đăng nhập
                'phone' => $request->phone,
                'address' => $request->address,
                'pmode' => $request->payment_method,
                'note' => $request->note,
                'amount_paid' => $request->total_amount,
                'status' => 'Pending',
            ]);

            // 3. Lưu chi tiết từng món ăn
            foreach ($request->items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                ]);

                // 4. Trừ số lượng trong kho
                $product = \App\Models\Product::find($item['product_id']);
                if ($product) {
                    $product->decrement('quantity', $item['quantity']);
                    // Tự động chuyển trạng thái Hết hàng nếu số lượng <= 0
                    if ($product->quantity <= 0) {
                        $product->update(['status' => 'Sold Out', 'quantity' => 0]);
                    }
                }
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
                $product = \App\Models\Product::find($item->product_id);
                if ($product) {
                    $product->increment('quantity', $item->quantity);
                    if ($product->quantity > 0 && $product->status === 'Sold Out') {
                        $product->update(['status' => 'Available']);
                    }
                }
            }
        }
        
        // Gửi thông báo cho khách hàng
        \App\Models\Notification::send(
            $order->user_id,
            'Cập nhật đơn hàng #' . $order->id,
            'Đơn hàng của bạn đã chuyển sang trạng thái: ' . $request->status,
            'order',
            '/orders'
        );
        
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
            $start = \Carbon\Carbon::parse($date)->startOfWeek();
            $end = \Carbon\Carbon::parse($date)->endOfWeek();
            $query->whereBetween('orders.created_at', [$start, $end]);
        } elseif ($period == 'monthly') {
            $carbonDate = \Carbon\Carbon::parse($date);
            $query->whereMonth('orders.created_at', $carbonDate->month)
                  ->whereYear('orders.created_at', $carbonDate->year);
        }

        $stats = $query->groupBy('products.id', 'products.name', 'products.category')->get();
        
        return response()->json($stats);
    }

    public function getPendingCount()
    {
        $count = Order::where('status', 'Pending')->count();
        return response()->json(['count' => $count]);
    }
}
