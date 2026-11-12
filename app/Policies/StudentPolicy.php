<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Student;
use App\Models\User;

class StudentPolicy
{
    /**
     * Admins bypass all checks.
     */
    public function before(User $user, string $ability): ?bool
    {
        return $user->isAdmin ? true : null;
    }

    /**
     * Staff with visibility into the student roster.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole([
            User::ROLE_ADMIN,
            User::ROLE_SALES,
            User::ROLE_TEACHER,
            User::ROLE_FINANCE,
        ]);
    }

    /**
     * Teachers can only view students in classes/streams they teach.
     */
    public function view(User $user, Student $student): bool
    {
        if ($user->hasAnyRole([User::ROLE_SALES, User::ROLE_FINANCE])) {
            return true;
        }

        if ($user->isTeacher) {
            return $this->teacherHasStudent($user, $student);
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole([
            User::ROLE_ADMIN,
            User::ROLE_SALES,
        ]);
    }

    public function update(User $user, Student $student): bool
    {
        return $user->hasAnyRole([
            User::ROLE_ADMIN,
            User::ROLE_SALES,
        ]);
    }

    public function delete(User $user, Student $student): bool
    {
        return $user->isAdmin;
    }

    /* -----------------------------------------------------------------
     | Helpers
     |-----------------------------------------------------------------*/

    /**
     * A teacher may view a student only when assigned to their class
     * or stream (via the teacher_classes pivot).
     */
    private function teacherHasStudent(User $user, Student $student): bool
    {
        $teacher = $user->teacher;

        if (!$teacher) {
            return false;
        }

        return $teacher->classes()
            ->where('classes.id', $student->class_id)
            ->wherePivot('is_active', true)
            ->whereNull('teacher_classes.deleted_at')
            ->exists()
            || $teacher->classStreams()
                ->where('class_streams.id', $student->class_stream_id)
                ->wherePivot('is_active', true)
                ->whereNull('teacher_classes.deleted_at')
                ->exists();
    }
}