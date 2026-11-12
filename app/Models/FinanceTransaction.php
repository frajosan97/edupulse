<?php
// app/Models/FinanceTransaction.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinanceTransaction extends Model
{
    use HasFactory;

    public const DIRECTION_IN = 'inflow';
    public const DIRECTION_OUT = 'outflow';

    public $timestamps = true;
    protected $guarded = [];

    protected $casts = [
        'amount' => 'decimal:2',
        'transaction_date' => 'date',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }
}