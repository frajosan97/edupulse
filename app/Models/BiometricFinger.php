<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class BiometricFinger extends Model
{
    use HasFactory, SoftDeletes;

    public const FINGERS = [
        'right_thumb',
        'right_index',
        'right_middle',
        'right_ring',
        'right_pinky',
        'left_thumb',
        'left_index',
        'left_middle',
        'left_ring',
        'left_pinky',
    ];

    public const STATUS_ACTIVE = 'active';
    public const STATUS_REVOKED = 'revoked';

    protected $fillable = [
        'user_id',
        'finger',
        'template',
        'template_hash',
        'quality',
        'status',
        'enrolled_by',
        'enrolled_at',
        'revoked_at',
        'revoked_by',
        'revoke_reason',
    ];

    protected $casts = [
        'quality' => 'integer',
        'enrolled_at' => 'datetime',
        'revoked_at' => 'datetime',
    ];

    protected $hidden = ['template'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function logs(): HasMany
    {
        return $this->hasMany(AttendanceLog::class);
    }

    public function scopeActive($q)
    {
        return $q->where('status', self::STATUS_ACTIVE);
    }

    public function revoke(?int $by = null, ?string $reason = null): void
    {
        $this->forceFill([
            'status' => self::STATUS_REVOKED,
            'revoked_at' => now(),
            'revoked_by' => $by,
            'revoke_reason' => $reason,
        ])->save();
    }
}