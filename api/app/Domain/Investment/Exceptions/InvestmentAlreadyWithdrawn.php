<?php

declare(strict_types=1);

namespace App\Domain\Investment\Exceptions;

use DomainException;

final class InvestmentAlreadyWithdrawn extends DomainException
{
    public function __construct()
    {
        parent::__construct('This investment has already been withdrawn.');
    }
}
