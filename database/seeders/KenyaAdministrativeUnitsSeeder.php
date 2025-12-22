<?php

namespace Database\Seeders;

use App\Models\Constituency;
use App\Models\County;
use App\Models\Location;
use App\Models\Ward;
use Illuminate\Database\Seeder;

class KenyaAdministrativeUnitsSeeder extends Seeder
{
    public function run()
    {
        $path = database_path('seeders/data/csv-Kenya-Counties-Constituencies-Wards.csv');
        $file = fopen($path, 'r');

        // Skip the header row
        fgetcsv($file);

        while (($data = fgetcsv($file)) !== false) {
            list(
                $countyCode,
                $countyName,
                $constituencyCode,
                $constituencyName,
                $wardCode,
                $wardName
            ) = $data;

            // Insert or retrieve the county
            County::updateOrInsert(
                ['code' => $countyCode],
                [
                    'name' => $countyName,
                    'updated_at' => now(),
                    'created_at' => now()
                ]
            );

            // Retrieve the county ID
            $countyId = County::where('code', $countyCode)->value('id');

            // Insert or retrieve the constituency
            Constituency::updateOrInsert(
                ['code' => $constituencyCode],
                [
                    'name' => $constituencyName,
                    'county_id' => $countyId,
                    'updated_at' => now(),
                    'created_at' => now()
                ]
            );

            // Retrieve the constituency ID
            $constituencyId = Constituency::where('code', $constituencyCode)->value('id');

            // Insert or retrieve the ward
            Ward::updateOrInsert(
                ['code' => $wardCode],
                [
                    'name' => $wardName,
                    'constituency_id' => $constituencyId,
                    'updated_at' => now(),
                    'created_at' => now()
                ]
            );
        }

        fclose($file);

        $wardId = 350;

        // Check if the ward exists
        if (Ward::where('id', $wardId)->exists()) {
            // Insert or retrieve the Kavisuni location
            Location::updateOrInsert(
                ['code' => 1],
                [
                    'name' => 'Kavisuni',
                    'ward_id' => $wardId
                ]
            );
        }
    }
}
