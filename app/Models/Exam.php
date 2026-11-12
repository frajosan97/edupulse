<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Exam extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'term_id',
        'name',
        'code',
        'description',
        'start_date',
        'end_date',
        'is_published',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'is_published' => 'boolean',
    ];

    /**
     * Accessor-backed fields that must be present in every serialization.
     * Without this, `$exam->only([...])` and `$exam->toArray()` will omit
     * `status`, `status_label`, `status_color`, and `is_active`.
     */
    protected $appends = [
        'is_active',
        'status',
        'status_label',
        'status_color',
    ];

    // ─── Relationships ───────────────────────────────────────────

    public function term(): BelongsTo
    {
        return $this->belongsTo(Term::class);
    }

    /**
     * @return HasMany<ExamClass, $this>
     */
    public function examClasses(): HasMany
    {
        return $this->hasMany(ExamClass::class);
    }

    public function classes(): BelongsToMany
    {
        return $this->belongsToMany(Classes::class, 'exam_classes')
            ->withPivot([
                'class_stream_id',
                'level',
                'is_active',
                'assigned_date',
                'end_date',
                'notes',
                'assigned_by',
            ])
            ->withTimestamps();
    }

    public function results(): HasMany
    {
        return $this->hasMany(Result::class);
    }

    public static function currentId(): ?int
    {
        return static::query()
            ->orderByDesc('start_date')
            ->orderByDesc('id')
            ->value('id');
    }

    // ─── Scopes ──────────────────────────────────────────────────

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeUnPublished($query)
    {
        return $query->where('is_published', false);
    }

    public function scopeActive($query)
    {
        return $query->where('start_date', '<=', now())
            ->where(fn($q) => $q->whereNull('end_date')
                ->orWhere('end_date', '>=', now()));
    }

    public function scopeForTerm($query, int $termId)
    {
        return $query->where('term_id', $termId);
    }

    public function scopeScheduled($query)
    {
        return $query->where('start_date', '>', now());
    }

    public function scopeArchived($query)
    {
        return $query->onlyTrashed();
    }

    // ─── Accessors ───────────────────────────────────────────────

    protected function isActive(): Attribute
    {
        return Attribute::make(
            get: fn() => !$this->trashed()
                && $this->start_date
                && $this->start_date->isPast()
                && (!$this->end_date || $this->end_date->isFuture()),
        );
    }

    protected function status(): Attribute
    {
        return Attribute::make(get: function () {
            if ($this->trashed()) {
                return 'archived';
            }
            if ($this->is_published) {
                return 'published';
            }
            if ($this->start_date && $this->start_date->isFuture()) {
                return 'scheduled';
            }
            if ($this->end_date && $this->end_date->isFuture()) {
                return 'in_progress';
            }
            return 'draft';
        });
    }

    protected function statusLabel(): Attribute
    {
        return Attribute::make(get: fn() => match ($this->status) {
            'published' => 'Published',
            'scheduled' => 'Scheduled',
            'archived' => 'Archived',
            'in_progress' => 'In Progress',
            default => 'Draft',
        });
    }

    protected function statusColor(): Attribute
    {
        return Attribute::make(get: fn() => match ($this->status) {
            'published' => 'green',
            'scheduled' => 'blue',
            'archived' => 'gray',
            'in_progress' => 'yellow',
            default => 'yellow',
        });
    }

    public function isOngoing(): bool
    {
        return $this->is_active;
    }
}