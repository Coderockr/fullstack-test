<?php

declare(strict_types=1);

namespace App\Application\Investment\Data;

use Carbon\CarbonImmutable;

/**
 * Validated input for withdrawing an investment.
 */
final class WithdrawalData
{
    public function __construct(
        public readonly CarbonImmutable $date,
    ) {}
}
