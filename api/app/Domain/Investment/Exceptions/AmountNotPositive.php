<?php

declare(strict_types=1);

namespace App\Domain\Investment\Exceptions;

use DomainException;

final class AmountNotPositive extends DomainException
{
    public function __construct()
    {
        parent::__construct('An investment amount must be positive.');
    }
}
