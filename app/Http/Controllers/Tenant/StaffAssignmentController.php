<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\SyncTeacherClassesRequest;
use App\Http\Requests\Tenant\SyncTeacherSubjectsRequest;
use App\Models\Teacher;
use App\Models\TeacherClass;
use App\Models\TeacherSubject;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class StaffAssignmentController extends Controller
{
    /* -----------------------------------------------------------------
     | Classes — bulk sync
     |-----------------------------------------------------------------*/

    public function syncClasses(SyncTeacherClassesRequest $request, User $staff): RedirectResponse
    {
        $this->authorize('update', $staff);

        try {
            $data = $request->validated();

            DB::transaction(function () use ($staff, $data) {
                $teacher = $this->teacherFor($staff);

                $desired = collect($data['rows']);
                $desiredKeys = $desired->map(
                    fn($r) => "{$r['class_id']}|{$r['class_stream_id']}|{$r['level']}"
                )->all();

                TeacherClass::active()
                    ->where('teacher_id', $teacher->id)
                    ->where('term_id', $data['term_id'])
                    ->get()
                    ->each(function (TeacherClass $existing) use ($desiredKeys) {
                        $key = "{$existing->class_id}|{$existing->class_stream_id}|{$existing->level}";
                        if (!in_array($key, $desiredKeys, true)) {
                            $existing->update([
                                'is_active' => false,
                                'end_date' => now()->toDateString(),
                            ]);
                        }
                    });

                foreach ($desired as $row) {
                    TeacherClass::firstOrCreate(
                        [
                            'teacher_id' => $teacher->id,
                            'class_id' => $row['class_id'],
                            'class_stream_id' => $row['class_stream_id'],
                            'term_id' => $data['term_id'],
                            'role' => $row['role'] ?? 'primary',
                        ],
                        [
                            'academic_year_id' => $data['academic_year_id'],
                            'level' => $row['level'],
                            'is_active' => true,
                            'assigned_by' => auth()->id(),
                            'assigned_date' => now()->toDateString(),
                        ],
                    );
                }
            });

            return back()->with('success', 'Class assignments updated.');
        } catch (Throwable $e) {
            Log::error('Teacher class sync failed', [
                'staff_id' => $staff->id,
                'payload' => $request->all(),
                'error' => $e->getMessage(),
            ]);
            return back()->with('error', 'Failed to update class assignments.');
        }
    }

    /* -----------------------------------------------------------------
     | Subjects — bulk sync
     |-----------------------------------------------------------------*/

    public function syncSubjects(SyncTeacherSubjectsRequest $request, User $staff): RedirectResponse
    {
        $this->authorize('update', $staff);

        try {
            $data = $request->validated();

            DB::transaction(function () use ($staff, $data) {
                $teacher = $this->teacherFor($staff);

                $desired = collect($data['rows']);
                $desiredKeys = $desired->map(
                    fn($r) => "{$r['subject_id']}|{$r['class_id']}|{$r['class_stream_id']}"
                )->all();

                TeacherSubject::active()
                    ->where('teacher_id', $teacher->id)
                    ->where('term_id', $data['term_id'])
                    ->get()
                    ->each(function (TeacherSubject $existing) use ($desiredKeys) {
                        $key = "{$existing->subject_id}|{$existing->class_id}|{$existing->class_stream_id}";
                        if (!in_array($key, $desiredKeys, true)) {
                            $existing->update(['is_active' => false]);
                        }
                    });

                foreach ($desired as $row) {
                    TeacherSubject::updateOrCreate(
                        [
                            'teacher_id' => $teacher->id,
                            'subject_id' => $row['subject_id'],
                            'class_id' => $row['class_id'],
                            'class_stream_id' => $row['class_stream_id'],
                            'term_id' => $data['term_id'],
                        ],
                        [
                            'academic_year_id' => $data['academic_year_id'],
                            'role' => $row['role'] ?? 'primary',
                            'can_grade' => $row['can_grade'] ?? true,
                            'can_finalize_grades' => $row['can_finalize_grades'] ?? false,
                            'is_active' => true,
                            'assigned_by' => auth()->id(),
                        ],
                    );
                }
            });

            return back()->with('success', 'Subject assignments updated.');
        } catch (Throwable $e) {
            Log::error('Teacher subject sync failed', [
                'staff_id' => $staff->id,
                'payload' => $request->all(),
                'error' => $e->getMessage(),
            ]);
            return back()->with('error', 'Failed to update subject assignments.');
        }
    }

    /* -----------------------------------------------------------------
     | Helpers
     |-----------------------------------------------------------------*/

    private function teacherFor(User $staff): Teacher
    {
        return Teacher::firstOrCreate(
            ['user_id' => $staff->id],
            ['joining_date' => now()->toDateString()],
        );
    }
}