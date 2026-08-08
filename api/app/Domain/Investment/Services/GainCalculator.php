<?php

declare(strict_types=1);

namespace App\Domain\Investment\Services;

use App\Domain\Investment\Results\BalanceBreakdown;
use App\Domain\Investment\ValueObjects\GainRate;
use Brick\Math\RoundingMode;
use Brick\Money\Money;
use Carbon\CarbonInterface;

/**
 * Compound-interest gain calculator.
 *
 * Interest is credited month by month, re-rounding the balance to whole cents
 * on every anniversary — this literally models "each month's gain joins the
 * balance for the next payment" and keeps every intermediate step auditable.
 */
final class GainCalculator
{
    public function __construct(
        private readonly GainRate $rate,
        private readonly ElapsedMonths $elapsedMonths,
    ) {}

    public function forPeriod(Money $principal, CarbonInterface $start, CarbonInterface $reference): BalanceBreakdown
    {
        return $this->forMonths($principal, $this->elapsedMonths->between($start, $reference));
    }

    public function forMonths(Money $principal, int $months): BalanceBreakdown
    {
        $factor = $this->rate->factor();
        $balance = $principal;

        for ($m = 0; $m < $months; $m++) {
            $balance = $balance->multipliedBy($factor, RoundingMode::HalfUp);
        }

        return new BalanceBreakdown(
            principal: $principal,
            balance: $balance,
            gains: $balance->minus($principal),
            months: $months,
        );
    }
}
