<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Investment;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed a demo user with investments spanning every tax bracket, plus a
     * second user to demonstrate per-owner scoping.
     */
    public function run(): void
    {
        $demo = User::factory()->create([
            'name' => 'Demo User',
            'email' => 'demo@coderockr.test',
            'password' => 'password',
        ]);

        // Active investments across the three tax brackets.
        Investment::factory()->for($demo, 'owner')->amount('1000.00')->investedMonthsAgo(6)->create();   // < 1 year (22.5%)
        Investment::factory()->for($demo, 'owner')->amount('2500.00')->investedMonthsAgo(15)->create();  // 1-2 years (18.5%)
        Investment::factory()->for($demo, 'owner')->amount('5000.00')->investedMonthsAgo(30)->create();  // > 2 years (15%)
        Investment::factory()->for($demo, 'owner')->amount('750.00')->investedMonthsAgo(0)->create();    // brand new

        // One already-withdrawn investment (settled two months ago).
        Investment::factory()
            ->for($demo, 'owner')
            ->amount('3200.00')
            ->investedMonthsAgo(20)
            ->withdrawn(CarbonImmutable::today()->subMonths(2))
            ->create();

        // A second owner with their own investments (never visible to the demo user).
        $grace = User::factory()->create([
            'name' => 'Grace Hopper',
            'email' => 'grace@coderockr.test',
            'password' => 'password',
        ]);

        Investment::factory()->count(3)->for($grace, 'owner')->create();
    }
}
