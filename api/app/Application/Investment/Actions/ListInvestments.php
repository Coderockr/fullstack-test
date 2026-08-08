<?php

declare(strict_types=1);

namespace App\Application\Investment\Actions;

use App\Domain\Investment\Contracts\InvestmentRepository;
use App\Models\Investment;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Use-case: list the authenticated user's investments, paginated.
 */
final class ListInvestments
{
    public function __construct(private readonly InvestmentRepository $repository) {}

    /**
     * @return LengthAwarePaginator<int, Investment>
     */
    public function handle(User $owner, int $perPage): LengthAwarePaginator
    {
        return $this->repository->paginateForOwner($owner, $perPage);
    }
}
