<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SchoolContact extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'contact_type',
        'value',
        'display_order',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
        'display_order' => 'integer',
    ];

    /**
     * The possible contact types.
     */
    public const CONTACT_TYPES = [
        'phone' => 'Phone',
        'email' => 'Email',
        'address' => 'Address',
        'social' => 'Social Media',
    ];

    /**
     * Scope a query to only include active contacts.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to order by display order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('display_order')->orderBy('created_at');
    }

    /**
     * Get the contact type label.
     */
    public function getContactTypeLabelAttribute(): string
    {
        return self::CONTACT_TYPES[$this->contact_type] ?? $this->contact_type;
    }

    /**
     * Get the contact icon based on type.
     */
    public function getIconAttribute(): string
    {
        return match ($this->contact_type) {
            'phone' => 'phone',
            'email' => 'envelope',
            'address' => 'map-marker',
            'social' => 'share-alt',
            default => 'info-circle',
        };
    }
}