import { useForm, Head } from "@inertiajs/react";
import { Form, Button, Alert } from "react-bootstrap";
import GuestLayout from "@/Layouts/GuestLayout";

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: "",
        password_confirmation: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("password.store"), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <GuestLayout>
            <Head title="Reset Password" />

            <Form onSubmit={submit}>
                <Form.Control type="hidden" value={data.token} />

                {/* <Form.Group className="mb-3" controlId="email">
                    <Form.Label>
                        <i className="bi bi-envelope-fill me-2" />
                        Email
                    </Form.Label>
                    <Form.Control
                        type="email"
                        value={data.email}
                        autoComplete="username"
                        onChange={(e) => setData("email", e.target.value)}
                        isInvalid={!!errors.email}
                    />
                    {errors.email && (
                        <Form.Text className="text-danger">
                            {errors.email}
                        </Form.Text>
                    )}
                </Form.Group> */}

                <Form.Group className="mb-3" controlId="password">
                    <Form.Label>
                        <i className="bi bi-lock-fill me-2" />
                        New Password
                    </Form.Label>
                    <Form.Control
                        type="password"
                        value={data.password}
                        autoComplete="new-password"
                        onChange={(e) => setData("password", e.target.value)}
                        isInvalid={!!errors.password}
                    />
                    {errors.password && (
                        <Form.Text className="text-danger">
                            {errors.password}
                        </Form.Text>
                    )}
                </Form.Group>

                <Form.Group className="mb-4" controlId="password_confirmation">
                    <Form.Label>
                        <i className="bi bi-lock-fill me-2" />
                        Confirm Password
                    </Form.Label>
                    <Form.Control
                        type="password"
                        value={data.password_confirmation}
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData("password_confirmation", e.target.value)
                        }
                        isInvalid={!!errors.password_confirmation}
                    />
                    {errors.password_confirmation && (
                        <Form.Text className="text-danger">
                            {errors.password_confirmation}
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
                    <i className="bi bi-arrow-repeat me-1" />
                    Reset Password
                </Button>
            </Form>
        </GuestLayout>
    );
}
