import { useForm, Head, Link } from "@inertiajs/react";
import { Form, Button, Alert } from "react-bootstrap";
import GuestLayout from "@/Layouts/GuestLayout";

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("register"), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <Form onSubmit={submit}>
                <Form.Group className="mb-3" controlId="name">
                    <Form.Label>
                        <i className="bi bi-person-fill me-2" />
                        Name
                    </Form.Label>
                    <Form.Control
                        type="text"
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        autoComplete="name"
                        autoFocus
                        isInvalid={!!errors.name}
                        required
                    />
                    {errors.name && (
                        <Form.Text className="text-danger">
                            {errors.name}
                        </Form.Text>
                    )}
                </Form.Group>

                <Form.Group className="mb-3" controlId="email">
                    <Form.Label>
                        <i className="bi bi-envelope-fill me-2" />
                        Email
                    </Form.Label>
                    <Form.Control
                        type="email"
                        value={data.email}
                        onChange={(e) => setData("email", e.target.value)}
                        autoComplete="username"
                        isInvalid={!!errors.email}
                        required
                    />
                    {errors.email && (
                        <Form.Text className="text-danger">
                            {errors.email}
                        </Form.Text>
                    )}
                </Form.Group>

                <Form.Group className="mb-3" controlId="password">
                    <Form.Label>
                        <i className="bi bi-lock-fill me-2" />
                        Password
                    </Form.Label>
                    <Form.Control
                        type="password"
                        value={data.password}
                        onChange={(e) => setData("password", e.target.value)}
                        autoComplete="new-password"
                        isInvalid={!!errors.password}
                        required
                    />
                    {errors.password && (
                        <Form.Text className="text-danger">
                            {errors.password}
                        </Form.Text>
                    )}
                </Form.Group>

                <Form.Group className="mb-3" controlId="password_confirmation">
                    <Form.Label>
                        <i className="bi bi-shield-lock-fill me-2" />
                        Confirm Password
                    </Form.Label>
                    <Form.Control
                        type="password"
                        value={data.password_confirmation}
                        onChange={(e) =>
                            setData("password_confirmation", e.target.value)
                        }
                        autoComplete="new-password"
                        isInvalid={!!errors.password_confirmation}
                        required
                    />
                    {errors.password_confirmation && (
                        <Form.Text className="text-danger">
                            {errors.password_confirmation}
                        </Form.Text>
                    )}
                </Form.Group>

                <div className="d-flex justify-content-between align-items-center">
                    <Link
                        href={route("login")}
                        className="small text-muted text-decoration-none"
                    >
                        Already registered?
                    </Link>

                    <Button
                        variant="primary"
                        size="lg"
                        className="w-100"
                        type="submit"
                        disabled={processing}
                    >
                        <i className="bi bi-person-plus-fill me-1" />
                        Register
                    </Button>
                </div>
            </Form>
        </GuestLayout>
    );
}
