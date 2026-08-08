<x-mail::message>
# Investment withdrawn ✅

Hi {{ $investment->owner->name }},

Your investment has been withdrawn. Here is the settlement summary.

@php
    $ratePercent = rtrim(rtrim(number_format((float) $investment->withdrawal_tax_rate * 100, 2), '0'), '.');
@endphp

<x-mail::table>
| Detail                       | Value                                               |
|:-----------------------------|----------------------------------------------------:|
| Principal                    | {{ $investment->amount->formatToLocale('pt_BR') }}        |
| Gross balance                | {{ $investment->withdrawal_gross->formatToLocale('pt_BR') }} |
| Gains                        | {{ $investment->withdrawal_gains->formatToLocale('pt_BR') }} |
| Tax ({{ $ratePercent }}%)    | {{ $investment->withdrawal_tax->formatToLocale('pt_BR') }} |
| **Net received**             | **{{ $investment->withdrawal_net->formatToLocale('pt_BR') }}** |
| Withdrawal date              | {{ $investment->withdrawn_at->format('d/m/Y') }}    |
</x-mail::table>

Taxes are applied only to the gain portion, at the rate for the investment's age.

<x-mail::button :url="config('app.frontend_url')">
Back to my investments
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
