<?php

declare(strict_types=1);

namespace App\Providers;

use App\Events\InvestmentCreated;
use App\Events\InvestmentWithdrawn;
use App\Listeners\SendInvestmentCreatedNotification;
use App\Listeners\SendInvestmentWithdrawnNotification;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Event::listen(InvestmentCreated::class, SendInvestmentCreatedNotification::class);
        Event::listen(InvestmentWithdrawn::class, SendInvestmentWithdrawnNotification::class);
    }
}
