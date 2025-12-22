import { useForm, Head } from "@inertiajs/react";
import { Form, Button, Alert } from "react-bootstrap";
import GuestLayout from "@/Layouts/GuestLayout";

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("password.confirm"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <GuestLayout>
            <Head title="Confirm Password" />

            <div className="mb-4 text-muted small">
                <i className="bi bi-shield-lock me-2" />
                This is a secure area of the application. Please confirm your
                password before continuing.
            </div>

            <Form onSubmit={submit}>
                <Form.Group className="mb-4" controlId="password">
                    <Form.Label>
                        <i className="bi bi-lock-fill me-2" />
                        Password
                    </Form.Label>
                    <Form.Control
                        type="password"
                        value={data.password}
                        autoComplete="current-password"
                        autoFocus
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
                    <i className="bi bi-shield-check me-1" />
                    Confirm
                </Button>
            </Form>
        </GuestLayout>
    );
}
