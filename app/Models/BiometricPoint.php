<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class BiometricPoint extends Model
{
    use HasFactory, SoftDeletes;

    public const MODE_IN = 'check_in';
    public const MODE_OUT = 'check_out';
    public const MODE_BOTH = 'both';

    protected $fillable = [
        'name',
        'code',
        'location',
        'device_serial',
        'ip_address',
        'mode',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function logs(): HasMany
    {
        return $this->hasMany(AttendanceLog::class);
    }

    public function scopeActive($q)
    {
        return $q->where('is_active', true);
    }
}