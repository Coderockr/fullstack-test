<?php

declare(strict_types=1);

namespace App\Domain\Investment\Results;

use App\Domain\Investment\Enums\TaxBracket;
use Brick\Math\BigDecimal;
use Brick\Money\Money;

/**
 * Immutable result of a withdrawal calculation: the gross balance, the taxed
 * gain portion and the net amount actually paid out.
 */
final class WithdrawalBreakdown
{
    public function __construct(
        public readonly Money $principal,
        public readonly Money $balance,
        public readonly Money $gains,
        public readonly int $months,
        public readonly TaxBracket $bracket,
        public readonly BigDecimal $taxRate,
        public readonly Money $tax,
        public readonly Money $net,
    ) {}
}
