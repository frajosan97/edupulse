<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Permission extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'name',
        'description',
    ];

    /**
     * Users assigned to this permission.
     */

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_permissions');
    }
}
