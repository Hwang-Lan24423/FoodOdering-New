<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name', 'category', 'price', 'description', 'quantity', 'image', 'code', 'status'
    ];

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}
