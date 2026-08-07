<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Investment;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Http\FormRequest;

class WithdrawalPreviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('view', $this->investment()) ?? false;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'date' => [
                'required',
                'date',
                'before_or_equal:today',
                'after_or_equal:'.$this->investment()->invested_at->toDateString(),
            ],
        ];
    }

    public function referenceDate(): CarbonImmutable
    {
        return CarbonImmutable::parse((string) $this->validated('date'))->startOfDay();
    }

    private function investment(): Investment
    {
        /** @var Investment */
        return $this->route('investment');
    }
}
