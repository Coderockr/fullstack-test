<?php

declare(strict_types=1);

use App\Domain\Investment\Services\ElapsedMonths;
use App\Domain\Investment\Services\GainCalculator;
use App\Domain\Investment\ValueObjects\GainRate;
use Brick\Money\Money;
use Carbon\CarbonImmutable;

function calculator(): GainCalculator
{
    return new GainCalculator(GainRate::ofMonthly('0.0052'), new ElapsedMonths);
}

it('returns the principal untouched when no month has elapsed', function () {
    $breakdown = calculator()->forMonths(Money::of('1000.00', 'BRL'), 0);

    expect((string) $breakdown->balance->getAmount())->toBe('1000.00')
        ->and((string) $breakdown->gains->getAmount())->toBe('0.00')
        ->and($breakdown->months)->toBe(0);
});

it('compounds 0.52% monthly, re-rounding to cents each month (vector A)', function () {
    // R$1000.00 created 2025-01-15, referenced 2025-07-15 => 6 complete months.
    $breakdown = calculator()->forPeriod(
        Money::of('1000.00', 'BRL'),
        CarbonImmutable::parse('2025-01-15'),
        CarbonImmutable::parse('2025-07-15'),
    );

    expect($breakdown->months)->toBe(6)
        ->and((string) $breakdown->balance->getAmount())->toBe('1031.61')
        ->and((string) $breakdown->gains->getAmount())->toBe('31.61');
});

it('walks the exact monthly cent progression of vector A', function () {
    $expected = ['1005.20', '1010.43', '1015.68', '1020.96', '1026.27', '1031.61'];
    $principal = Money::of('1000.00', 'BRL');

    foreach ($expected as $month => $value) {
        expect((string) calculator()->forMonths($principal, $month + 1)->balance->getAmount())
            ->toBe($value);
    }
});

it('never produces a balance below the principal', function (int $months) {
    $breakdown = calculator()->forMonths(Money::of('2500.00', 'BRL'), $months);

    expect($breakdown->balance->isGreaterThanOrEqualTo(Money::of('2500.00', 'BRL')))->toBeTrue();
})->with([0, 1, 5, 12, 24, 60]);
