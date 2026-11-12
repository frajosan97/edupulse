<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExamClass extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'exam_id',
        'class_id',
        'class_stream_id',
        'level',
        'is_active',
        'assigned_date',
        'end_date',
        'notes',
        'assigned_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'assigned_date' => 'date',
        'end_date' => 'date',
        'level' => 'string',
    ];

    // ─── Relationships ───────────────────────────────────────────

    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }

    public function class(): BelongsTo
    {
        return $this->belongsTo(Classes::class, 'class_id');
    }

    public function classStream(): BelongsTo
    {
        return $this->belongsTo(ClassStream::class, 'class_stream_id');
    }

    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    public function results(): HasMany
    {
        return $this->hasMany(Result::class);
    }

    // ─── Scopes ──────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForClass($query, int $classId)
    {
        return $query->where('class_id', $classId);
    }

    public function scopeForStream($query, ?int $streamId)
    {
        return $query->where('class_stream_id', $streamId);
    }

    public function scopeLevel($query, string $level)
    {
        return $query->where('level', $level);
    }

    // ─── Helpers ─────────────────────────────────────────────────

    public function isStreamLevel(): bool
    {
        return $this->level === 'stream';
    }
}