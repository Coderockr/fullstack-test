<?php

declare(strict_types=1);

namespace App\Providers;

use App\Domain\Investment\Contracts\InvestmentRepository;
use App\Domain\Investment\Services\ElapsedMonths;
use App\Domain\Investment\Services\GainCalculator;
use App\Domain\Investment\Services\TaxCalculator;
use App\Domain\Investment\ValueObjects\GainRate;
use App\Infrastructure\Persistence\Eloquent\EloquentInvestmentRepository;
use Illuminate\Support\ServiceProvider;

final class DomainServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(GainCalculator::class, fn () => new GainCalculator(
            GainRate::ofMonthly((string) config('investments.monthly_rate')),
            new ElapsedMonths,
        ));

        $this->app->singleton(TaxCalculator::class, fn () => new TaxCalculator(
            config('investments.tax'),
        ));

        $this->app->bind(InvestmentRepository::class, EloquentInvestmentRepository::class);
    }
}
