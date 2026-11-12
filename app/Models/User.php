<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Tenant\Invoice;
use App\Models\Tenant\Payment;
use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

/**
 * @property int $id
 * @property string $first_name
 * @property string|null $other_name
 * @property string $last_name
 * @property string $name
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $phone
 * @property Carbon|null $phone_verified_at
 * @property 'male'|'female'|'other'|null $gender
 * @property string|null $avatar
 * @property string|null $signature
 * @property 'pending'|'active'|'inactive'|'suspended' $status
 * @property string $password
 * @property bool $password_changed
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 * @property-read string|null $avatar_url
 * @property-read string|null $signature_url
 * @property-read string $gender_label
 * @property-read string $status_label
 * @property-read bool $can_login
 * @property-read bool $isAdmin
 * @property-read bool $isSales
 * @property-read bool $isTeacher
 * @property-read bool $isStudent
 * @property-read bool $isParent
 * @property-read bool $isFinance
 */
#[Fillable([
    'first_name',
    'other_name',
    'last_name',
    'email',
    'phone',
    'gender',
    'avatar',
    'signature',
    'status',
    'password',
    'password_changed',
])]
#[Hidden([
    'password',
    'two_factor_secret',
    'two_factor_recovery_codes',
    'remember_token',
])]
class User extends Authenticatable implements MustVerifyEmail, PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, Notifiable, PasskeyAuthenticatable, SoftDeletes, TwoFactorAuthenticatable;

    /* -----------------------------------------------------------------
     | Role constants
     |-----------------------------------------------------------------*/

    public const ROLE_ADMIN = 'admin';
    public const ROLE_SALES = 'sales';
    public const ROLE_TEACHER = 'teacher';
    public const ROLE_STUDENT = 'student';
    public const ROLE_PARENT = 'parent';
    public const ROLE_FINANCE = 'finance';

    public const STAFF_ROLES = [
        self::ROLE_ADMIN,
        self::ROLE_SALES,
        self::ROLE_TEACHER,
        self::ROLE_FINANCE,
    ];

    /* -----------------------------------------------------------------
     | Status constants
     |-----------------------------------------------------------------*/

    public const STATUS_PENDING = 'pending';
    public const STATUS_ACTIVE = 'active';
    public const STATUS_INACTIVE = 'inactive';
    public const STATUS_SUSPENDED = 'suspended';

    public const LOGIN_STATUSES = [
        self::STATUS_ACTIVE,
    ];

    public const GENDERS = ['male', 'female', 'other'];

    /**
     * The `name` column is a MySQL generated column.
     * Never allow it to be mass-assigned — MySQL rejects inserts/updates to it.
     */
    protected $guarded = ['name'];

    /**
     * Virtual attributes appended to array/JSON output.
     *
     * Only append URLs — never append expensive relations like `roles`
     * (that would lazy-load on every serialization and cause N+1).
     *
     * @var list<string>
     */
    protected $appends = [
        'avatar_url',
        'signature_url',
    ];

    /* -----------------------------------------------------------------
     | Casts
     |-----------------------------------------------------------------*/

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'password' => 'hashed',
            'password_changed' => 'boolean',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    /* -----------------------------------------------------------------
     | Gender accessor
     |-----------------------------------------------------------------*/

    protected function genderLabel(): Attribute
    {
        return Attribute::get(function (): string {
            return match ($this->attributes['gender'] ?? null) {
                'male' => 'Male',
                'female' => 'Female',
                'other' => 'Other',
                default => 'Not specified',
            };
        });
    }

    /* -----------------------------------------------------------------
     | Status accessors
     |-----------------------------------------------------------------*/

    protected function statusLabel(): Attribute
    {
        return Attribute::get(function (): string {
            return match ($this->attributes['status'] ?? null) {
                self::STATUS_PENDING => 'Pending',
                self::STATUS_ACTIVE => 'Active',
                self::STATUS_INACTIVE => 'Inactive',
                self::STATUS_SUSPENDED => 'Suspended',
                default => 'Unknown',
            };
        });
    }

    protected function canLogin(): Attribute
    {
        return Attribute::get(
            fn(): bool =>
                $this->status === self::STATUS_ACTIVE
                && $this->email_verified_at !== null
                && $this->deleted_at === null
        );
    }

    /* -----------------------------------------------------------------
     | Media URL accessors (nullable)
     |-----------------------------------------------------------------*/

    protected function avatarUrl(): Attribute
    {
        return Attribute::get(function (): ?string {
            $path = $this->attributes['avatar'] ?? null;

            if (!$path) {
                return null;
            }

            return asset(Storage::url($path));
        });
    }

    protected function signatureUrl(): Attribute
    {
        return Attribute::get(function (): ?string {
            $path = $this->attributes['signature'] ?? null;

            if (!$path) {
                return null;
            }

            return Storage::url($path);
        });
    }

    /* -----------------------------------------------------------------
     | Relationships
     |-----------------------------------------------------------------*/

    public function teacher(): HasOne
    {
        return $this->hasOne(Teacher::class, 'user_id');
    }

    public function student(): HasOne
    {
        return $this->hasOne(Student::class);
    }

    public function parent(): HasMany
    {
        return $this->hasMany(User::class, 'parent_id');
    }

    public function departmentHead(): HasOne
    {
        return $this->hasOne(Department::class, 'head_id');
    }

    public function children(): BelongsToMany
    {
        return $this->belongsToMany(
            Student::class,
            'parent_student',
            'parent_id',
            'student_id'
        )->withPivot('relationship_type', 'is_primary')->withTimestamps();
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class, 'created_by');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'received_by');
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class, 'requested_by');
    }

    public function biometricFingers(): HasMany
    {
        return $this->hasMany(BiometricFinger::class);
    }

    public function attendanceLogs(): HasMany
    {
        return $this->hasMany(AttendanceLog::class);
    }

    /* -----------------------------------------------------------------
     | Role accessors
     |-----------------------------------------------------------------*/

    protected function isAdmin(): Attribute
    {
        return Attribute::get(fn(): bool => $this->hasRole(self::ROLE_ADMIN));
    }

    protected function isSales(): Attribute
    {
        return Attribute::get(fn(): bool => $this->hasRole(self::ROLE_SALES));
    }

    protected function isTeacher(): Attribute
    {
        return Attribute::get(fn(): bool => $this->hasRole(self::ROLE_TEACHER));
    }

    protected function isStudent(): Attribute
    {
        return Attribute::get(fn(): bool => $this->hasRole(self::ROLE_STUDENT));
    }

    protected function isParent(): Attribute
    {
        return Attribute::get(fn(): bool => $this->hasRole(self::ROLE_PARENT));
    }

    protected function isFinance(): Attribute
    {
        return Attribute::get(fn(): bool => $this->hasRole(self::ROLE_FINANCE));
    }

    /* -----------------------------------------------------------------
     | Convenience helpers
     |-----------------------------------------------------------------*/

    public function isStaff(): bool
    {
        return $this->hasAnyRole(self::STAFF_ROLES);
    }

    public function primaryRole(): ?string
    {
        return $this->roles->first()?->name;
    }

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isSuspended(): bool
    {
        return $this->status === self::STATUS_SUSPENDED;
    }

    /**
     * Human-readable label for a role name.
     *
     * `head_of_department` → `Head of department`
     *
     * Non-static — callers must use an instance: `(new User)->roleLabel($name)`.
     */
    public function roleLabel(string $name): string
    {
        return ucfirst(str_replace('_', ' ', $name));
    }

    /**
     * Label for the user's primary role.
     */
    public function primaryRoleLabel(): ?string
    {
        $role = $this->primaryRole();

        return $role ? $this->roleLabel($role) : null;
    }

    /**
     * Roles as [{ value, label }] for selects / display.
     *
     * @return array<int, array{value: string, label: string}>
     */
    public function roleOptions(): array
    {
        return $this->roles
            ->map(fn($r) => [
                'value' => $r->name,
                'label' => $this->roleLabel($r->name),
            ])
            ->values()
            ->all();
    }
}