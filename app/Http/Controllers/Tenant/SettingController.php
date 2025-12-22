<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\SchoolContact;
use App\Models\Tenant\SchoolImage;
use App\Models\Tenant\SchoolTheme;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function manage()
    {
        $schoolInfo = tenant();

        $contacts = SchoolContact::all();
        $images = SchoolImage::all();
        $themes = SchoolTheme::first();

        $settingData = [
            'schoolInfo' => $schoolInfo,
            'contacts' => $contacts,
            'images' => $images,
            'themes' => $themes,
        ];

        return Inertia::render('Tenant/Backend/Setting/Manage', [
            'settingData' => $settingData
        ]);
    }

    public function backup()
    {
        return Inertia::render('Tenant/Backend/Setting/Backup');
    }
}
