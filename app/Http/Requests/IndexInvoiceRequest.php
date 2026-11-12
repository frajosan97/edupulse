<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class IndexInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('viewAny', \App\Models\Invoice::class);
    }

    /**
     * @return array{
     *     search: string,
     *     status: string,
     *     per_page: int,
     *     sort: string,
     *     direction: string,
     *     tenant_id: int|string|null,
     *     date_from: string|null,
     *     date_to: string|null,
     *     overdue: bool,
     * }
     */
    public function filters(): array
    {
        return [
            'search' => (string) $this->string('search', ''),
            'status' => (string) $this->string('status', ''),
            'per_page' => (int) $this->integer('per_page', 15),
            'sort' => (string) $this->string('sort', 'invoice_date'),
            'direction' => (string) $this->string('direction', 'desc'),
            'tenant_id' => $this->input('tenant_id'),
            'date_from' => $this->input('date_from'),
            'date_to' => $this->input('date_to'),
            'overdue' => $this->boolean('overdue'),
        ];
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'in:draft,issued,partially_paid,paid,overdue,cancelled'],
            'per_page' => ['nullable', 'integer', 'min:5', 'max:100'],
            'sort' => ['nullable', 'string', 'in:invoice_number,invoice_date,due_date,total,amount_paid,status,created_at'],
            'direction' => ['nullable', 'in:asc,desc'],
            'tenant_id' => ['nullable', 'integer', 'exists:tenants,id'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'overdue' => ['nullable', 'boolean'],
        ];
    }
}