<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Application\Investment\InvestmentCalculator;
use App\Domain\Investment\Services\ElapsedMonths;
use App\Models\Investment;
use Brick\Money\Money;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Investment
 */
class InvestmentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var Investment $investment */
        $investment = $this->resource;

        if ($investment->isWithdrawn()) {
            $reference = $investment->withdrawn_at ?? CarbonImmutable::today();
            $balance = $investment->withdrawal_gross;
            $gains = $investment->withdrawal_gains;
            $withdrawal = [
                'date' => $reference->toDateString(),
                'tax_rate' => $investment->withdrawal_tax_rate,
                'tax' => $this->money($investment->withdrawal_tax),
                'net_amount' => $this->money($investment->withdrawal_net),
            ];
        } else {
            $reference = CarbonImmutable::today();
            $statement = app(InvestmentCalculator::class)->balanceAsOf($investment, $reference);
            $balance = $statement->balance;
            $gains = $statement->gains;
            $withdrawal = null;
        }

        $months = app(ElapsedMonths::class)->between($investment->invested_at, $reference);

        return [
            'id' => $investment->id,
            'owner' => [
                'id' => $investment->owner_id,
                'name' => $investment->owner?->name,
            ],
            'amount' => $this->money($investment->amount),
            'currency' => $investment->currency,
            'status' => $investment->status->value,
            'invested_at' => $investment->invested_at->toDateString(),
            'reference_date' => $reference->toDateString(),
            'elapsed_months' => $months,
            'expected_balance' => $this->money($balance),
            'gains' => $this->money($gains),
            'withdrawal' => $withdrawal,
        ];
    }

    private function money(?Money $money): ?string
    {
        return $money?->getAmount()->__toString();
    }
}
