<?php

declare(strict_types=1);

namespace App\Http\Resources\Tenant;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Student
 */
class StudentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $isShow = $request->routeIs('students.show');

        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'admission_number' => $this->admission_number,
            'assessment_number' => $this->assessment_number,
            'date_of_birth' => $this->date_of_birth,
            'admission_date' => $this->admission_date,
            'kcpe_marks' => $this->kcpe_marks,
            'points' => $this->points,

            'curriculum_id' => $this->curriculum_id,
            'pathway_id' => $this->pathway_id,
            'class_id' => $this->class_id,
            'class_stream_id' => $this->class_stream_id,

            /* --------------------------------------------------------------
             | Base relationships (index + show)
             |------------------------------------------------------------- */

            'user' => $this->whenLoaded('user', fn() => [
                'id' => $this->user->id,
                'first_name' => $this->user->first_name,
                'other_name' => $this->user->other_name,
                'last_name' => $this->user->last_name,
                'name' => $this->user->name,
                'email' => $this->user->email,
                'phone' => $this->user->phone,
                'gender' => $this->user->gender,
                'gender_label' => $this->user->gender_label,
                'status' => $this->user->status,
                'status_label' => $this->user->status_label,
                'avatar_url' => $this->user->avatar_url,
            ]),

            'curriculum' => $this->whenLoaded('curriculum', fn() => $this->curriculum ? [
                'id' => $this->curriculum->id,
                'name' => $this->curriculum->name,
                'code' => $this->curriculum->code,
            ] : null),

            'pathway' => $this->whenLoaded('pathway', fn() => $this->pathway ? [
                'id' => $this->pathway->id,
                'name' => $this->pathway->name,
                'code' => $this->pathway->code,
            ] : null),

            'class' => $this->whenLoaded('class', fn() => $this->class ? [
                'id' => $this->class->id,
                'name' => $this->class->name,
            ] : null),

            'class_stream' => $this->whenLoaded('classStream', fn() => $this->classStream ? [
                'id' => $this->classStream->id,
                'name' => $this->classStream->stream?->name,
                'stream' => $this->classStream->stream?->name,
            ] : null),

            'parents' => $this->whenLoaded('parents', fn() => $this->parents->map(fn($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'relationship_type' => $p->pivot->relationship_type ?? null,
                'is_primary' => (bool) ($p->pivot->is_primary ?? false),
            ])->values()->all()),

            /* --------------------------------------------------------------
             | Show-only aggregates
             |------------------------------------------------------------- */

            $this->mergeWhen($isShow, fn() => [
                'subjects_count' => $this->whenCounted('activeSubjects'),

                'subjects' => $this->whenLoaded('activeSubjects', fn() => $this->activeSubjects
                    ->map(fn($s) => [
                        'id' => $s->id,
                        'name' => $s->name,
                        'code' => $s->code ?? null,
                    ])
                    ->values()
                    ->all()),

                /**
                 * Catalogue the student can be enrolled in — injected via
                 * `$student->setRelation('availableSubjects', ...)` in the
                 * controller's `availableSubjectsFor()` helper.
                 */
                'available_subjects' => $this->whenLoaded(
                    'availableSubjects',
                    fn() =>
                        $this->availableSubjects
                            ->map(fn($s) => [
                                'id' => $s->id,
                                'name' => $s->name,
                                'code' => $s->code ?? null,
                            ])
                            ->values()
                            ->all()
                ),

                'enrolled_subject_ids' => $this->whenLoaded(
                    'activeSubjects',
                    fn() =>
                        $this->activeSubjects->pluck('id')->values()->all()
                ),

                'assessments_count' => $this->assessments_count ?? null,
                'assessments_average_points' => $this->assessments_average_points ?? null,
                'assessments_average_grade' => $this->assessments_average_grade ?? null,

                'fees_billed' => $this->fees_billed ?? null,
                'fees_paid' => $this->fees_paid ?? null,
                'fees_balance' => $this->fees_balance ?? null,

                'attendance_present' => $this->attendance_present ?? 0,
                'attendance_absent' => $this->attendance_absent ?? 0,
                'attendance_total' => $this->attendance_total ?? 0,

                'notifications_count' => $this->notifications_count ?? null,

                'transactions' => $this->buildTransactions(),
            ]),

            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }

    /**
     * Merge invoices + payments into a single, newest-first list.
     *
     * @return list<array<string, mixed>>
     */
    private function buildTransactions(): array
    {
        $invoices = $this->relationLoaded('invoices')
            ? $this->invoices->map(fn($inv) => [
                'id' => $inv->id,
                'type' => 'invoice',
                'date' => $inv->issued_at?->toDateString(),
                'reference' => $inv->invoice_number ?? null,
                'description' => $inv->description ?? null,
                'amount' => (float) $inv->total,
                'status' => $inv->status ?? null,
            ])
            : collect();

        $payments = $this->relationLoaded('payments')
            ? $this->payments->map(fn($pay) => [
                'id' => $pay->id,
                'type' => 'payment',
                'date' => $pay->paid_at?->toDateString()
                    ?? $pay->created_at?->toDateString(),
                'reference' => $pay->reference ?? null,
                'description' => $pay->description
                    ?? ('Payment via ' . ($pay->method ?? 'N/A')),
                'amount' => (float) $pay->amount,
                'status' => $pay->status ?? 'completed',
            ])
            : collect();

        return $invoices
            ->merge($payments)
            ->sortByDesc('date')
            ->values()
            ->all();
    }
}