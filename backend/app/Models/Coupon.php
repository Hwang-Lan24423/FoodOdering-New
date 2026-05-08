<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

/**
 * @property int $id
 * @property string $code
 * @property string $type
 * @property float $value
 * @property float|null $min_order_value
 * @property int|null $usage_limit
 * @property int $used_count
 * @property \Illuminate\Support\Carbon $expiry_date
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 */
class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'type',
        'value',
        'min_order_value',
        'usage_limit',
        'used_count',
        'expiry_date',
        'is_active'
    ];

    protected $casts = [
        'expiry_date' => 'date',
        'is_active' => 'boolean',
        'value' => 'float',
        'min_order_value' => 'float',
    ];

    /**
     * Check if the coupon is valid.
     */
    public function isValid($orderAmount = 0)
    {
        // 1. Check if active
        if (!$this->is_active) return false;

        // 2. Check expiry
        if ($this->expiry_date->lt(now()->startOfDay())) return false;

        // 3. Check usage limit
        if ($this->usage_limit !== null && $this->used_count >= $this->usage_limit) return false;

        // 4. Check min order value
        if ($orderAmount < $this->min_order_value) return false;

        return true;
    }

    /**
     * Calculate discount amount.
     */
    public function calculateDiscount($orderAmount)
    {
        if ($this->type === 'fixed') {
            return min($this->value, $orderAmount);
        } else {
            return ($this->value / 100) * $orderAmount;
        }
    }
}
