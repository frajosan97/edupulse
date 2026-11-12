<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SchoolTheme extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'primary_color',
        'secondary_color',
        'accent_color',
        'text_color',
        'background_color',
        'is_default',
    ];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    // Scopes
    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }
}