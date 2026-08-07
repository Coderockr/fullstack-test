<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Application\Investment\InvestmentCalculator;
use App\Domain\Investment\Enums\InvestmentStatus;
use App\Models\Investment;
use App\Models\User;
use Brick\Money\Money;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Investment>
 */
class InvestmentFactory extends Factory
{
    protected $model = Investment::class;

    public function definition(): array
    {
        return [
            'owner_id' => User::factory(),
            'amount' => Money::of((string) $this->faker->numberBetween(100, 100000), 'BRL'),
            'currency' => 'BRL',
            'invested_at' => CarbonImmutable::today()->subMonths($this->faker->numberBetween(0, 30)),
            'status' => InvestmentStatus::Active,
        ];
    }

    public function investedMonthsAgo(int $months): static
    {
        return $this->state(fn (): array => [
            'invested_at' => CarbonImmutable::today()->subMonths($months)->startOfDay(),
        ]);
    }

    public function amount(string $major): static
    {
        return $this->state(fn (): array => [
            'amount' => Money::of($major, 'BRL'),
        ]);
    }

    /**
     * Freeze a withdrawal snapshot as of the given date (defaults to today).
     */
    public function withdrawn(?CarbonImmutable $date = null): static
    {
        return $this->afterCreating(function (Investment $investment) use ($date): void {
            $when = $date ?? CarbonImmutable::today();
            $breakdown = app(InvestmentCalculator::class)->withdrawalAsOf($investment, $when);

            $investment->status = InvestmentStatus::Withdrawn;
            $investment->withdrawn_at = $when;
            $investment->withdrawal_bracket = $breakdown->bracket->value;
            $investment->withdrawal_tax_rate = (string) $breakdown->taxRate;
            $investment->withdrawal_gross = $breakdown->balance;
            $investment->withdrawal_gains = $breakdown->gains;
            $investment->withdrawal_tax = $breakdown->tax;
            $investment->withdrawal_net = $breakdown->net;
            $investment->save();
        });
    }
}
