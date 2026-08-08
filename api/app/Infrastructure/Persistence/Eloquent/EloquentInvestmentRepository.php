<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent;

use App\Domain\Investment\Contracts\InvestmentRepository;
use App\Models\Investment;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class EloquentInvestmentRepository implements InvestmentRepository
{
    public function paginateForOwner(User $owner, int $perPage): LengthAwarePaginator
    {
        return $owner->investments()
            ->latest('invested_at')
            ->latest('id')
            ->paginate($perPage);
    }

    public function save(Investment $investment): Investment
    {
        $investment->save();

        return $investment;
    }
}
