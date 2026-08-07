<?php

declare(strict_types=1);

use App\Models\Investment;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    $this->user = User::factory()->create();
    Sanctum::actingAs($this->user);
});

it('lists only the authenticated user\'s investments', function () {
    Investment::factory()->count(3)->for($this->user, 'owner')->create();
    Investment::factory()->count(2)->create(); // other owners

    $this->getJson('/api/investments')
        ->assertOk()
        ->assertJsonCount(3, 'data')
        ->assertJsonPath('meta.total', 3);
});

it('paginates with meta and links', function () {
    Investment::factory()->count(20)->for($this->user, 'owner')->create();

    $this->getJson('/api/investments?per_page=5')
        ->assertOk()
        ->assertJsonCount(5, 'data')
        ->assertJsonPath('meta.per_page', 5)
        ->assertJsonPath('meta.last_page', 4)
        ->assertJsonStructure(['data', 'links' => ['first', 'last', 'prev', 'next'], 'meta']);
});

it('caps per_page at 100', function () {
    Investment::factory()->count(3)->for($this->user, 'owner')->create();

    $this->getJson('/api/investments?per_page=1000')
        ->assertOk()
        ->assertJsonPath('meta.per_page', 100);
});
