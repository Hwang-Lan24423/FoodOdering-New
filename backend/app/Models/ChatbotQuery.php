<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatbotQuery extends Model
{
    protected $fillable = [
        'queries', 'replies'
    ];
}
