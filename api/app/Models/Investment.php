<?php

declare(strict_types=1);

namespace App\Models;

use App\Domain\Investment\Enums\InvestmentStatus;
use App\Infrastructure\Persistence\Eloquent\Casts\MoneyCast;
use Brick\Money\Money;
use Carbon\CarbonImmutable;
use Database\Factories\InvestmentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property Money $amount
 * @property string $currency
 * @property CarbonImmutable $invested_at
 * @property InvestmentStatus $status
 * @property CarbonImmutable|null $withdrawn_at
 * @property string|null $withdrawal_bracket
 * @property string|null $withdrawal_tax_rate
 * @property Money|null $withdrawal_gross
 * @property Money|null $withdrawal_gains
 * @property Money|null $withdrawal_tax
 * @property Money|null $withdrawal_net
 */
class Investment extends Model
{
    /** @use HasFactory<InvestmentFactory> */
    use HasFactory;

    protected $fillable = [
        'owner_id',
        'amount',
        'currency',
        'invested_at',
        'status',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount' => MoneyCast::class,
            'invested_at' => 'immutable_date',
            'withdrawn_at' => 'immutable_date',
            'status' => InvestmentStatus::class,
            'withdrawal_tax_rate' => 'string',
            'withdrawal_gross' => MoneyCast::class,
            'withdrawal_gains' => MoneyCast::class,
            'withdrawal_tax' => MoneyCast::class,
            'withdrawal_net' => MoneyCast::class,
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function isWithdrawn(): bool
    {
        return $this->status === InvestmentStatus::Withdrawn;
    }
}
