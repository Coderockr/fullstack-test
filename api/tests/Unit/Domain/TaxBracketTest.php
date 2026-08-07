<?php

declare(strict_types=1);

use App\Domain\Investment\Enums\TaxBracket;

it('resolves the bracket from the elapsed months', function (int $months, TaxBracket $expected) {
    expect(TaxBracket::fromMonths($months))->toBe($expected);
})->with([
    'zero months' => [0, TaxBracket::UnderOneYear],
    'eleven months' => [11, TaxBracket::UnderOneYear],
    'exactly one year' => [12, TaxBracket::OneToTwoYears],
    'eighteen months' => [18, TaxBracket::OneToTwoYears],
    'just under two years' => [23, TaxBracket::OneToTwoYears],
    'exactly two years' => [24, TaxBracket::OverTwoYears],
    'well over two years' => [40, TaxBracket::OverTwoYears],
]);
