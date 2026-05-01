<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Review;
use App\Models\Order;

class ReviewController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string',
            'order_id' => 'nullable|exists:orders,id',
        ]);

        $user = $request->user();

        // Check if user has purchased this product and order is completed
        $hasPurchased = Order::where('user_id', $user->id)
            ->where('status', 'Completed')
            ->whereHas('items', function($query) use ($request) {
                $query->where('product_id', $request->product_id);
            })
            ->exists();

        if (!$hasPurchased) {
            return response()->json([
                'message' => 'Bạn chỉ có thể đánh giá sản phẩm sau khi đã mua và hoàn thành đơn hàng.'
            ], 403);
        }

        // Check if user has already reviewed this product
        $existing = Review::where('user_id', $user->id)
            ->where('product_id', $request->product_id)
            ->first();
        
        if ($existing) {
            return response()->json(['message' => 'Bạn đã đánh giá sản phẩm này rồi.'], 400);
        }

        $review = Review::create([
            'user_id' => $user->id,
            'product_id' => $request->product_id,
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);

        return response()->json($review->load('user'), 201);
    }

    public function getByProduct($productId)
    {
        $reviews = Review::with('user')
            ->where('product_id', $productId)
            ->latest()
            ->get();
        
        return response()->json($reviews);
    }
}
