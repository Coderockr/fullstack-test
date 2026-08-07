<?php

declare(strict_types=1);

use App\Mail\InvestmentCreatedMail;
use App\Mail\InvestmentWithdrawnMail;
use App\Models\Investment;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    $this->user = User::factory()->create();
    Sanctum::actingAs($this->user);
    Mail::fake();
});

it('queues a creation e-mail to the owner', function () {
    $this->postJson('/api/investments', [
        'amount' => '1000.00',
        'invested_at' => CarbonImmutable::today()->toDateString(),
    ])->assertCreated();

    Mail::assertQueued(
        InvestmentCreatedMail::class,
        fn (InvestmentCreatedMail $mail) => $mail->hasTo($this->user->email),
    );
});

it('queues a withdrawal e-mail to the owner', function () {
    $investment = Investment::factory()->for($this->user, 'owner')->investedMonthsAgo(6)->create();

    $this->postJson("/api/investments/{$investment->id}/withdraw", [
        'withdrawal_date' => CarbonImmutable::today()->toDateString(),
    ])->assertOk();

    Mail::assertQueued(
        InvestmentWithdrawnMail::class,
        fn (InvestmentWithdrawnMail $mail) => $mail->hasTo($this->user->email),
    );
});

it('renders the creation e-mail template', function () {
    $investment = Investment::factory()->for($this->user, 'owner')->amount('1000.00')->create();

    expect((new InvestmentCreatedMail($investment))->render())
        ->toContain('Investment created')
        ->toContain('R$');
});

it('renders the withdrawal e-mail template with the taxed breakdown', function () {
    $investment = Investment::factory()
        ->for($this->user, 'owner')
        ->amount('1000.00')
        ->investedMonthsAgo(6)
        ->withdrawn()
        ->create();

    expect((new InvestmentWithdrawnMail($investment))->render())
        ->toContain('Investment withdrawn')
        ->toContain('22.5%');
});
