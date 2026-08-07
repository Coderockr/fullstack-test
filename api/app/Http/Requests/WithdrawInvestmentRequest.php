<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Application\Investment\Data\WithdrawalData;
use App\Models\Investment;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Http\FormRequest;

class WithdrawInvestmentRequest extends FormRequest
{
    /**
     * Owner-only: authorize before validating (403 wins over 422).
     */
    public function authorize(): bool
    {
        return $this->user()?->can('withdraw', $this->investment()) ?? false;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            // Withdrawal date: today or past, never before the investment's creation.
            'withdrawal_date' => [
                'required',
                'date',
                'before_or_equal:today',
                'after_or_equal:'.$this->investment()->invested_at->toDateString(),
            ],
        ];
    }

    public function toData(): WithdrawalData
    {
        return new WithdrawalData(
            date: CarbonImmutable::parse((string) $this->validated('withdrawal_date'))->startOfDay(),
        );
    }

    private function investment(): Investment
    {
        /** @var Investment */
        return $this->route('investment');
    }
}
