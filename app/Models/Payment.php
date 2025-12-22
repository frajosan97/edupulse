<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'invoice_id',
        'school_id',
        'amount',
        'payment_date',
        'payment_method',
        'reference',
    ];

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function mpesa()
    {
        return $this->hasOne(MpesaPayment::class);
    }
}
