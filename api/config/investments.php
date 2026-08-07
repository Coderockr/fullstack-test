<?php

declare(strict_types=1);

// Business rules for investments. Rates are kept as exact decimal strings so
// they can feed brick/money arithmetic without floating-point drift.
return [
    // Default currency (ISO-4217). Coderockr is BR, so amounts are in BRL.
    'currency' => env('INVESTMENT_CURRENCY', 'BRL'),

    // Compound monthly gain rate: 0.52% per month, paid on the anniversary day.
    'monthly_rate' => env('INVESTMENT_MONTHLY_RATE', '0.0052'),

    // Withdrawal tax on the GAIN portion, by the age of the investment.
    // Boundaries: < 12 months, [12, 24) months, >= 24 months.
    'tax' => [
        'under_one_year' => '0.225',   // 22.5%
        'one_to_two_years' => '0.185', // 18.5%
        'over_two_years' => '0.15',    // 15%
    ],
];
