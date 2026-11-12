<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class PaymentAllocation extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'payment_id',
        'invoice_id',
        'invoice_item_id',
        'amount',
    ];

    protected $casts = [
        'amount' => 'decimal:2'
    ];

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }
    public function invoiceItem(): BelongsTo
    {
        return $this->belongsTo(InvoiceItem::class);
    }
}