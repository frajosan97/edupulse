<?php
// app/Services/ActivityLogger.php
namespace App\Services;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ActivityLogger
{
    public function logView(?Model $viewer, ?Model $subject, Request $request, ?string $description = null): void
    {
        if (!$subject) {
            return; // no subject = nothing to log
        }

        $description = $description ?? $this->generateViewDescription($subject);

        activity()
            ->causedBy($viewer)
            ->performedOn($subject)
            ->withProperties([
                'viewed_id' => $subject->getKey(),
                'viewed_type' => $this->getSubjectType($subject),
                'viewed_name' => $this->getSubjectName($subject),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent()
            ])
            ->log($description);
    }

    public function logCreate(?Model $creator, ?Model $subject, Request $request, array $data, ?string $description = null): void
    {
        if (!$subject) {
            return;
        }

        $description = $description ?? $this->generateCreateDescription($subject);

        activity()
            ->causedBy($creator)
            ->performedOn($subject)
            ->withProperties([
                'created_id' => $subject->getKey(),
                'created_type' => $this->getSubjectType($subject),
                'created_name' => $this->getSubjectName($subject),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_data' => $this->sanitizeData($data)
            ])
            ->log($description);
    }

    public function logUpdate(?Model $updater, ?Model $subject, Request $request, array $oldData, array $newData, ?string $description = null): void
    {
        if (!$subject) {
            return;
        }

        $description = $description ?? $this->generateUpdateDescription($subject);
        $changes = array_diff_assoc($newData, $oldData);

        activity()
            ->causedBy($updater)
            ->performedOn($subject)
            ->withProperties([
                'updated_id' => $subject->getKey(),
                'updated_type' => $this->getSubjectType($subject),
                'updated_name' => $this->getSubjectName($subject),
                'old_data' => $this->sanitizeData($oldData),
                'new_data' => $this->sanitizeData($newData),
                'changes' => $this->sanitizeData($changes),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent()
            ])
            ->log($description);
    }

    public function logDelete(?Model $deleter, ?Model $subject, Request $request, ?string $description = null): void
    {
        if (!$subject) {
            return;
        }

        $description = $description ?? $this->generateDeleteDescription($subject);

        activity()
            ->causedBy($deleter)
            ->withProperties([
                'deleted_id' => $subject->getKey(),
                'deleted_type' => $this->getSubjectType($subject),
                'deleted_name' => $this->getSubjectName($subject),
                'deleted_data' => $subject->toArray(),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent()
            ])
            ->log($description);
    }

    public function logAction(?Model $actor, ?Model $subject, string $action, array $properties = [], ?string $description = null): void
    {
        if (!$subject) {
            return;
        }

        $description = $description ?? $this->generateActionDescription($subject, $action);

        activity()
            ->causedBy($actor)
            ->performedOn($subject)
            ->withProperties(array_merge([
                'subject_id' => $subject->getKey(),
                'subject_type' => $this->getSubjectType($subject),
                'subject_name' => $this->getSubjectName($subject),
                'action' => $action
            ], $properties))
            ->log($description);
    }

    public function logCustom(?Model $actor, string $description, array $properties = [], ?Model $subject = null): void
    {
        $log = activity()->causedBy($actor)->withProperties($properties);

        if ($subject) {
            $log->performedOn($subject);
        }

        $log->log($description);
    }

    public function logError(?Model $actor, string $action, \Throwable $exception, Request $request, array $context = []): void
    {
        activity()
            ->causedBy($actor)
            ->withProperties([
                'action' => $action,
                'error' => $exception->getMessage(),
                'error_code' => $exception->getCode(),
                'error_file' => $exception->getFile(),
                'error_line' => $exception->getLine(),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'context' => $this->sanitizeData($context)
            ])
            ->log("{$action} action failed");
    }

    /*----------------------------------------------
    | Helper Methods
    |-----------------------------------------------*/

    protected function getSubjectType(?Model $subject): string
    {
        return $subject ? Str::snake(class_basename($subject)) : 'unknown';
    }

    protected function getSubjectName(?Model $subject): string
    {
        if (!$subject) {
            return 'unknown';
        }

        foreach (['name', 'title', 'email', 'username', 'first_name'] as $field) {
            if (isset($subject->{$field})) {
                return (string) $subject->{$field};
            }
        }

        return (string) $subject->getKey();
    }

    protected function generateViewDescription(?Model $subject): string
    {
        return "viewed {$this->getSubjectType($subject)}";
    }

    protected function generateCreateDescription(?Model $subject): string
    {
        return "created {$this->getSubjectType($subject)}";
    }

    protected function generateUpdateDescription(?Model $subject): string
    {
        return "updated {$this->getSubjectType($subject)}";
    }

    protected function generateDeleteDescription(?Model $subject): string
    {
        return "deleted {$this->getSubjectType($subject)}";
    }

    protected function generateActionDescription(?Model $subject, string $action): string
    {
        return "{$action} {$this->getSubjectType($subject)}";
    }

    protected function sanitizeData(array $data): array
    {
        foreach (['password', 'password_confirmation', 'token', 'secret', 'api_key', 'credit_card', 'cvv', 'ssn', 'pin'] as $field) {
            if (isset($data[$field])) {
                $data[$field] = '***REDACTED***';
            }
        }
        return $data;
    }
}
