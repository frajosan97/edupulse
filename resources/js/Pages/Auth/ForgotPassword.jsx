import { useForm, Head } from "@inertiajs/react";
import { Form, Button, Alert } from "react-bootstrap";
import GuestLayout from "@/Layouts/GuestLayout";

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("password.email"));
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <div className="mb-4 text-muted small">
                <i className="bi bi-info-circle me-2" />
                Forgot your password? No problem. Just let us know your email
                address and we will email you a password reset link that will
                allow you to choose a new one.
            </div>

            {status && (
                <Alert
                    variant="success"
                    className="d-flex align-items-center gap-2"
                >
                    <i className="bi bi-check-circle" />
                    {status}
                </Alert>
            )}

            <Form onSubmit={submit}>
                <Form.Group className="mb-3" controlId="email">
                    <Form.Label>
                        <i className="bi bi-envelope-fill me-2" />
                        Email
                    </Form.Label>
                    <Form.Control
                        type="email"
                        value={data.email}
                        autoComplete="email"
                        autoFocus
                        onChange={(e) => setData("email", e.target.value)}
                        isInvalid={!!errors.email}
                    />
                    {errors.email && (
                        <Form.Text className="text-danger">
                            {errors.email}
                        </Form.Text>
                    )}
                </Form.Group>

                <div className="d-flex justify-content-end">
                    <Button
                        variant="primary"
                        size="lg"
                        className="w-100"
                        type="submit"
                        disabled={processing}
                    >
                        <i className="bi bi-send me-1" />
                        Email Password Reset Link
                    </Button>
                </div>
            </Form>
        </GuestLayout>
    );
}
