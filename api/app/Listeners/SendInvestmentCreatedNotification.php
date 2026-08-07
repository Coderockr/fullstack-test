<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\InvestmentCreated;
use App\Mail\InvestmentCreatedMail;
use Illuminate\Support\Facades\Mail;

final class SendInvestmentCreatedNotification
{
    public function handle(InvestmentCreated $event): void
    {
        $investment = $event->investment->loadMissing('owner');

        Mail::to($investment->owner->email)->send(new InvestmentCreatedMail($investment));
    }
}
