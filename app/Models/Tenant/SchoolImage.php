<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SchoolImage extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'image_type',
        'image_path',
        'alt_text',
        'caption',
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
     * The possible image types.
     */
    public const IMAGE_TYPES = [
        'logo' => 'Logo',
        'banner' => 'Banner',
        'background' => 'Background',
        'gallery' => 'Gallery',
        'stamp' => 'Stamp',
        'signature' => 'Signature',
    ];

    /**
     * Scope a query to only include active images.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query for a specific image type.
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('image_type', $type);
    }

    /**
     * Scope a query to order by display order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('display_order')->orderBy('created_at');
    }

    /**
     * Get the image type label.
     */
    public function getImageTypeLabelAttribute(): string
    {
        return self::IMAGE_TYPES[$this->image_type] ?? $this->image_type;
    }

    /**
     * Get the full image URL.
     */
    public function getImageUrlAttribute(): string
    {
        return asset('storage/' . $this->image_path);
    }

    /**
     * Get the thumbnail URL (assuming you have thumbnails).
     */
    public function getThumbnailUrlAttribute(): string
    {
        $path = str_replace('.', '_thumb.', $this->image_path);
        return file_exists(storage_path('app/public/' . $path))
            ? asset('storage/' . $path)
            : $this->image_url;
    }
}
