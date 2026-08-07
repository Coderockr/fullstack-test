<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Investment;
use App\Models\User;

class InvestmentPolicy
{
    public function view(User $user, Investment $investment): bool
    {
        return $investment->owner_id === $user->getKey();
    }

    public function withdraw(User $user, Investment $investment): bool
    {
        return $investment->owner_id === $user->getKey();
    }
}
