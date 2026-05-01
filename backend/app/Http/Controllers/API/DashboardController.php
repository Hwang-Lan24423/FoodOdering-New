<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\User;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function overview(Request $request)
    {
        // Mặc định lấy dữ liệu 7 ngày qua
        $period = $request->query('period', 7);
        
        $currentStart = Carbon::now()->subDays($period)->startOfDay();
        $currentEnd = Carbon::now()->endOfDay();
        
        $previousStart = Carbon::now()->subDays($period * 2)->startOfDay();
        $previousEnd = Carbon::now()->subDays($period)->endOfDay();

        // 1. Doanh thu (Revenue)
        $currentRevenue = Order::where('status', 'Completed')
                               ->whereBetween('created_at', [$currentStart, $currentEnd])
                               ->sum('amount_paid');
                               
        $previousRevenue = Order::where('status', 'Completed')
                                ->whereBetween('created_at', [$previousStart, $previousEnd])
                                ->sum('amount_paid');
                                
        $revenueChange = $this->calculatePercentageChange($previousRevenue, $currentRevenue);

        // 2. Đơn hàng (Orders)
        $currentOrders = Order::whereBetween('created_at', [$currentStart, $currentEnd])->count();
        $previousOrders = Order::whereBetween('created_at', [$previousStart, $previousEnd])->count();
        $ordersChange = $this->calculatePercentageChange($previousOrders, $currentOrders);

        // 3. Khách hàng mới (New Customers - giả định role = 0 hoặc 1 là user bình thường)
        // Trong hệ thống này thường role = 0 là customer
        $currentCustomers = User::where('role', 0)
                                ->whereBetween('created_at', [$currentStart, $currentEnd])
                                ->count();
        $previousCustomers = User::where('role', 0)
                                 ->whereBetween('created_at', [$previousStart, $previousEnd])
                                 ->count();
        $customersChange = $this->calculatePercentageChange($previousCustomers, $currentCustomers);

        // Đảm bảo Carbon trả về tiếng Việt cho diffForHumans
        Carbon::setLocale('vi');

        // 4. Hoạt động gần đây (Recent Activities)
        $recentOrders = Order::latest()
                             ->take(5)
                             ->get()
                             ->map(function ($order) {
                                 $dot = 'dot-warning';
                                 if ($order->status == 'Completed') $dot = 'dot-success';
                                 if ($order->status == 'Cancelled') $dot = 'dot-danger';
                                 
                                 $text = $order->status == 'Pending' ? 'đang chờ xử lý' : 
                                        ($order->status == 'Completed' ? 'đã hoàn thành' : 'đã bị hủy');
                                 
                                 return [
                                     'id' => 'order_' . $order->id,
                                     'type' => 'order',
                                     'dot' => $dot,
                                     'content' => 'Đơn hàng <strong>#' . $order->id . '</strong> ' . $text,
                                     'time' => $order->created_at->diffForHumans(),
                                     'created_at' => $order->created_at
                                 ];
                             });

        $recentUsers = User::where('role', 0)
                           ->latest()
                           ->take(3)
                           ->get()
                           ->map(function ($user) {
                               return [
                                   'id' => 'user_' . $user->id,
                                   'type' => 'user',
                                   'dot' => 'dot-info',
                                   'content' => 'Khách hàng <strong>' . htmlspecialchars($user->name) . '</strong> vừa đăng ký',
                                   'time' => $user->created_at->diffForHumans(),
                                   'created_at' => $user->created_at
                               ];
                           });

        // Gộp lại và sắp xếp theo thời gian
        $recentActivities = $recentOrders->concat($recentUsers)
                                         ->sortByDesc('created_at')
                                         ->take(5)
                                         ->values()
                                         ->all();

        // 5. Dữ liệu biểu đồ (Chart Data) - Doanh thu 7 ngày qua
        $chartData = [];
        for ($i = $period - 1; $i >= 0; $i--) {
            $dateStart = Carbon::now()->subDays($i)->startOfDay();
            $dateEnd = Carbon::now()->subDays($i)->endOfDay();
            
            $dayRevenue = Order::where('status', 'Completed')
                               ->whereBetween('created_at', [$dateStart, $dateEnd])
                               ->sum('amount_paid');
            
            $chartData[] = [
                'name' => $dateStart->format('d/m'),
                'revenue' => $dayRevenue
            ];
        }

        return response()->json([
            'revenue' => [
                'value' => $currentRevenue,
                'change' => abs($revenueChange),
                'isUp' => $revenueChange >= 0
            ],
            'orders' => [
                'value' => $currentOrders,
                'change' => abs($ordersChange),
                'isUp' => $ordersChange >= 0
            ],
            'customers' => [
                'value' => $currentCustomers,
                'change' => abs($customersChange),
                'isUp' => $customersChange >= 0
            ],
            'recent_activities' => $recentActivities,
            'chart_data' => $chartData
        ]);
    }

    private function calculatePercentageChange($oldValue, $newValue)
    {
        if ($oldValue == 0) {
            return $newValue > 0 ? 100 : 0;
        }
        return round((($newValue - $oldValue) / $oldValue) * 100, 1);
    }
}
