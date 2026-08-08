<?php

declare(strict_types=1);

namespace App\Application\Investment\Actions;

use App\Application\Investment\Data\NewInvestmentData;
use App\Domain\Investment\Contracts\InvestmentRepository;
use App\Domain\Investment\Enums\InvestmentStatus;
use App\Domain\Investment\Exceptions\AmountNotPositive;
use App\Events\InvestmentCreated;
use App\Models\Investment;
use App\Models\User;

/**
 * Use-case: create an investment owned by the authenticated user.
 */
final class CreateInvestment
{
    public function __construct(private readonly InvestmentRepository $repository) {}

    public function handle(User $owner, NewInvestmentData $data): Investment
    {
        if (! $data->amount->isPositive()) {
            throw new AmountNotPositive;
        }

        $investment = new Investment([
            'owner_id' => $owner->getKey(),
            'amount' => $data->amount,
            'currency' => $data->amount->getCurrency()->getCurrencyCode(),
            'invested_at' => $data->investedAt,
            'status' => InvestmentStatus::Active,
        ]);

        $this->repository->save($investment);

        InvestmentCreated::dispatch($investment);

        return $investment;
    }
}
