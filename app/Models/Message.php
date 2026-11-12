<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Message extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'message_type',
        'message_id',
        'mobile',
        'message',
        'response_code',
        'response_description',
        'network_id',
    ];

    // Scopes
    public function scopeByMobile($query, $mobile)
    {
        return $query->where('mobile', $mobile);
    }

    public function scopeByStatus($query, $statusCode)
    {
        return $query->where('response_code', $statusCode);
    }

    public function scopeSuccessful($query)
    {
        return $query->where('response_code', 200);
    }
}