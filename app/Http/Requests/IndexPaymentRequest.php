<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Payment;
use Illuminate\Foundation\Http\FormRequest;

class IndexPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('viewAny', Payment::class);
    }

    /**
     * @return array{
     *     search: string,
     *     status: string,
     *     per_page: int,
     *     sort: string,
     *     direction: string,
     *     invoice_id: int|string|null,
     *     date_from: string|null,
     *     date_to: string|null,
     * }
     */
    public function filters(): array
    {
        return [
            'search' => (string) $this->string('search', ''),
            'status' => (string) $this->string('status', ''),
            'per_page' => (int) $this->integer('per_page', 15),
            'sort' => (string) $this->string('sort', 'payment_date'),
            'direction' => (string) $this->string('direction', 'desc'),
            'invoice_id' => $this->input('invoice_id'),
            'date_from' => $this->input('date_from'),
            'date_to' => $this->input('date_to'),
        ];
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'in:pending,completed,paid,failed,refunded'],
            'per_page' => ['nullable', 'integer', 'min:5', 'max:100'],
            'sort' => ['nullable', 'string', 'in:amount,payment_date,status,created_at'],
            'direction' => ['nullable', 'in:asc,desc'],
            'invoice_id' => ['nullable', 'integer', 'exists:invoices,id'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
        ];
    }
}