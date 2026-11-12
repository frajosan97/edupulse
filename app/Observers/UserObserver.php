<?php

namespace App\Observers;

use App\Models\User;
use Illuminate\Support\Facades\Storage;

class UserObserver
{
    private const DISK = 'public';

    /** Only on hard-delete — soft-deletes keep files for restore. */
    public function forceDeleted(User $user): void
    {
        $disk = Storage::disk(self::DISK);

        foreach ([$user->avatar, $user->signature] as $path) {
            if ($path && $disk->exists($path)) {
                $disk->delete($path);
            }
        }
    }
}