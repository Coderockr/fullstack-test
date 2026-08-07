<?php

declare(strict_types=1);

use App\Domain\Investment\Services\ElapsedMonths;
use Carbon\CarbonImmutable;

beforeEach(function () {
    $this->elapsed = new ElapsedMonths;
});

it('counts complete months between two dates', function (string $start, string $end, int $expected) {
    $months = $this->elapsed->between(CarbonImmutable::parse($start), CarbonImmutable::parse($end));

    expect($months)->toBe($expected);
})->with([
    'same day is zero' => ['2025-01-15', '2025-01-15', 0],
    'one day before anniversary is zero' => ['2025-01-15', '2025-02-14', 0],
    'exactly on the anniversary is one' => ['2025-01-15', '2025-02-15', 1],
    'six full months' => ['2025-01-15', '2025-07-15', 6],
    'jan 31 to feb 28 caps to last day (one month)' => ['2025-01-31', '2025-02-28', 1],
    'jan 31 to feb 10 has not reached anniversary (zero)' => ['2025-01-31', '2025-02-10', 0],
    'jan 31 to mar 30 is one (mar 31 not reached)' => ['2025-01-31', '2025-03-30', 1],
    'jan 31 to mar 31 is two' => ['2025-01-31', '2025-03-31', 2],
    'leap year jan 31 to feb 29 is one' => ['2024-01-31', '2024-02-29', 1],
    'leap year jan 31 to feb 28 is zero' => ['2024-01-31', '2024-02-28', 0],
    'end before start is zero' => ['2025-06-15', '2025-01-15', 0],
    'exactly two years is twenty-four' => ['2023-01-15', '2025-01-15', 24],
]);
