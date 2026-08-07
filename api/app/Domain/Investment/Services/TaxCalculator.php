<?php

declare(strict_types=1);

namespace App\Domain\Investment\Services;

use App\Domain\Investment\Enums\TaxBracket;
use App\Domain\Investment\Results\WithdrawalBreakdown;
use Brick\Math\BigDecimal;
use Brick\Math\RoundingMode;
use Brick\Money\Money;

/**
 * Applies withdrawal tax to the GAIN portion only, using the age-based bracket.
 * Tax rates are injected (from config) keyed by TaxBracket->value.
 */
final class TaxCalculator
{
    /**
     * @param  array<string, string>  $rates  bracket value => decimal rate string
     */
    public function __construct(private readonly array $rates) {}

    public function on(Money $principal, Money $balance, int $months): WithdrawalBreakdown
    {
        $gains = $balance->minus($principal);
        $bracket = TaxBracket::fromMonths($months);
        $rate = BigDecimal::of($this->rates[$bracket->value]);

        $tax = $gains->multipliedBy($rate, RoundingMode::HalfUp);
        $net = $balance->minus($tax);

        return new WithdrawalBreakdown(
            principal: $principal,
            balance: $balance,
            gains: $gains,
            months: $months,
            bracket: $bracket,
            taxRate: $rate,
            tax: $tax,
            net: $net,
        );
    }
}
