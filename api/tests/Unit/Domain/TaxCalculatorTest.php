<?php

declare(strict_types=1);

use App\Domain\Investment\Enums\TaxBracket;
use App\Domain\Investment\Services\TaxCalculator;
use Brick\Money\Money;

function taxer(): TaxCalculator
{
    return new TaxCalculator([
        'under_one_year' => '0.225',
        'one_to_two_years' => '0.185',
        'over_two_years' => '0.15',
    ]);
}

it('taxes only the gain portion (challenge example)', function () {
    // principal 1000, balance 1200 => gains 200, under one year => tax 45.00.
    $result = taxer()->on(Money::of('1000.00', 'BRL'), Money::of('1200.00', 'BRL'), 6);

    expect((string) $result->gains->getAmount())->toBe('200.00')
        ->and($result->bracket)->toBe(TaxBracket::UnderOneYear)
        ->and((string) $result->tax->getAmount())->toBe('45.00')
        ->and((string) $result->net->getAmount())->toBe('1155.00');
});

it('applies the age-based rate', function (int $months, TaxBracket $bracket, string $tax, string $net) {
    $result = taxer()->on(Money::of('1000.00', 'BRL'), Money::of('1200.00', 'BRL'), $months);

    expect($result->bracket)->toBe($bracket)
        ->and((string) $result->tax->getAmount())->toBe($tax)
        ->and((string) $result->net->getAmount())->toBe($net);
})->with([
    'under one year (22.5%)' => [6, TaxBracket::UnderOneYear, '45.00', '1155.00'],
    'exactly one year (18.5%)' => [12, TaxBracket::OneToTwoYears, '37.00', '1163.00'],
    'just under two years (18.5%)' => [23, TaxBracket::OneToTwoYears, '37.00', '1163.00'],
    'exactly two years (15%)' => [24, TaxBracket::OverTwoYears, '30.00', '1170.00'],
]);

it('charges no tax when there are no gains', function () {
    $result = taxer()->on(Money::of('1000.00', 'BRL'), Money::of('1000.00', 'BRL'), 36);

    expect((string) $result->gains->getAmount())->toBe('0.00')
        ->and((string) $result->tax->getAmount())->toBe('0.00')
        ->and((string) $result->net->getAmount())->toBe('1000.00');
});
