<?php

declare(strict_types=1);

namespace App\Domain\Investment\Enums;

/**
 * Age-based withdrawal tax bracket. Boundaries are expressed in whole elapsed
 * months so they stay consistent with the gain calculation:
 *   < 12 months     -> under one year
 *   [12, 24) months -> between one and two years (exactly one year lands here)
 *   >= 24 months    -> older than two years (exactly two years lands here)
 */
enum TaxBracket: string
{
    case UnderOneYear = 'under_one_year';
    case OneToTwoYears = 'one_to_two_years';
    case OverTwoYears = 'over_two_years';

    public static function fromMonths(int $months): self
    {
        return match (true) {
            $months < 12 => self::UnderOneYear,
            $months < 24 => self::OneToTwoYears,
            default => self::OverTwoYears,
        };
    }
}
