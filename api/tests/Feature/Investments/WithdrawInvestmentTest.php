<?php

declare(strict_types=1);

use App\Models\Investment;
use App\Models\User;
use Carbon\CarbonImmutable;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    $this->user = User::factory()->create();
    Sanctum::actingAs($this->user);
});

it('withdraws fully and returns the net amount after tax', function () {
    $investment = Investment::factory()
        ->for($this->user, 'owner')
        ->amount('1000.00')
        ->investedMonthsAgo(6)
        ->create();

    $this->postJson("/api/investments/{$investment->id}/withdraw", [
        'withdrawal_date' => CarbonImmutable::today()->toDateString(),
    ])
        ->assertOk()
        ->assertJsonPath('data.status', 'withdrawn')
        ->assertJsonPath('data.gains', '31.61')
        ->assertJsonPath('data.withdrawal.tax', '7.11')
        ->assertJsonPath('data.withdrawal.net_amount', '1024.50');

    $this->assertDatabaseHas('investments', [
        'id' => $investment->id,
        'status' => 'withdrawn',
        'withdrawal_net' => 102450,
    ]);
});

it('previews the taxed net amount without committing', function () {
    $investment = Investment::factory()
        ->for($this->user, 'owner')
        ->amount('1000.00')
        ->investedMonthsAgo(6)
        ->create();

    $date = CarbonImmutable::today()->toDateString();

    $this->getJson("/api/investments/{$investment->id}/withdrawal-preview?date={$date}")
        ->assertOk()
        ->assertJsonPath('data.gross', '1031.61')
        ->assertJsonPath('data.gains', '31.61')
        ->assertJsonPath('data.tax', '7.11')
        ->assertJsonPath('data.net', '1024.50');

    expect($investment->fresh()->status->value)->toBe('active');
});

it('rejects a withdrawal date before the creation date (422)', function () {
    $investment = Investment::factory()
        ->for($this->user, 'owner')
        ->investedMonthsAgo(2)
        ->create();

    $this->postJson("/api/investments/{$investment->id}/withdraw", [
        'withdrawal_date' => $investment->invested_at->subDay()->toDateString(),
    ])->assertStatus(422)->assertJsonValidationErrors('withdrawal_date');
});

it('rejects a future withdrawal date (422)', function () {
    $investment = Investment::factory()->for($this->user, 'owner')->create();

    $this->postJson("/api/investments/{$investment->id}/withdraw", [
        'withdrawal_date' => CarbonImmutable::tomorrow()->toDateString(),
    ])->assertStatus(422)->assertJsonValidationErrors('withdrawal_date');
});

it('rejects withdrawing an already-withdrawn investment (409)', function () {
    $investment = Investment::factory()
        ->for($this->user, 'owner')
        ->investedMonthsAgo(6)
        ->withdrawn()
        ->create();

    $this->postJson("/api/investments/{$investment->id}/withdraw", [
        'withdrawal_date' => CarbonImmutable::today()->toDateString(),
    ])->assertStatus(409);
});

it('forbids withdrawing another user\'s investment (403)', function () {
    $investment = Investment::factory()->create(); // different owner

    $this->postJson("/api/investments/{$investment->id}/withdraw", [
        'withdrawal_date' => CarbonImmutable::today()->toDateString(),
    ])->assertForbidden();
});
