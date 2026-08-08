<?php

declare(strict_types=1);

use App\Models\Investment;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

it('seeds an idempotent demo dataset with valid login credentials', function () {
    $this->seed();
    $this->seed();

    $demo = User::query()->where('email', 'demo@coderockr.test')->firstOrFail();
    expect(Hash::check('password', $demo->password))->toBeTrue();

    $demoInvestments = Investment::query()->where('owner_id', $demo->id);
    expect($demoInvestments->count())->toBe(5)
        ->and($demoInvestments->clone()->where('status', 'withdrawn')->count())->toBe(1);

    $grace = User::query()->where('email', 'grace@coderockr.test')->firstOrFail();
    expect(Investment::query()->where('owner_id', $grace->id)->count())->toBe(3)
        ->and(User::query()->count())->toBe(2)
        ->and(Investment::query()->count())->toBe(8);
});
