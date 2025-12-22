<?php

namespace App\Models;

use App\Models\Tenant\Classes;
use App\Models\Tenant\ClassStream;
use App\Models\Tenant\Department;
use App\Models\Tenant\Leave;
use App\Models\Tenant\Payroll;
use App\Models\Tenant\Student;
use App\Models\Tenant\Teacher;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasRoles, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'token',
        'first_name',
        'last_name',
        'other_name',
        'email',
        'email_verified_at',
        'profile_image',
        'signature',
        'phone',
        'gender',
        'county_id',
        'constituency_id',
        'ward_id',
        'location_id',
        'is_active',
        'password',
        'password_changed',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password_changed' => 'boolean',  // This field doesn't exist in schema
        'is_active' => 'boolean',
    ];

    public function county(): BelongsTo
    {
        return $this->belongsTo(County::class);
    }

    public function constituency(): BelongsTo
    {
        return $this->belongsTo(Constituency::class);
    }

    public function ward(): BelongsTo
    {
        return $this->belongsTo(Ward::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function teacher()
    {
        return $this->hasOne(Teacher::class);
    }

    public function student()
    {
        return $this->hasOne(Student::class);
    }

    public function parent()
    {
        return $this->hasMany(User::class, 'parent_id');
    }

    public function departmentHead()
    {
        return $this->hasOne(Department::class, 'head_id');
    }

    public function classTeacher()
    {
        return $this->hasOne(Classes::class, 'class_teacher_id');
    }

    public function assistantTeacher()
    {
        return $this->hasOne(Classes::class, 'assistant_teacher_id');
    }

    public function classStreamTeacher()
    {
        return $this->hasOne(ClassStream::class, 'class_teacher_id');
    }

    public function classStreamAssistantTeacher()
    {
        return $this->hasOne(ClassStream::class, 'assistant_teacher_id');
    }

    public function leaves()
    {
        return $this->hasMany(Leave::class);
    }

    public function payrolls()
    {
        return $this->hasMany(Payroll::class);
    }

    public function scopeByRoles($query, string|array $roles)
    {
        return $query->role($roles);
    }

    public function children()
    {
        return $this->belongsToMany(
            Student::class,
            'parent_student',
            'parent_id',
            'student_id'
        )->withPivot('relationship_type', 'is_primary')->withTimestamps();
    }
}
