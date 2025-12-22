<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SchoolTheme extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'primary_color',
        'secondary_color',
        'accent_color',
        'text_color',
        'background_color',
        'is_default',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_default' => 'boolean',
    ];

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::creating(function ($theme) {
            // If this theme is set as default, remove default from others
            if ($theme->is_default) {
                self::where('is_default', true)->update(['is_default' => false]);
            }
        });

        static::updating(function ($theme) {
            // If this theme is being set as default, remove default from others
            if ($theme->is_default) {
                self::where('id', '!=', $theme->id)
                    ->where('is_default', true)
                    ->update(['is_default' => false]);
            }
        });
    }

    /**
     * Get the default theme.
     */
    public static function getDefault(): ?self
    {
        return self::where('is_default', true)->first();
    }

    /**
     * Set this theme as the default.
     */
    public function setAsDefault(): void
    {
        $this->update(['is_default' => true]);
    }

    /**
     * Get the theme colors as an array.
     */
    public function getColorsAttribute(): array
    {
        return [
            'primary' => $this->primary_color,
            'secondary' => $this->secondary_color,
            'accent' => $this->accent_color,
            'text' => $this->text_color,
            'background' => $this->background_color,
        ];
    }
}
