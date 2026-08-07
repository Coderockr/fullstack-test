<x-mail::message>
# Investment created 🎉

Hi {{ $investment->owner->name }},

Your investment has been registered successfully.

<x-mail::table>
| Detail        | Value                                            |
|:--------------|-------------------------------------------------:|
| Amount        | {{ $investment->amount->formatToLocale('pt_BR') }}     |
| Creation date | {{ $investment->invested_at->format('d/m/Y') }}  |
| Monthly gain  | 0.52% (compound)                                 |
</x-mail::table>

You'll earn **0.52% compound interest** every month, credited on the anniversary
day of the creation date.

<x-mail::button :url="config('app.frontend_url')">
View my investments
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
