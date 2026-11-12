<?php

namespace App\Models\Tenant;

use App\Models\FeeStructureItem;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class InvoiceItem extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'invoice_id',
        'fee_structure_item_id',
        'name',
        'category',
        'unit_price',
        'quantity',
        'discount',
        'total',
        'notes',
        'sort_order',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'discount' => 'decimal:2',
        'total' => 'decimal:2',
        'quantity' => 'integer',
    ];

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }
    public function feeStructureItem(): BelongsTo
    {
        return $this->belongsTo(FeeStructureItem::class);
    }
}