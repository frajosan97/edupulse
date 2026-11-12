import { ReactElement } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

/**
 * Wrap Swal with React content support — allows JSX in title/html.
 * Must be called ONCE at module scope, not inside a component.
 */
const MySwal = withReactContent(Swal);

/* -----------------------------------------------------------------
 | Theme tokens — align SweetAlert2 with your Tailwind palette
 |-----------------------------------------------------------------*/
const COLORS = {
    primary: '#2563eb',   // blue-600
    danger: '#dc2626',    // red-600
    muted: '#6b7280',     // gray-500
} as const;

/* -----------------------------------------------------------------
 | Base classes applied to every dialog
 |-----------------------------------------------------------------*/
const BASE_CLASSES = {
    popup: 'rounded-xl shadow-xl',
    title: 'text-lg font-semibold text-foreground',
    htmlContainer: 'text-sm text-muted-foreground',
    confirmButton:
        'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2',
    cancelButton:
        'inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted',
};

/* -----------------------------------------------------------------
 | Toast preset — for success/error/info/warning feedback
 |
 | IMPORTANT: toasts use Swal.mixin (NOT MySwal), because React
 | content is not supported in toast mode — pass strings only.
 |-----------------------------------------------------------------*/
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (el) => {
        el.addEventListener('mouseenter', Swal.stopTimer);
        el.addEventListener('mouseleave', Swal.resumeTimer);
    },
});

/* -----------------------------------------------------------------
 | Types
 |
 | NOTE: title/html/detail use `ReactElement | string` instead of
 | `ReactNode`. Reason: `sweetalert2-react-content` restricts those
 | props to `ReactElementOr<...>`, which rejects `null`, `undefined`,
 | and `boolean` — all part of `ReactNode`. Using the narrower type
 | keeps TypeScript happy at every call site.
 |-----------------------------------------------------------------*/
export interface ConfirmOptions {
    /** Dialog title — element or plain string. */
    title: ReactElement | string;
    /** Body content — element or plain string. */
    html?: ReactElement | string;
    /** Confirm button label. */
    confirmText?: string;
    /** Cancel button label. */
    cancelText?: string;
    /** Use the red danger color for the confirm button. */
    danger?: boolean;
    /** Predefined icon. Defaults to `warning`. */
    icon?: 'warning' | 'question' | 'info' | 'error' | 'success';
    /** Focus the cancel button on open — safer default for destructive actions. */
    focusCancel?: boolean;
}

export interface ConfirmDeleteOptions {
    /** Body content — element or plain string. */
    detail?: ReactElement | string;
    /** Confirm button label. Defaults to "Yes, delete". */
    confirmText?: string;
    /** Cancel button label. Defaults to "Keep". */
    cancelText?: string;
}

/* -----------------------------------------------------------------
 | Hook
 |-----------------------------------------------------------------*/
export function useAlerts() {
    /**
     * Confirm dialog — awaits the user's choice.
     *
     *   const ok = await alerts.confirm({ title: 'Are you sure?', danger: true });
     *   if (!ok) return;
     */
    const confirm = async (options: ConfirmOptions): Promise<boolean> => {
        const {
            title,
            html,
            confirmText = 'Confirm',
            cancelText = 'Cancel',
            danger = false,
            icon = 'warning',
            focusCancel = danger,
        } = options;

        const result = await MySwal.fire({
            title,
            html,
            icon,
            showCancelButton: true,
            confirmButtonText: confirmText,
            cancelButtonText: cancelText,
            confirmButtonColor: danger ? COLORS.danger : COLORS.primary,
            cancelButtonColor: COLORS.muted,
            reverseButtons: true,
            focusCancel,
            customClass: BASE_CLASSES,
        });

        return result.isConfirmed;
    };

    /**
     * Delete confirmation — pre-wired copy for soft/hard deletes.
     *
     *   const ok = await alerts.confirmDelete('Module A', {
     *     detail: <p>This is permanent.</p>,
     *   });
     */
    const confirmDelete = async (
        entityName: string,
        options: ConfirmDeleteOptions = {},
    ): Promise<boolean> => {
        const {
            detail,
            confirmText = 'Yes, delete',
            cancelText = 'Keep',
        } = options;

        return confirm({
            title: `Delete "${entityName}"?`,
            html: detail,
            confirmText,
            cancelText,
            danger: true,
            icon: 'warning',
            focusCancel: true,
        });
    };

    /**
     * Success toast.
     *
     *   alerts.success('Saved.');
     */
    const success = (message: string): void => {
        void Toast.fire({ icon: 'success', title: message });
    };

    /**
     * Error toast.
     */
    const error = (message: string): void => {
        void Toast.fire({ icon: 'error', title: message });
    };

    /**
     * Info toast.
     */
    const info = (message: string): void => {
        void Toast.fire({ icon: 'info', title: message });
    };

    /**
     * Warning toast.
     */
    const warning = (message: string): void => {
        void Toast.fire({ icon: 'warning', title: message });
    };

    /**
     * Simple alert — single confirm button, no cancel.
     *
     *   await alerts.alert('Coming soon');
     */
    const alert = async (
        title: ReactElement | string,
        html?: ReactElement | string,
    ): Promise<void> => {
        await MySwal.fire({
            title,
            html,
            icon: 'info',
            confirmButtonText: 'OK',
            confirmButtonColor: COLORS.primary,
            customClass: BASE_CLASSES,
        });
    };

    return {
        confirm,
        confirmDelete,
        success,
        error,
        info,
        warning,
        alert,
    };
}