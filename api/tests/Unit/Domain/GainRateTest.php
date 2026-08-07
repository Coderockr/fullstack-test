<?php

declare(strict_types=1);

use App\Domain\Investment\ValueObjects\GainRate;

it('exposes the monthly rate and the per-month factor', function () {
    $rate = GainRate::ofMonthly('0.0052');

    expect((string) $rate->monthly())->toBe('0.0052')
        ->and((string) $rate->factor())->toBe('1.0052');
});

it('rejects a negative rate', function () {
    GainRate::ofMonthly('-0.01');
})->throws(InvalidArgumentException::class);

it('accepts a zero rate (no gains)', function () {
    $rate = GainRate::ofMonthly('0');

    expect((string) $rate->factor())->toBe('1');
});
