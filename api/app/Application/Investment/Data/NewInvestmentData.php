<?php

declare(strict_types=1);

namespace App\Application\Investment\Data;

use Brick\Money\Money;
use Carbon\CarbonImmutable;

/**
 * Validated input for creating an investment.
 */
final class NewInvestmentData
{
    public function __construct(
        public readonly Money $amount,
        public readonly CarbonImmutable $investedAt,
    ) {}
}
