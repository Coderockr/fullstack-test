<?php

declare(strict_types=1);

namespace App\Application\Investment;

use App\Domain\Investment\Results\BalanceBreakdown;
use App\Domain\Investment\Results\WithdrawalBreakdown;
use App\Domain\Investment\Services\GainCalculator;
use App\Domain\Investment\Services\TaxCalculator;
use App\Models\Investment;
use Carbon\CarbonInterface;

/**
 * Thin façade the HTTP layer uses to value an investment: it wires the pure
 * domain calculators to a persisted Investment as of a given reference date.
 */
final class InvestmentCalculator
{
    public function __construct(
        private readonly GainCalculator $gains,
        private readonly TaxCalculator $tax,
    ) {}

    public function balanceAsOf(Investment $investment, CarbonInterface $reference): BalanceBreakdown
    {
        return $this->gains->forPeriod($investment->amount, $investment->invested_at, $reference);
    }

    public function withdrawalAsOf(Investment $investment, CarbonInterface $reference): WithdrawalBreakdown
    {
        $balance = $this->balanceAsOf($investment, $reference);

        return $this->tax->on($balance->principal, $balance->balance, $balance->months);
    }
}
