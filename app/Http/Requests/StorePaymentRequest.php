<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Payment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Payment::class);
    }

    public function rules(): array
    {
        return [
            'invoice_id' => [
                'required',
                'integer',
                Rule::exists('invoices', 'id')->whereNull('deleted_at'),
            ],
            'payment_method_id' => [
                'nullable',
                'integer',
                Rule::exists('payment_methods', 'id'),
            ],
            'provider' => ['nullable', 'string', 'max:64'],
            'currency' => ['nullable', 'string', 'size:3'],
            'amount' => ['required', 'numeric', 'gt:0'],
            'payment_date' => ['required', 'date'],
            'status' => [
                'nullable',
                Rule::in(['pending', 'completed', 'paid', 'failed', 'refunded']),
            ],
            'provider_transaction_id' => ['nullable', 'string', 'max:128'],
            'reference' => ['nullable', 'string', 'max:128'],
            'payer_name' => ['nullable', 'string', 'max:128'],
            'payer_phone' => ['nullable', 'string', 'max:20'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'confirmed_at' => ['nullable', 'date'],
            'processed_at' => ['nullable', 'date'],

            // Dynamic settings validation
            'settings' => ['nullable', 'array'],
            'settings.*' => ['nullable'], // Allow any type (string, number, null)
        ];
    }

    public function prepareForValidation(): array
    {
        $data = $this->all();

        if ($this->filled('currency')) {
            $data['currency'] = strtoupper((string) $this->input('currency'));
        }

        foreach ([
            'payment_method_id',
            'provider',
            'provider_transaction_id',
            'reference',
            'payer_name',
            'payer_phone',
            'notes'
        ] as $key) {
            if (array_key_exists($key, $data) && $data[$key] === '') {
                $data[$key] = null;
            }
        }

        return $data;
    }

    public function messages(): array
    {
        return [
            'invoice_id.required' => 'Select the invoice this payment settles.',
            'amount.gt' => 'Payment amount must be greater than zero.',
        ];
    }
}