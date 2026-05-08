<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    /**
     * Get a list of users based on type (customer or staff)
     */
    public function index(Request $request)
    {
        $type = $request->query('type', 'customer');
        $role = $type === 'staff' ? 2 : 1;
        
        $users = User::where('role', $role)->latest()->get();
        return response()->json($users);
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|string|max:255|unique:users',
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'contact' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'gender' => 'nullable|string|in:male,female,other,Nam,Nữ,Khác',
            'role' => 'required|integer|in:1,2'
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);

        return response()->json([
            'message' => 'Người dùng đã được tạo thành công!',
            'user' => $user
        ], 201);
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'contact' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'gender' => 'nullable|string|in:male,female,other,Nam,Nữ,Khác',
            'password' => 'nullable|string|min:6',
            'points' => 'nullable|integer|min:0',
        ]);

        // Nếu có truyền mật khẩu mới
        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']); // Loại bỏ để không ghi đè thành rỗng
        }

        // Nếu admin sửa điểm, cập nhật cả tổng điểm tích lũy để thăng/hạ hạng tương ứng
        if (isset($validated['points'])) {
            $user->total_points_earned = $validated['points'];
        }

        $user->update($validated);

        // Cập nhật hạng thành viên nếu là khách hàng
        if ($user->role == 1) {
            app(\App\Services\LoyaltyService::class)->updateLevel($user);
        }

        return response()->json([
            'message' => 'Thông tin đã được cập nhật!',
            'user' => $user->fresh()
        ]);
    }

    /**
     * Remove (soft delete) the specified user.
     */
    public function destroy($id, Request $request)
    {
        $user = User::findOrFail($id);
        
        // Không cho phép admin tự xóa chính mình
        if ($user->id === $request->user()->id) {
            return response()->json([
                'message' => 'Bạn không thể tự xóa tài khoản của chính mình!'
            ], 403);
        }

        $user->delete();

        return response()->json([
            'message' => 'Tài khoản đã bị vô hiệu hóa (xóa mềm).'
        ]);
    }
}
