<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Plan;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Basic Package',
                'price' => 15000,
                'period' => 'year',
                'featured' => false,
                'features' => [
                    'Less than 100 students',
                    'Performance Analytics',
                    'Free SMS System',
                    'Free school sub-domain',
                ],
            ],
            [
                'name' => 'Standard Package',
                'price' => 40000,
                'period' => 'year',
                'featured' => true,
                'features' => [
                    'Unlimited Students',
                    'Performance Analytics',
                    'Finance System',
                    'E-Learning Module',
                    'Free SMS System (Free Sender ID)',
                    'Free customized .sc.ke or .ac.ke domain',
                ],
            ],
            [
                'name' => 'Executive Package',
                'price' => 60000,
                'period' => 'year',
                'featured' => false,
                'features' => [
                    'All features for Standard Package',
                    'Unlimited mentoring',
                    'Team progress tracking',
                    'Dedicated account manager',
                ],
            ],
        ];

        foreach ($plans as $plan) {
            Plan::create($plan);
        }
    }
}
