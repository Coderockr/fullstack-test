<?php

declare(strict_types=1);

use App\Models\Investment;
use App\Models\User;

it('seeds a demo user with investments across all brackets and a second owner', function () {
    $this->seed();

    $demo = User::query()->where('email', 'demo@coderockr.test')->first();
    expect($demo)->not->toBeNull();

    $demoInvestments = Investment::query()->where('owner_id', $demo->id);
    expect($demoInvestments->count())->toBe(5)
        ->and($demoInvestments->clone()->where('status', 'withdrawn')->count())->toBe(1);

    $grace = User::query()->where('email', 'grace@coderockr.test')->first();
    expect(Investment::query()->where('owner_id', $grace->id)->count())->toBe(3);
});
