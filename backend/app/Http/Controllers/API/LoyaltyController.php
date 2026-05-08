<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\LoyaltyService;

class LoyaltyController extends Controller
{
    protected $loyaltyService;

    public function __construct(LoyaltyService $loyaltyService)
    {
        $this->loyaltyService = $loyaltyService;
    }

    /**
     * Lấy thông tin điểm và hạng thành viên hiện tại.
     */
    public function getStatus(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'points' => $user->points,
            'total_points_earned' => $user->total_points_earned,
            'loyalty_level' => $user->loyalty_level,
            'next_level' => $this->getNextLevelInfo($user),
            'redemption_rate' => LoyaltyService::REDEMPTION_RATE,
            'earning_rate' => LoyaltyService::EARNING_RATE,
        ]);
    }

    /**
     * Lấy lịch sử giao dịch điểm.
     */
    public function getHistory(Request $request)
    {
        $history = $request->user()
            ->loyaltyTransactions()
            ->with('order')
            ->latest()
            ->paginate(10);
            
        return response()->json($history);
    }

    /**
     * Tính toán thông tin cấp bậc tiếp theo.
     */
    private function getNextLevelInfo($user)
    {
        $total = $user->total_points_earned;
        
        if ($user->loyalty_level === 'bronze') {
            return [
                'name' => 'Silver',
                'points_needed' => max(0, LoyaltyService::TIER_THRESHOLDS['silver'] - $total),
                'progress' => min(100, ($total / LoyaltyService::TIER_THRESHOLDS['silver']) * 100)
            ];
        } elseif ($user->loyalty_level === 'silver') {
            return [
                'name' => 'Gold',
                'points_needed' => max(0, LoyaltyService::TIER_THRESHOLDS['gold'] - $total),
                'progress' => min(100, ($total / LoyaltyService::TIER_THRESHOLDS['gold']) * 100)
            ];
        }
        
        return null; // Đã là Gold
    }
}
