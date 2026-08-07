<?php

declare(strict_types=1);

use App\Models\User;

it('registers a user and returns a token', function () {
    $this->postJson('/api/register', [
        'name' => 'Ada Lovelace',
        'email' => 'ada@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ])
        ->assertCreated()
        ->assertJsonStructure(['user' => ['id', 'name', 'email'], 'token'])
        ->assertJsonPath('user.email', 'ada@example.com');

    expect(User::query()->where('email', 'ada@example.com')->exists())->toBeTrue();
});

it('rejects registration with a duplicate email', function () {
    User::factory()->create(['email' => 'taken@example.com']);

    $this->postJson('/api/register', [
        'name' => 'Someone',
        'email' => 'taken@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ])->assertStatus(422)->assertJsonValidationErrors('email');
});

it('logs in with valid credentials and returns a token', function () {
    User::factory()->create([
        'email' => 'grace@example.com',
        'password' => 'password123',
    ]);

    $this->postJson('/api/login', [
        'email' => 'grace@example.com',
        'password' => 'password123',
    ])->assertOk()->assertJsonStructure(['user' => ['id'], 'token']);
});

it('rejects login with wrong credentials (401)', function () {
    User::factory()->create([
        'email' => 'grace@example.com',
        'password' => 'password123',
    ]);

    $this->postJson('/api/login', [
        'email' => 'grace@example.com',
        'password' => 'wrong-password',
    ])->assertStatus(401);
});

it('blocks protected routes without a token (401)', function () {
    $this->getJson('/api/investments')->assertUnauthorized();
});
