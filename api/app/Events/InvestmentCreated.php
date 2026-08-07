<?php

declare(strict_types=1);

namespace App\Events;

use App\Models\Investment;
use Illuminate\Foundation\Events\Dispatchable;

final class InvestmentCreated
{
    use Dispatchable;

    public function __construct(public readonly Investment $investment) {}
}
