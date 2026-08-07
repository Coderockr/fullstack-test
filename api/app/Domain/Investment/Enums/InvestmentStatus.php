<?php

declare(strict_types=1);

namespace App\Domain\Investment\Enums;

/**
 * Lifecycle state of an investment.
 */
enum InvestmentStatus: string
{
    case Active = 'active';
    case Withdrawn = 'withdrawn';

    public function isActive(): bool
    {
        return $this === self::Active;
    }

    public function isWithdrawn(): bool
    {
        return $this === self::Withdrawn;
    }
}
