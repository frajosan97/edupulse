<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DemoRequest extends Model
{
    protected $fillable = [
        'full_name',
        'phone',
        'email',
        'school',
        'interest',
        'message',
        'status',
        'contacted_at',
    ];

    protected $casts = [
        'contacted_at' => 'datetime',
    ];

    // pending
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
}