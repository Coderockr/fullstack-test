<?php

declare(strict_types=1);

namespace App\Domain\Investment\Services;

use Carbon\CarbonInterface;

/**
 * Counts the number of COMPLETE monthly periods between two dates.
 *
 * A period completes on the anniversary day-of-month of the start date. For
 * months shorter than the start day (e.g. a Jan-31 start reaching February),
 * the anniversary is capped to the last day of the reference month.
 */
final class ElapsedMonths
{
    public function between(CarbonInterface $start, CarbonInterface $end): int
    {
        if ($end <= $start) {
            return 0;
        }

        $months = ($end->year - $start->year) * 12 + ($end->month - $start->month);

        // Cap the anniversary day to the reference month's length (last-day rule).
        $anniversaryDay = min($start->day, $end->daysInMonth);

        if ($end->day < $anniversaryDay) {
            $months--;
        }

        return max(0, $months);
    }
}
