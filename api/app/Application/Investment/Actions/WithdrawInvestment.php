<?php

declare(strict_types=1);

namespace App\Application\Investment\Actions;

use App\Application\Investment\Data\WithdrawalData;
use App\Application\Investment\InvestmentCalculator;
use App\Domain\Investment\Enums\InvestmentStatus;
use App\Domain\Investment\Exceptions\InvestmentAlreadyWithdrawn;
use App\Events\InvestmentWithdrawn;
use App\Models\Investment;
use Illuminate\Support\Facades\DB;

/**
 * Use-case: fully withdraw an investment, freezing the taxed figures.
 *
 * Runs in a transaction with a row lock so a concurrent request cannot
 * withdraw the same investment twice.
 */
final class WithdrawInvestment
{
    public function __construct(private readonly InvestmentCalculator $calculator) {}

    public function handle(Investment $investment, WithdrawalData $data): Investment
    {
        return DB::transaction(function () use ($investment, $data): Investment {
            /** @var Investment $locked */
            $locked = Investment::query()
                ->whereKey($investment->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            if ($locked->isWithdrawn()) {
                throw new InvestmentAlreadyWithdrawn;
            }

            $breakdown = $this->calculator->withdrawalAsOf($locked, $data->date);

            $locked->status = InvestmentStatus::Withdrawn;
            $locked->withdrawn_at = $data->date;
            $locked->withdrawal_bracket = $breakdown->bracket->value;
            $locked->withdrawal_tax_rate = (string) $breakdown->taxRate;
            $locked->withdrawal_gross = $breakdown->balance;
            $locked->withdrawal_gains = $breakdown->gains;
            $locked->withdrawal_tax = $breakdown->tax;
            $locked->withdrawal_net = $breakdown->net;
            $locked->save();

            InvestmentWithdrawn::dispatch($locked);

            return $locked;
        });
    }
}
