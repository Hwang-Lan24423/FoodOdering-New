<?php

namespace App\Services;

use App\Models\User;
use App\Models\LoyaltyTransaction;
use Illuminate\Support\Facades\DB;

class LoyaltyService
{
    /**
     * Tỷ lệ quy đổi: 10,000đ = 1 điểm cơ bản.
     */
    const EARNING_RATE = 10000;

    /**
     * Tỷ lệ tiêu điểm: 1 điểm = 100đ giảm giá.
     */
    const REDEMPTION_RATE = 100;

    /**
     * Hệ số nhân theo hạng thành viên.
     */
    const TIER_MULTIPLIERS = [
        'bronze' => 1.0,
        'silver' => 1.2,
        'gold'   => 1.5,
    ];

    /**
     * Ngưỡng thăng hạng (Tổng điểm đã tích lũy được).
     */
    const TIER_THRESHOLDS = [
        'gold'   => 2000,
        'silver' => 500,
    ];

    /**
     * Tính toán số điểm sẽ nhận được từ số tiền thanh toán.
     */
    public function calculatePointsToEarn(User $user, $amount)
    {
        $basePoints = floor($amount / self::EARNING_RATE);
        $multiplier = self::TIER_MULTIPLIERS[$user->loyalty_level] ?? 1.0;
        
        return (int)($basePoints * $multiplier);
    }

    /**
     * Cộng điểm cho người dùng và kiểm tra thăng hạng.
     */
    public function awardPoints(User $user, $amount, $orderId = null)
    {
        $pointsToEarn = $this->calculatePointsToEarn($user, $amount);

        if ($pointsToEarn <= 0) return 0;

        return DB::transaction(function () use ($user, $pointsToEarn, $orderId) {
            // 1. Cập nhật số điểm
            $user->points += $pointsToEarn;
            $user->total_points_earned += $pointsToEarn;

            // 2. Kiểm tra thăng hạng
            $this->updateLevel($user);

            $user->save();

            // 3. Ghi lịch sử
            LoyaltyTransaction::create([
                'user_id' => $user->id,
                'order_id' => $orderId,
                'points' => $pointsToEarn,
                'type' => 'earn',
                'description' => "Tích điểm từ đơn hàng #" . ($orderId ?? "N/A"),
            ]);

            return $pointsToEarn;
        });
    }

    /**
     * Tiêu điểm để giảm giá.
     */
    public function redeemPoints(User $user, $pointsToRedeem, $orderId = null)
    {
        if ($user->points < $pointsToRedeem) {
            throw new \Exception("Không đủ điểm để sử dụng.");
        }

        return DB::transaction(function () use ($user, $pointsToRedeem, $orderId) {
            $user->points -= $pointsToRedeem;
            $user->save();

            LoyaltyTransaction::create([
                'user_id' => $user->id,
                'order_id' => $orderId,
                'points' => -$pointsToRedeem,
                'type' => 'redeem',
                'description' => "Sử dụng điểm cho đơn hàng #" . ($orderId ?? "N/A"),
            ]);

            return $pointsToRedeem * self::REDEMPTION_RATE;
        });
    }

    /**
     * Cập nhật hạng thành viên dựa trên tổng điểm đã tích lũy.
     */
    public function updateLevel(User $user)
    {
        $total = $user->total_points_earned;
        $newLevel = 'bronze';

        if ($total >= self::TIER_THRESHOLDS['gold']) {
            $newLevel = 'gold';
        } elseif ($total >= self::TIER_THRESHOLDS['silver']) {
            $newLevel = 'silver';
        }

        $user->loyalty_level = $newLevel;
        $user->save();
    }
}
