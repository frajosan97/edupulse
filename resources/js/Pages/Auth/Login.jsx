import { useForm, Head, Link } from "@inertiajs/react";
import { Form, Button, Alert } from "react-bootstrap";
import GuestLayout from "@/Layouts/GuestLayout";

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("login"), {
            onFinish: () => reset("email", "password"),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

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
                        autoComplete="username"
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

                <Form.Group className="mb-3" controlId="password">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <Form.Label>
                            <i className="bi bi-lock-fill me-2" />
                            Password
                        </Form.Label>
                        <Form.Label>
                            <Link
                                href={route("password.request")}
                                className="small text-decoration-none text-muted"
                            >
                                <i className="bi bi-question-circle me-1" />
                                Forgot your password?
                            </Link>
                        </Form.Label>
                    </div>

                    <Form.Control
                        type="password"
                        value={data.password}
                        autoComplete="current-password"
                        onChange={(e) => setData("password", e.target.value)}
                        isInvalid={!!errors.password}
                    />
                    {errors.password && (
                        <Form.Text className="text-danger">
                            {errors.password}
                        </Form.Text>
                    )}
                </Form.Group>

                <Button
                    variant="primary"
                    size="lg"
                    className="w-100"
                    type="submit"
                    disabled={processing}
                >
                    <i className="bi bi-box-arrow-in-right me-1" />
                    Log in
                </Button>
            </Form>
        </GuestLayout>
    );
}
