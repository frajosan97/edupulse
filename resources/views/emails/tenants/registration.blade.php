@component('mail::message')
# Welcome to {{ config('app.name') }}!

Dear {{ $tenant->name }} Administrator,

Thank you for creating your school account with us. Below are your account details:

## 🏫 School Information
**Name:** {{ $tenant->name }}
**Domain:** {{ $tenant->domains->first()->domain }}
**Admin Email:** {{ $adminUser['email'] }}
**Temporary Password:** {{ $adminUser['password'] }}

## 📝 Subscription Details
**Plan:** {{ $tenant->plan->name }}
**Amount:** KES {{ number_format($invoice->total_amount, 2) }}

## 🔑 Access Information
@component('mail::button', ['url' => "https://admin.{$tenant->domains->first()->domain}", 'color' => 'success'])
Login to Admin Portal
@endcomponent

**Login URL:**
[https://admin.{{ $tenant->domains->first()->domain }}](https://admin.{{ $tenant->domains->first()->domain }})
**Username/Email:** {{ $adminUser['email'] }}
**Temporary Password:** {{ $adminUser['password'] }}

## ℹ️ Support Information
For any assistance, please contact our support team at:
📞 +254796594366
📧 {{ config('mail.from.address') }}

@component('mail::panel')
For security reasons, we recommend changing your password after first login and not sharing these credentials with
anyone.
@endcomponent

Thank you for choosing {{ config('app.name') }}!

Best regards,
{{ config('app.name') }} Team
@endcomponent