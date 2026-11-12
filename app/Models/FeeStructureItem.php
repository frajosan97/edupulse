<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class FeeStructureItem extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'fee_structure_id',
        'name',
        'category',
        'description',
        'amount',
        'is_mandatory',
        'is_prorated',
        'sort_order',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'is_mandatory' => 'boolean',
        'is_prorated' => 'boolean',
    ];

    public function feeStructure(): BelongsTo
    {
        return $this->belongsTo(FeeStructure::class);
    }
}