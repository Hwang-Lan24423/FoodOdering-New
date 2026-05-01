<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Product;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::query();

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        if (!$request->has('all')) {
            $query->where('status', 'Available');
        }

        return response()->json($query->get());
    }

    public function show(Request $request, $id)
    {
        $product = Product::with(['reviews.user'])->find($id);
        
        if (!$product) {
            return response()->json(['message' => 'Không tìm thấy sản phẩm'], 404);
        }

        $is_eligible = false;
        // Check using both sanctum and session if needed, but sanctum is preferred for SPA
        $user = auth('sanctum')->user();
        
        if ($user) {
            $is_eligible = \App\Models\Order::where('user_id', $user->id)
                ->where('status', 'Completed')
                ->whereHas('items', function($query) use ($id) {
                    $query->where('product_id', $id);
                })
                ->exists();
        }

        $data = $product->toArray();
        $data['is_eligible'] = $is_eligible;

        return response()->json($data);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'price' => 'required|numeric',
            'quantity' => 'required|integer',
            'code' => 'required|string|unique:products',
        ]);

        $product = Product::create($request->all());
        return response()->json($product, 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::find($id);
        if (!$product) {
            return response()->json(['message' => 'Không tìm thấy sản phẩm'], 404);
        }

        $product->update($request->all());
        return response()->json($product);
    }

    public function destroy($id)
    {
        $product = Product::find($id);
        if (!$product) {
            return response()->json(['message' => 'Không tìm thấy sản phẩm'], 404);
        }

        $product->delete();
        return response()->json(['message' => 'Đã xóa sản phẩm']);
    }

    public function updateStatus(Request $request, $id)
    {
        $product = Product::find($id);
        if (!$product) {
            return response()->json(['message' => 'Không tìm thấy sản phẩm'], 404);
        }

        $request->validate([
            'status' => 'required|in:Available,Sold Out'
        ]);

        $product->update(['status' => $request->status]);
        
        return response()->json(['message' => 'Đã cập nhật trạng thái', 'product' => $product]);
    }
}
