// resources/js/components/forms/student-form/shared/field-error.tsx
export function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return (
        <p className="mt-1.5 text-xs font-medium text-destructive" role="alert">
            {message}
        </p>
    );
}
