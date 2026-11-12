<?php

use App\Providers\AppServiceProvider;
use App\Providers\TenancyServiceProvider;
use App\Providers\FortifyServiceProvider;

return [
    AppServiceProvider::class,
    TenancyServiceProvider::class,
    FortifyServiceProvider::class,
];
