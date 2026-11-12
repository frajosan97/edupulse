<?php

declare(strict_types=1);

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

trait HasDateRange
{
    public function scopeWithinDateRange(Builder $query, ?string $from, ?string $to, string $column = 'created_at'): Builder
    {
        return $query
            ->when($from, fn(Builder $q) => $q->whereDate($column, '>=', $from))
            ->when($to, fn(Builder $q) => $q->whereDate($column, '<=', $to));
    }

    public function isWithinRange(?string $from, ?string $to, string $column = 'created_at'): bool
    {
        /** @var Model $this */
        $value = $this->{$column};

        return ($from === null || $value >= $from)
            && ($to === null || $value <= $to);
    }
}