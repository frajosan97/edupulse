<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Payment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Payment $payment */
        $payment = $this->route('payment');

        return $this->user()->can('update', $payment);
    }

    public function rules(): array
    {
        return [
            'payment_method_id' => [
                'sometimes',
                'nullable',
                'integer',
                Rule::exists('payment_methods', 'id'),
            ],
            'provider' => ['sometimes', 'nullable', 'string', 'max:64'],
            'status' => [
                'sometimes',
                Rule::in(['pending', 'completed', 'paid', 'failed', 'refunded']),
            ],
            'provider_transaction_id' => ['sometimes', 'nullable', 'string', 'max:128'],
            'reference' => ['sometimes', 'nullable', 'string', 'max:128'],
            'payer_name' => ['sometimes', 'nullable', 'string', 'max:128'],
            'payer_phone' => ['sometimes', 'nullable', 'string', 'max:20'],
            'notes' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'confirmed_at' => ['sometimes', 'nullable', 'date'],
            'processed_at' => ['sometimes', 'nullable', 'date'],

            // Dynamic settings validation
            'settings' => ['sometimes', 'nullable', 'array'],
            'settings.*' => ['nullable'],
        ];
    }

    public function prepareForValidation(): array
    {
        $data = $this->all();

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
}