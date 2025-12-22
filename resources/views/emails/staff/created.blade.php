@component('mail::message')
# Hello {{ $user->name }},

Your staff account has been created. Here are your login details:

- **Email:** {{ $user->email }}
- **Password:** {{ $password }}

Click below to activate your account:

@component('mail::button', ['url' => $activationLink])
Activate Account
@endcomponent

Thanks,<br>
{{ config('app.name') }}
@endcomponent