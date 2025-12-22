<?php

namespace App\Models\Tenant;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SchoolSlide extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title',
        'description',
        'image_path',
        'link_url',
        'link_text',
        'display_order',
        'is_active',
        'start_date',
        'end_date',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
        'display_order' => 'integer',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
    ];

    /**
     * Scope a query to only include active slides.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include currently active slides (within date range).
     */
    public function scopeCurrentlyActive($query)
    {
        $now = Carbon::now();

        return $query->where('is_active', true)
            ->where(function ($query) use ($now) {
                $query->whereNull('start_date')
                    ->orWhere('start_date', '<=', $now);
            })
            ->where(function ($query) use ($now) {
                $query->whereNull('end_date')
                    ->orWhere('end_date', '>=', $now);
            });
    }

    /**
     * Scope a query to order by display order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('display_order')->orderBy('created_at');
    }

    /**
     * Check if the slide is currently active.
     */
    public function getIsCurrentlyActiveAttribute(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        $now = Carbon::now();

        $startCondition = is_null($this->start_date) || $this->start_date <= $now;
        $endCondition = is_null($this->end_date) || $this->end_date >= $now;

        return $startCondition && $endCondition;
    }

    /**
     * Get the full image URL.
     */
    public function getImageUrlAttribute(): string
    {
        // return asset('storage/' . $this->image_path);
        return "/storage/" . $this->image_path;
    }

    /**
     * Check if the slide has a link.
     */
    public function getHasLinkAttribute(): bool
    {
        return !empty($this->link_url) && !empty($this->link_text);
    }
}
