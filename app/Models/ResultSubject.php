<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Casts\Attribute;

class ResultSubject extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'result_id',
        'subject_id',
        'cat_1',
        'cat_1_outof',
        'cat_2',
        'cat_2_outof',
        'pp_1',
        'pp_1_outof',
        'pp_2',
        'pp_2_outof',
        'pp_3',
        'pp_3_outof',
        'score',
        'score_outof',
        'points',
        'grade',
        'rank',
        'rank_outof',
        'comment',
        'teacher_subject_id',
        'is_locked',
    ];

    protected $casts = [
        'cat_1' => 'decimal:2',
        'cat_1_outof' => 'decimal:2',
        'cat_2' => 'decimal:2',
        'cat_2_outof' => 'decimal:2',
        'pp_1' => 'decimal:2',
        'pp_1_outof' => 'decimal:2',
        'pp_2' => 'decimal:2',
        'pp_2_outof' => 'decimal:2',
        'pp_3' => 'decimal:2',
        'pp_3_outof' => 'decimal:2',
        'score' => 'decimal:2',
        'score_outof' => 'decimal:2',
        'points' => 'decimal:0',
        'rank' => 'integer',
        'rank_outof' => 'integer',
        'is_locked' => 'boolean',
    ];

    // ─── Relationships ───────────────────────────────────────────

    public function result(): BelongsTo
    {
        return $this->belongsTo(Result::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function teacherSubject(): BelongsTo
    {
        return $this->belongsTo(TeacherSubject::class);
    }

    // ─── Scopes ──────────────────────────────────────────────────

    public function scopeLocked($query)
    {
        return $query->where('is_locked', true);
    }

    public function scopeUnlocked($query)
    {
        return $query->where('is_locked', false);
    }

    public function scopeForResult($query, int $resultId)
    {
        return $query->where('result_id', $resultId);
    }

    public function scopeForSubject($query, int $subjectId)
    {
        return $query->where('subject_id', $subjectId);
    }

    // ─── Accessors / Helpers ─────────────────────────────────────

    /**
     * The percentage achieved for this subject.
     */
    protected function percentage(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (!$this->score_outof || $this->score_outof <= 0) {
                    return null;
                }
                return round(($this->score / $this->score_outof) * 100, 2);
            }
        );
    }

    public function isLocked(): bool
    {
        return (bool) $this->is_locked;
    }

    public function lock(): self
    {
        $this->update(['is_locked' => true]);
        return $this;
    }

    public function unlock(): self
    {
        $this->update(['is_locked' => false]);
        return $this;
    }
}