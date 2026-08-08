<?php

declare(strict_types=1);

namespace App\Mail;

use App\Models\Investment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

final class InvestmentWithdrawnMail extends Mailable implements ShouldQueue
{
    use Queueable;
    use SerializesModels;

    public function __construct(public readonly Investment $investment) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Your investment has been withdrawn');
    }

    public function content(): Content
    {
        return new Content(markdown: 'emails.investment-withdrawn');
    }
}
