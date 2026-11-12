<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttendanceLog extends Model
{
    use HasFactory;

    public const TYPE_IN = 'check_in';
    public const TYPE_OUT = 'check_out';

    public const STATUS_MATCHED = 'matched';
    public const STATUS_UNMATCHED = 'unmatched';

    protected $fillable = [
        'biometric_point_id',
        'device_event_id',
        'user_id',
        'biometric_finger_id',
        'type',
        'scanned_hash',
        'scanned_at',
        'scan_date',
        'status',
    ];

    protected $casts = [
        'scanned_at' => 'datetime',
        'scan_date' => 'date',
    ];

    public function point(): BelongsTo
    {
        return $this->belongsTo(BiometricPoint::class, 'biometric_point_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function finger(): BelongsTo
    {
        return $this->belongsTo(BiometricFinger::class, 'biometric_finger_id');
    }

    public function scopeMatched(Builder $q): Builder
    {
        return $q->where('status', self::STATUS_MATCHED);
    }

    public function scopeForDate(Builder $q, $date): Builder
    {
        return $q->where('scan_date', $date);
    }

    public function scopeForUser(Builder $q, int $userId): Builder
    {
        return $q->where('user_id', $userId);
    }
}