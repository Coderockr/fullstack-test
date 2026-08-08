<?php

declare(strict_types=1);

namespace App\Domain\Investment\Results;

use Brick\Money\Money;

/**
 * Immutable result of a gain calculation as of a reference date.
 */
final class BalanceBreakdown
{
    public function __construct(
        public readonly Money $principal,
        public readonly Money $balance,
        public readonly Money $gains,
        public readonly int $months,
    ) {}
}
