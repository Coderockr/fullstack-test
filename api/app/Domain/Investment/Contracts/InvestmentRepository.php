<?php

declare(strict_types=1);

namespace App\Domain\Investment\Contracts;

use App\Models\Investment;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface InvestmentRepository
{
    /**
     * @return LengthAwarePaginator<int, Investment>
     */
    public function paginateForOwner(User $owner, int $perPage): LengthAwarePaginator;

    public function save(Investment $investment): Investment;
}
