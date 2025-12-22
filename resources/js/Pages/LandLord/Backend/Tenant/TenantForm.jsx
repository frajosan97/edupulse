import { Head, Link, router, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/PortalLayout";
import {
    Card,
    Form,
    Button,
    Row,
    Col,
    ButtonGroup,
    InputGroup,
} from "react-bootstrap";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
    FiArrowLeftCircle,
    FiBook,
    FiGlobe,
    FiMail,
    FiPhone,
    FiMapPin,
} from "react-icons/fi";

import xios from "@/Utils/xios";
import Swal from "sweetalert2";
import useLocationCascade from "@/Hooks/useLocationCascade";
import Select from "react-select";

export default function TenantForm({ school = null, plans = [] }) {
    const formRef = useRef();
    const [processing, setProcessing] = useState(false);

    const isEditMode = school ? true : false;

    // Initialize location cascade with existing values if in edit mode
    const { selected, handleChange, counties, constituencies, wards } =
        useLocationCascade(
            isEditMode
                ? {
                      county_id: school?.county_id,
                      constituency_id: school?.constituency_id,
                      ward_id: school?.ward_id,
                  }
                : {}
        );

    // Initialize form data
    const { data, setData, put, reset } = useForm({
        name: school?.name || "",
        domain: school?.domain || "",
        email: school?.email || "",
        phone: school?.phone || "",
        address: school?.address || "",
        plan_id: school?.plan_id || 1,
        county_id: school?.county_id || "",
        constituency_id: school?.constituency_id || "",
        ward_id: school?.ward_id || "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setData(name, value);
    };

    const handleLocationChange = (key, value) => {
        handleChange(key, value);
        setData(key, value);
    };

    useEffect(() => {
        if (!formRef.current) return;

        $(formRef.current).validate({
            rules: {
                name: { required: true, minlength: 3, maxlength: 255 },
                domain: {
                    required: true,
                    minlength: 3,
                    maxlength: 50,
                    regex: /^[a-z0-9-.]+$/i,
                },
                email: { required: true, email: true, maxlength: 255 },
                phone: { required: true, minlength: 10, maxlength: 15 },
                address: { required: true, minlength: 5, maxlength: 500 },
                plan_id: { required: true },
                county_id: { required: true },
                constituency_id: { required: true },
                ward_id: { required: true },
            },
            messages: {
                domain: {
                    regex: "Domain can only contain letters, numbers and hyphens",
                },
            },
            errorClass: "is-invalid",
            validClass: "is-valid",
            errorPlacement: function (error, element) {
                error.addClass("invalid-feedback");
                element.closest(".form-group").append(error);
            },
        });

        $.validator.addMethod(
            "regex",
            function (value, element, regexp) {
                const re = new RegExp(regexp);
                return this.optional(element) || re.test(value);
            },
            "Please check your input."
        );
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!$(formRef.current).valid()) return;

        const confirm = await Swal.fire({
            title: isEditMode ? "Update school?" : "Create school?",
            text: isEditMode
                ? "Are you sure you want to update this school?"
                : "Are you sure you want to create this school?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: isEditMode ? "Yes, Update" : "Yes, Create",
        });

        if (!confirm.isConfirmed) return;

        setProcessing(true);
        
        Swal.fire({
            title: isEditMode ? "Updating..." : "Creating...",
            text: "Please wait",
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => Swal.showLoading(),
        });

        try {
            let response;
            if (isEditMode) {
                response = await xios.put(
                    route("admin.tenant.update", school?.id),
                    data
                );
            } else {
                response = await xios.post(route("admin.tenant.store"), data);
            }

            if (response.data.success === true) {
                toast.success(response.data.message);
                router.visit(route("admin.tenant.index"));
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            if (error.response?.data?.errors) {
                Object.values(error.response.data.errors).forEach(
                    (messages) => {
                        messages.forEach((message) => toast.error(message));
                    }
                );
            } else {
                toast.error(error.response?.data?.message);
            }
        } finally {
            setProcessing(false);
            Swal.close();
        }
    };

    const pageTitle = isEditMode ? `Edit ${school?.name}` : "Create New Tenant";
    const submitButtonText = processing
        ? isEditMode
            ? "Updating..."
            : "Creating..."
        : isEditMode
        ? "Update Tenant"
        : "Create Tenant";

    return (
        <AuthenticatedLayout>
            <Head title={pageTitle} />

            <div className="d-flex justify-content-between align-items-center">
                <h2 className="m-0 text-capitalize">{pageTitle}</h2>
                <ButtonGroup>
                    <Link
                        href={route("admin.tenant.index")}
                        className="btn btn-outline-primary"
                    >
                        <FiArrowLeftCircle className="me-2" />
                        Back to Tenants
                    </Link>
                </ButtonGroup>
            </div>

            <hr className="dashed-hr" />

            <Card>
                <Card.Body>
                    <Form ref={formRef} onSubmit={handleSubmit}>
                        <Card.Body>
                            <Row className="g-3">
                                {/* ---------------- Tenant Identity ---------------- */}
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="d-flex align-items-center">
                                            Tenant Name
                                        </Form.Label>
                                        <InputGroup className="border rounded">
                                            <InputGroup.Text className="border-0">
                                                <FiBook />
                                            </InputGroup.Text>
                                            <Form.Control
                                                name="name"
                                                type="text"
                                                value={data.name}
                                                onChange={handleInputChange}
                                                placeholder="Enter tenant name"
                                                className="border-0"
                                            />
                                        </InputGroup>
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="d-flex align-items-center">
                                            Domain
                                        </Form.Label>
                                        <InputGroup className="border rounded">
                                            <InputGroup.Text className="border-0">
                                                <FiGlobe />
                                            </InputGroup.Text>
                                            {isEditMode && school?.domains ? (
                                                school?.domains.map(
                                                    (domain, index) => (
                                                        <Form.Control
                                                            key={index}
                                                            name="domain"
                                                            type="text"
                                                            value={
                                                                domain.domain
                                                            }
                                                            onChange={
                                                                handleInputChange
                                                            }
                                                            placeholder="your-tenant"
                                                            readOnly={index > 0}
                                                            className="border-0"
                                                        />
                                                    )
                                                )
                                            ) : (
                                                <Form.Control
                                                    name="domain"
                                                    type="text"
                                                    value={data.domain}
                                                    onChange={handleInputChange}
                                                    placeholder="your-tenant"
                                                    className="border-0"
                                                />
                                            )}
                                        </InputGroup>
                                    </Form.Group>
                                </Col>

                                {/* ---------------- Contact Information ---------------- */}
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="d-flex align-items-center">
                                            Phone
                                        </Form.Label>
                                        <InputGroup className="border rounded">
                                            <InputGroup.Text className="border-0">
                                                <FiPhone />
                                            </InputGroup.Text>
                                            <Form.Control
                                                name="phone"
                                                type="tel"
                                                value={data.phone}
                                                onChange={handleInputChange}
                                                placeholder="+254 700 000000"
                                                className="border-0"
                                            />
                                        </InputGroup>
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="d-flex align-items-center">
                                            Email
                                        </Form.Label>
                                        <InputGroup className="border rounded">
                                            <InputGroup.Text className="border-0">
                                                <FiMail />
                                            </InputGroup.Text>
                                            <Form.Control
                                                name="email"
                                                type="email"
                                                value={data.email}
                                                onChange={handleInputChange}
                                                placeholder="tenant@example.com"
                                                className="border-0"
                                            />
                                        </InputGroup>
                                    </Form.Group>
                                </Col>

                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label className="d-flex align-items-center">
                                            Address
                                        </Form.Label>
                                        <InputGroup className="border rounded">
                                            <InputGroup.Text className="border-0">
                                                <FiMapPin />
                                            </InputGroup.Text>
                                            <Form.Control
                                                as="textarea"
                                                name="address"
                                                rows={1}
                                                value={data.address}
                                                onChange={handleInputChange}
                                                placeholder="Physical address of the tenant"
                                                className="border-0"
                                            />
                                        </InputGroup>
                                    </Form.Group>
                                </Col>

                                {/* ---------------- Subscription Info ---------------- */}
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label>Plan</Form.Label>
                                        <Select
                                            name="plan_id"
                                            value={
                                                plans
                                                    .map((plan) => ({
                                                        value: plan.id,
                                                        label: `${plan.name} - Ksh ${plan.price} / ${plan.period}`,
                                                    }))
                                                    .find(
                                                        (option) =>
                                                            option.value ===
                                                            data.plan_id
                                                    ) || null
                                            }
                                            onChange={(option) =>
                                                handleInputChange({
                                                    target: {
                                                        name: "plan_id",
                                                        value: option?.value,
                                                    },
                                                })
                                            }
                                            options={plans.map((plan) => ({
                                                value: plan.id,
                                                label: `${plan.name} - Ksh ${plan.price} / ${plan.period}`,
                                            }))}
                                            placeholder="-- Select Plan --"
                                        />
                                    </Form.Group>
                                </Col>

                                {/* ---------------- Location Info ---------------- */}
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label>County</Form.Label>
                                        <Select
                                            name="county_id"
                                            value={
                                                counties
                                                    .map((c) => ({
                                                        value: c.id,
                                                        label: c.name,
                                                    }))
                                                    .find(
                                                        (option) =>
                                                            option.value ===
                                                            data.county_id
                                                    ) || null
                                            }
                                            onChange={(option) =>
                                                handleLocationChange(
                                                    "county_id",
                                                    option?.value
                                                )
                                            }
                                            options={counties.map((c) => ({
                                                value: c.id,
                                                label: c.name,
                                            }))}
                                            placeholder="-- Select County --"
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label>Constituency</Form.Label>
                                        <Select
                                            name="constituency_id"
                                            value={
                                                constituencies
                                                    .map((c) => ({
                                                        value: c.id,
                                                        label: c.name,
                                                    }))
                                                    .find(
                                                        (option) =>
                                                            option.value ===
                                                            data.constituency_id
                                                    ) || null
                                            }
                                            onChange={(option) =>
                                                handleLocationChange(
                                                    "constituency_id",
                                                    option?.value
                                                )
                                            }
                                            options={constituencies.map(
                                                (c) => ({
                                                    value: c.id,
                                                    label: c.name,
                                                })
                                            )}
                                            placeholder="-- Select Constituency --"
                                            isDisabled={!data.county_id}
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label>Ward</Form.Label>
                                        <Select
                                            name="ward_id"
                                            value={
                                                wards
                                                    .map((w) => ({
                                                        value: w.id,
                                                        label: w.name,
                                                    }))
                                                    .find(
                                                        (option) =>
                                                            option.value ===
                                                            data.ward_id
                                                    ) || null
                                            }
                                            onChange={(option) =>
                                                handleLocationChange(
                                                    "ward_id",
                                                    option?.value
                                                )
                                            }
                                            options={wards.map((w) => ({
                                                value: w.id,
                                                label: w.name,
                                            }))}
                                            placeholder="-- Select Ward --"
                                            isDisabled={!data.constituency_id}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Card.Body>
                        <Card.Footer className="d-flex justify-content-between bg-transparent border-0">
                            {isEditMode ? (
                                <Link
                                    href={route("admin.tenant.index")}
                                    className="btn btn-outline-secondary"
                                >
                                    Cancel
                                </Link>
                            ) : (
                                <Button
                                    type="button"
                                    variant="danger"
                                    onClick={reset}
                                >
                                    Reset
                                </Button>
                            )}
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={processing}
                            >
                                {submitButtonText}
                            </Button>
                        </Card.Footer>
                    </Form>
                </Card.Body>
            </Card>
        </AuthenticatedLayout>
    );
}
