<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Application\Investment\Data\NewInvestmentData;
use Brick\Money\Money;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Http\FormRequest;

class StoreInvestmentRequest extends FormRequest
{
    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            // Amount in the major unit (e.g. "1000.00"); positive, up to 2 decimals.
            'amount' => ['required', 'numeric', 'gt:0', 'decimal:0,2'],
            // Creation date can be today or in the past, never the future.
            'invested_at' => ['required', 'date', 'before_or_equal:today'],
        ];
    }

    public function toData(): NewInvestmentData
    {
        return new NewInvestmentData(
            amount: Money::of((string) $this->validated('amount'), (string) config('investments.currency')),
            investedAt: CarbonImmutable::parse((string) $this->validated('invested_at'))->startOfDay(),
        );
    }
}
