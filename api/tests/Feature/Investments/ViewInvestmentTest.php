<?php

declare(strict_types=1);

use App\Models\Investment;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    $this->user = User::factory()->create();
    Sanctum::actingAs($this->user);
});

it('shows expected balance and gains as of today', function () {
    $investment = Investment::factory()
        ->for($this->user, 'owner')
        ->amount('1000.00')
        ->investedMonthsAgo(6)
        ->create();

    $this->getJson("/api/investments/{$investment->id}")
        ->assertOk()
        ->assertJsonPath('data.amount', '1000.00')
        ->assertJsonPath('data.elapsed_months', 6)
        ->assertJsonPath('data.expected_balance', '1031.61')
        ->assertJsonPath('data.gains', '31.61')
        ->assertJsonPath('data.withdrawal', null);
});

it('forbids viewing another user\'s investment (403)', function () {
    $investment = Investment::factory()->create(); // owned by a fresh user

    $this->getJson("/api/investments/{$investment->id}")->assertForbidden();
});

it('returns 404 for a missing investment', function () {
    $this->getJson('/api/investments/999999')->assertNotFound();
});
