<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\InvestmentWithdrawn;
use App\Mail\InvestmentWithdrawnMail;
use Illuminate\Support\Facades\Mail;

final class SendInvestmentWithdrawnNotification
{
    public function handle(InvestmentWithdrawn $event): void
    {
        $investment = $event->investment->loadMissing('owner');

        Mail::to($investment->owner->email)->send(new InvestmentWithdrawnMail($investment));
    }
}
