<?php

declare(strict_types=1);

use App\Models\User;
use Carbon\CarbonImmutable;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    $this->user = User::factory()->create();
    Sanctum::actingAs($this->user);
});

it('creates an investment for the authenticated owner', function () {
    $this->postJson('/api/investments', [
        'amount' => '1000.00',
        'invested_at' => CarbonImmutable::today()->subMonths(6)->toDateString(),
    ])
        ->assertCreated()
        ->assertJsonPath('data.amount', '1000.00')
        ->assertJsonPath('data.status', 'active')
        ->assertJsonPath('data.owner.id', $this->user->id)
        ->assertJsonPath('data.expected_balance', '1031.61')
        ->assertJsonPath('data.gains', '31.61');

    $this->assertDatabaseHas('investments', [
        'owner_id' => $this->user->id,
        'amount' => 100000,
        'status' => 'active',
    ]);
});

it('rejects a creation date in the future (422)', function () {
    $this->postJson('/api/investments', [
        'amount' => '1000.00',
        'invested_at' => CarbonImmutable::tomorrow()->toDateString(),
    ])->assertStatus(422)->assertJsonValidationErrors('invested_at');
});

it('rejects a non-positive amount (422)', function () {
    $this->postJson('/api/investments', [
        'amount' => '0',
        'invested_at' => CarbonImmutable::today()->toDateString(),
    ])->assertStatus(422)->assertJsonValidationErrors('amount');
});

it('always assigns the authenticated user as owner, ignoring owner_id in the body', function () {
    $intruder = User::factory()->create();

    $this->postJson('/api/investments', [
        'amount' => '500.00',
        'invested_at' => CarbonImmutable::today()->toDateString(),
        'owner_id' => $intruder->id,
    ])
        ->assertCreated()
        ->assertJsonPath('data.owner.id', $this->user->id);

    $this->assertDatabaseMissing('investments', ['owner_id' => $intruder->id]);
});
