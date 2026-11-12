<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Invoice;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Invoice::class);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            // Header
            'tenant_id' => [
                'required',
                'string',
                Rule::exists('tenants', 'id')->whereNull('deleted_at'),
            ],
            'invoice_number' => ['nullable', 'string', 'max:64', 'unique:invoices,invoice_number'],
            'period_start' => ['nullable', 'date'],
            'period_end' => ['nullable', 'date', 'after_or_equal:period_start'],
            'invoice_date' => ['required', 'date'],
            'due_date' => ['required', 'date', 'after_or_equal:invoice_date'],
            'currency' => ['nullable', 'string', 'size:3'],
            'description' => ['nullable', 'string', 'max:2000'],
            'status' => ['nullable', Rule::in(['draft', 'issued'])],

            // Items
            'items' => ['required', 'array', 'min:1'],
            'items.*.description' => ['required', 'string', 'max:500'],
            'items.*.module_id' => [
                'nullable',
                'integer',
                Rule::exists('modules', 'id')->whereNull('deleted_at'),
            ],
            'items.*.quantity' => ['required', 'numeric', 'gt:0'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
            'items.*.discount_amount' => ['nullable', 'numeric', 'min:0'],
            'items.*.tax_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ];
    }

    /**
     * Normalise payload before validation so numeric strings from the
     * front-end behave consistently and empty strings become null.
     *
     * @return array<string, mixed>
     */
    public function prepareForValidation(): array
    {
        $data = $this->all();

        $data['currency'] = $this->filled('currency')
            ? strtoupper((string) $this->input('currency'))
            : ($data['currency'] ?? 'KES');

        if (empty($data['description'])) {
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
                if (!array_key_exists('discount_amount', $item)) {
                    $item['discount_amount'] = 0;
                }
                if (!array_key_exists('tax_rate', $item)) {
                    $item['tax_rate'] = 0;
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
            'tenant_id.required' => 'Select a tenant for this invoice.',
            'items.required' => 'Add at least one line item to the invoice.',
            'items.min' => 'Add at least one line item to the invoice.',
            'due_date.after_or_equal' => 'The due date cannot be before the invoice date.',
            'period_end.after_or_equal' => 'The period end cannot be before the period start.',
        ];
    }
}