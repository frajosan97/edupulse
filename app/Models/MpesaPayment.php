<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MpesaPayment extends Model
{
    protected $fillable = [
        'payment_id',
        'transaction_id',
        'phone_number',
        'amount',
        'transaction_time',
    ];

    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }
}
