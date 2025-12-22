<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NavbarItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'navbar_id',
        'parent_id',
        'icon',
        'label',
        'path',
        'route_name',
        'route_parameters',
        'order',
        'is_active',
        'permissions',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'permissions' => 'array',
        'route_parameters' => 'array',
    ];

    public function navbar(): BelongsTo
    {
        return $this->belongsTo(Navbar::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(NavbarItem::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(NavbarItem::class, 'parent_id')->orderBy('order');
    }

    public function activeChildren(): HasMany
    {
        return $this->children()->where('is_active', true);
    }

    public function hasChildren(): bool
    {
        return $this->children()->exists();
    }

    public function isChild(): bool
    {
        return !is_null($this->parent_id);
    }

    // Get the actual URL for this item
    public function getUrl(): string
    {
        if ($this->route_name) {
            return route($this->route_name, $this->route_parameters ?? []);
        }

        return $this->path;
    }

    // Check if user has permissions to view this item
    public function userCanAccess($user): bool
    {
        if (empty($this->permissions)) {
            return true;
        }

        return $user->hasAnyPermission($this->permissions);
    }
}