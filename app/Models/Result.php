<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $exam_id
 * @property int $exam_class_id
 * @property int $class_id
 * @property int|null $class_stream_id
 * @property int $student_id
 * @property string $total_marks
 * @property string $mean_marks
 * @property string $total_points
 * @property string $mean_points
 * @property string|null $mean_grade
 * @property int|null $class_rank
 * @property int|null $stream_rank
 * @property bool $is_published
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 *
 * @property-read Exam|null $exam
 * @property-read ExamClass|null $examClass
 * @property-read Classes|null $class
 * @property-read ClassStream|null $classStream
 * @property-read Student|null $student
 * @property-read \Illuminate\Database\Eloquent\Collection<int, ResultSubject> $resultSubjects
 * @property-read \Illuminate\Database\Eloquent\Collection<int, Subject> $subjects
 *
 * @method static Builder<static> query()
 * @method static Builder<static> where(string $column, mixed $operator = null, mixed $value = null, string $boolean = 'and')
 * @method static Builder<static> whereIn(string $column, mixed $values, string $boolean = 'and', bool $not = false)
 * @method static Builder<static> whereNull(string $column, string $boolean = 'and', bool $not = false)
 * @method static Builder<static> whereNotNull(string $column, string $boolean = 'and')
 * @method static Builder<static> with(string|array $relations)
 * @method static Builder<static> orderBy(string $column, string $direction = 'asc')
 * @method static Builder<static> orderByDesc(string $column)
 * @method static Builder<static> published()
 * @method static Builder<static> forExam(int $examId)
 * @method static Builder<static> forCurrentExam()
 * @method static Builder<static> forStudent(int $studentId)
 * @method static Builder<static> forClass(int $classId)
 * @method static Builder<static> orderedByRank()
 * @method static Result|null find(mixed $id)
 * @method static Result findOrFail(mixed $id)
 * @method static Result create(array $attributes = [])
 * @method static Result firstOrCreate(array $attributes = [], array $values = [])
 * @method static \Illuminate\Database\Eloquent\Collection<int, static> all(array|string $columns = ['*'])
 * @method static \Illuminate\Database\Eloquent\Collection<int, static> get(array|string $columns = ['*'])
 *
 * @mixin Builder<static>
 */
class Result extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'exam_id',
        'exam_class_id',
        'class_id',
        'class_stream_id',
        'student_id',
        'total_marks',
        'mean_marks',
        'total_points',
        'mean_points',
        'mean_grade',
        'class_rank',
        'stream_rank',
        'is_published',
    ];

    protected $casts = [
        'total_marks' => 'decimal:2',
        'mean_marks' => 'decimal:2',
        'total_points' => 'decimal:2',
        'mean_points' => 'decimal:2',
        'is_published' => 'boolean',
        'class_rank' => 'integer',
        'stream_rank' => 'integer',
    ];

    // ─── Relationships ───────────────────────────────────────────

    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }

    public function examClass(): BelongsTo
    {
        return $this->belongsTo(ExamClass::class);
    }

    public function class(): BelongsTo
    {
        return $this->belongsTo(Classes::class, 'class_id');
    }

    public function classStream(): BelongsTo
    {
        return $this->belongsTo(ClassStream::class, 'class_stream_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function resultSubjects(): HasMany
    {
        return $this->hasMany(ResultSubject::class);
    }

    public function subjects(): HasManyThrough
    {
        return $this->hasManyThrough(
            Subject::class,
            ResultSubject::class,
            'result_id',
            'id',
            'id',
            'subject_id'
        );
    }

    // ─── Scopes ──────────────────────────────────────────────────

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeForExam($query, int $examId)
    {
        return $query->where('exam_id', $examId);
    }

    /**
     * Scope results to the current exam (latest by exam_date).
     * Status-agnostic.
     *
     * Safe when no exams exist: yields an empty set rather than
     * accidentally returning every row (which is what a null
     * `where('exam_id', null)` would produce).
     */
    public function scopeForCurrentExam($query)
    {
        $id = Exam::currentId();

        return $id
            ? $query->where('exam_id', $id)
            : $query->whereRaw('1 = 0');
    }

    public function scopeForStudent($query, int $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    public function scopeForClass($query, int $classId)
    {
        return $query->where('class_id', $classId);
    }

    public function scopeOrderedByRank($query)
    {
        return $query->orderBy('class_rank');
    }

    // ─── Accessors / Helpers ─────────────────────────────────────

    protected function percentage(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->mean_marks,
        );
    }

    public function isPublished(): bool
    {
        return (bool) $this->is_published;
    }
}