<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Invoice;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Invoice $invoice */
        $invoice = $this->route('invoice');

        return $this->user()->can('update', $invoice);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            // Header — all optional (PATCH semantics), but must be valid if present.
            'tenant_id' => [
                'sometimes',
                'string',
                Rule::exists('tenants', 'id')->whereNull('deleted_at'),
            ],
            'invoice_number' => [
                'sometimes',
                'nullable',
                'string',
                'max:64',
                Rule::unique('invoices', 'invoice_number')
                    ->ignore($this->route('invoice')?->id),
            ],
            'period_start' => ['sometimes', 'nullable', 'date'],
            'period_end' => ['sometimes', 'nullable', 'date', 'after_or_equal:period_start'],
            'invoice_date' => ['sometimes', 'date'],
            'due_date' => ['sometimes', 'date', 'after_or_equal:invoice_date'],
            'currency' => ['sometimes', 'string', 'size:3'],
            'description' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'status' => [
                'sometimes',
                Rule::in(['draft', 'issued', 'partially_paid', 'paid', 'cancelled']),
            ],

            // Items — optional, but if provided the whole set is replaced.
            'items' => ['sometimes', 'array', 'min:1'],
            'items.*.description' => ['required_with:items', 'string', 'max:500'],
            'items.*.module_id' => [
                'nullable',
                'integer',
                Rule::exists('modules', 'id')->whereNull('deleted_at'),
            ],
            'items.*.quantity' => ['required_with:items', 'numeric', 'gt:0'],
            'items.*.unit_price' => ['required_with:items', 'numeric', 'min:0'],
            'items.*.discount_amount' => ['nullable', 'numeric', 'min:0'],
            'items.*.tax_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function prepareForValidation(): array
    {
        $data = $this->all();

        if ($this->filled('currency')) {
            $data['currency'] = strtoupper((string) $this->input('currency'));
        }

        if (array_key_exists('description', $data) && $data['description'] === '') {
            $data['description'] = null;
        }

        if (isset($data['items']) && is_array($data['items'])) {
            $data['items'] = array_map(function ($item) {
                if (!is_array($item)) {
                    return $item;
                }
                foreach (['module_id', 'discount_amount', 'tax_rate'] as $key) {
                    if (array_key_exists($key, $item) && $item[$key] === '') {
                        $item[$key] = null;
                    }
                }
                return $item;
            }, $data['items']);
        }

        return $data;
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'items.min' => 'An invoice must have at least one line item.',
            'due_date.after_or_equal' => 'The due date cannot be before the invoice date.',
            'period_end.after_or_equal' => 'The period end cannot be before the period start.',
        ];
    }
}