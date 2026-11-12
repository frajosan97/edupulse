<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SchoolImage extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'image_type',
        'image_path',
        'image_id',
        'delete_url',
        'image_size',
        'image_width',
        'image_height',
        'alt_text',
        'caption',
        'display_order',
        'is_active',
    ];

    protected $casts = [
        'image_size' => 'integer',
        'image_width' => 'integer',
        'image_height' => 'integer',
        'display_order' => 'integer',
        'is_active' => 'boolean',
    ];

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('display_order');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('image_type', $type);
    }

    public static function getLogo()
    {
        return self::active()
            ->byType('logo')
            ->ordered()
            ->value('image_path');
    }
}