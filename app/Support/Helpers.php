<?php

if (!function_exists("allowed_subdomains")) {
    function allowed_subdomains()
    {
        return array('admin', "analytics", "finance", "attendance", );
    }
}

if (!function_exists('getDomain')) {
    function getDomain(): string
    {
        $host = request()->getHost() ?? '';
        return preg_replace(['/:\d+$/', '/^www\./', '/^app\./'], '', $host);
    }
}

if (!function_exists('isModule')) {
    function isModule(): bool
    {
        $domain = getDomain();
        $sub = explode('.', $domain)[0] ?? null;

        if ($sub) {
            return in_array($sub, allowed_subdomains());
        }

        return false;
    }
}

if (!function_exists('currentModule')) {
    function currentModule()
    {
        $domain = getDomain();
        $sub = explode('.', $domain)[0] ?? null;

        if (in_array($sub, allowed_subdomains())) {
            return $sub;
        }

        return false;
    }
}

if (!function_exists('formatPhoneNumber')) {
    function formatPhoneNumber(string $phone): ?string
    {
        if (!$phone)
            return null;

        $phone = preg_replace('/\s+/', '', trim($phone));
        $phone = preg_replace('/[^0-9+]/', '', $phone);
        $phone = ltrim($phone, '+');

        if (str_starts_with($phone, '254') && strlen($phone) >= 12) {
            return $phone;
        }

        if (str_starts_with($phone, '07') || str_starts_with($phone, '01')) {
            return '254' . substr($phone, 1);
        }

        if (preg_match('/^[71]\d{8}$/', $phone)) {
            return '254' . $phone;
        }

        return $phone;
    }
}