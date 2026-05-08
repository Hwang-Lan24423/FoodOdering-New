<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CouponController extends Controller
{
    /**
     * Display a listing of the resource (Admin).
     */
    public function index()
    {
        return response()->json(Coupon::latest()->get());
    }

    /**
     * Get active coupons for customers (User Checkout).
     */
    public function getActiveCoupons()
    {
        $coupons = Coupon::where('is_active', true)
            ->where('expiry_date', '>=', now()->startOfDay())
            ->where(function ($query) {
                $query->whereNull('usage_limit')
                      ->orWhereColumn('used_count', '<', 'usage_limit');
            })
            ->latest()
            ->get();
            
        return response()->json($coupons);
    }

    /**
     * Store a newly created resource in storage (Admin).
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|unique:coupons,code',
            'type' => 'required|in:fixed,percent',
            'value' => 'required|numeric|min:0',
            'min_order_value' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'expiry_date' => 'required|date|after_or_equal:today',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $coupon = Coupon::create($request->all());

        return response()->json([
            'message' => 'Tạo mã giảm giá thành công!',
            'coupon' => $coupon
        ], 201);
    }

    /**
     * Update the specified resource (Admin).
     */
    public function update(Request $request, $id)
    {
        $coupon = Coupon::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'code' => 'sometimes|required|string|unique:coupons,code,' . $id,
            'type' => 'sometimes|required|in:fixed,percent',
            'value' => 'sometimes|required|numeric|min:0',
            'min_order_value' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:0',
            'expiry_date' => 'sometimes|required|date',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $coupon->update($request->all());

        return response()->json([
            'message' => 'Cập nhật mã giảm giá thành công!',
            'coupon' => $coupon
        ]);
    }

    /**
     * Remove the specified resource (Admin).
     */
    public function destroy($id)
    {
        $coupon = Coupon::findOrFail($id);
        $coupon->delete();

        return response()->json(['message' => 'Đã xóa mã giảm giá!']);
    }

    /**
     * Validate a coupon code (User Checkout).
     */
    public function validateCoupon(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'order_amount' => 'required|numeric'
        ]);

        $coupon = Coupon::where('code', strtoupper($request->code))->first();

        if (!$coupon) {
            return response()->json(['message' => 'Mã giảm giá không tồn tại!'], 404);
        }

        if (!$coupon->isValid($request->order_amount)) {
            if (!$coupon->is_active) {
                return response()->json(['message' => 'Mã giảm giá này đã bị vô hiệu hóa!'], 400);
            }
            if ($coupon->expiry_date->lt(now()->startOfDay())) {
                return response()->json(['message' => 'Mã giảm giá này đã hết hạn!'], 400);
            }
            if ($coupon->usage_limit !== null && $coupon->used_count >= $coupon->usage_limit) {
                return response()->json(['message' => 'Mã giảm giá này đã hết lượt sử dụng!'], 400);
            }
            if ($request->order_amount < $coupon->min_order_value) {
                return response()->json([
                    'message' => 'Đơn hàng tối thiểu ' . number_format($coupon->min_order_value) . 'đ để áp dụng mã này!'
                ], 400);
            }
        }

        return response()->json([
            'message' => 'Áp dụng mã thành công!',
            'code' => $coupon->code,
            'type' => $coupon->type,
            'value' => $coupon->value,
            'discount_amount' => $coupon->calculateDiscount($request->order_amount)
        ]);
    }
}
