<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Notification;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = Notification::where('user_id', $request->user()->id)
            ->latest()
            ->take(20)
            ->get();
            
        $unreadCount = Notification::where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount
        ]);
    }

    public function markAsRead(Request $request, $id)
    {
        $notification = Notification::where('user_id', $request->user()->id)
            ->findOrFail($id);
            
        $notification->update(['is_read' => true]);

        return response()->json(['message' => 'Đã đánh dấu là đã đọc']);
    }

    public function markAllAsRead(Request $request)
    {
        Notification::where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['message' => 'Đã đánh dấu tất cả là đã đọc']);
    }

    public function deleteAll(Request $request)
    {
        Notification::where('user_id', $request->user()->id)->delete();

        return response()->json(['message' => 'Đã xóa tất cả thông báo']);
    }
}
