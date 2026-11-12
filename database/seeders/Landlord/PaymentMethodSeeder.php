<?php

declare(strict_types=1);

namespace Database\Seeders\Landlord;

use Illuminate\Database\Seeder;
use App\Models\PaymentMethod;

class PaymentMethodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $methods = [
            [
                'code' => 'MPESA',
                'name' => 'M-Pesa',
                'icon' => '📲',
                'is_active' => true,
                'display_order' => 1,
                'settings' => [
                    'paybill_number' => null,
                    'mpesa_code' => null,
                    'mpesa_phone' => null,
                    'mpesa_amount' => null,
                    'mpesa_account' => null,
                ],
            ],
            [
                'code' => 'BANK_TRANSFER',
                'name' => 'Bank Transfer',
                'icon' => '🏦',
                'is_active' => true,
                'display_order' => 2,
                'settings' => [
                    'bank_name' => null,
                    'account_name' => null,
                    'account_number' => null,
                    'branch' => null,
                    'swift_code' => null,
                    'bank_reference' => null,
                    'transaction_date' => null,
                    'amount_sent' => null,
                ],
            ],
            [
                'code' => 'CHEQUE',
                'name' => 'Cheque',
                'icon' => '🧾',
                'is_active' => true,
                'display_order' => 3,
                'settings' => [
                    'cheque_number' => null,
                    'cheque_bank' => null,
                    'cheque_date' => null,
                    'cheque_amount' => null,
                    'payable_to' => null,
                    'cheque_status' => 'pending',
                    'clearance_date' => null,
                ],
            ],
            [
                'code' => 'CASH',
                'name' => 'Cash',
                'icon' => '💵',
                'is_active' => true,
                'display_order' => 4,
                'settings' => [
                    'cash_receipt_no' => null,
                    'received_by' => null,
                    'currency' => 'KES',
                    'amount_tendered' => null,
                    'change_given' => null,
                    'cashier_name' => null,
                    'location' => null,
                ],
            ],
        ];

        foreach ($methods as $method) {
            PaymentMethod::create($method);
        }
    }
}