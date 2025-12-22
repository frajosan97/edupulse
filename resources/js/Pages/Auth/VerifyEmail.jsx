import { useForm, Head, Link } from "@inertiajs/react";
import { Form, Button, Alert } from "react-bootstrap";
import GuestLayout from "@/Layouts/GuestLayout";

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route("verification.send"));
    };

    return (
        <GuestLayout>
            <Head title="Email Verification" />

            <div className="mb-4 text-muted small">
                <i className="bi bi-envelope-check me-2" />
                Thanks for signing up! Before getting started, please verify
                your email address by clicking on the link we just sent you. If
                you didn't receive the email, we’ll gladly send you another.
            </div>

            {status === "verification-link-sent" && (
                <Alert
                    variant="success"
                    className="d-flex align-items-center gap-2"
                >
                    <i className="bi bi-check-circle" />A new verification link
                    has been sent to the email address you provided during
                    registration.
                </Alert>
            )}

            <Form onSubmit={submit}>
                <div className="d-flex justify-content-between align-items-center mt-4">
                    <Button
                        variant="primary"
                        size="lg"
                        type="submit"
                        disabled={processing}
                    >
                        <i className="bi bi-arrow-repeat me-1" />
                        Resend Verification Email
                    </Button>

                    <Link
                        href={route("logout")}
                        method="post"
                        as="button"
                        className="btn btn-link text-muted p-0"
                    >
                        <i className="bi bi-box-arrow-left me-1" />
                        Log Out
                    </Link>
                </div>
            </Form>
        </GuestLayout>
    );
}
