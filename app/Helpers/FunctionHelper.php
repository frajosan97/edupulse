<?php

use Illuminate\Support\Facades\Auth;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

/*
|--------------------------------------------------------------------------
| Helper: Get Domain
|--------------------------------------------------------------------------
| Extracts and normalizes the host from the current request.
| Removes port numbers and prefixes like www. or app.
*/
if (!function_exists('getDomain')) {
    function getDomain(): string
    {
        $host = request()->getHost() ?? '';

        // Remove port number, www., and app. prefixes
        $host = preg_replace(
            ['/:\d+$/', '/^www\./', '/^app\./'],
            '',
            $host
        );

        return $host;
    }
}

/*
|--------------------------------------------------------------------------
| Helper: Check if Landlord
|--------------------------------------------------------------------------
*/
if (!function_exists('isLandlord')) {
    function isLandlord(): bool
    {
        $landlordDomains = config('tenancy.central_domains');
        
        return in_array(
            getDomain(),
            $landlordDomains,
            true
        );
    }
}

/*
|--------------------------------------------------------------------------
| Helper: Menu Type
|--------------------------------------------------------------------------
*/
if (!function_exists('menuType')) {
    function menuType(): string
    {
        $accessMode = accessMode();

        $rolesToCheck = [
            'admin',
            'staff',
            'student',
            'parent',
            'finance',
            'alumni',
        ];

        $requestType = in_array(
            $accessMode,
            $rolesToCheck,
            true
        ) ? $accessMode : 'main';

        return (isLandlord() ? 'landlord' : 'tenant') . '-' . $requestType;
    }
}

if (!function_exists('accessMode')) {
    function accessMode(): string
    {
        $segments = request()->segments();
        return $segments[0] ?? 'main';
    }
}

/*
|--------------------------------------------------------------------------
| Helper: Generate OTP
|--------------------------------------------------------------------------
*/
if (!function_exists('generateOtp')) {
    function generateOtp(): int
    {
        return random_int(100000, 999999);
    }
}

/*
|--------------------------------------------------------------------------
| Helper: Format Phone Number
|--------------------------------------------------------------------------
*/
if (!function_exists('formatPhoneNumber')) {
    function formatPhoneNumber(string $phoneNumber): string
    {
        $phoneNumber = preg_replace('/[\s()-]/', '', $phoneNumber);

        if (preg_match('/^0[17]\d{8}$/', $phoneNumber)) {
            return '254' . substr($phoneNumber, 1);
        }

        if (str_starts_with($phoneNumber, '+254')) {
            return substr($phoneNumber, 1);
        }

        return $phoneNumber;
    }
}



/*
|--------------------------------------------------------------------------
| Helper: Class Teacher Comment
|--------------------------------------------------------------------------
| Generates comments based on grade, mean score, trend (improving / dropping),
| and class position.
*/
if (!function_exists('teacherComment')) {
    function teacherComment(string $grade, int $trend = null, int $position = null): string
    {
        // Trend messages
        $trendMessage = match ($trend) {
            1 => "Good improvement noted. ",
            -1 => "Performance has declined. Greater effort is required. ",
            default => "",
        };

        // Grade-based comments
        $mainComment = match (strtoupper($grade)) {
            'A', 'A-' =>
            "Excellent performance. Keep up the exceptional work.",
            'B+', 'B', 'B-' =>
            "A good performance. With more consistency, you can reach higher.",
            'C+', 'C', 'C-' =>
            "A fair performance. Aim higher with improved commitment.",
            'D+', 'D', 'D-' =>
            "Below average. More focus and discipline are needed.",
            'E' =>
            "Very weak performance. Immediate academic support is needed.",
            default =>
            "Keep working hard and stay focused.",
        };

        // Position-based addition
        $positionNote = "";
        if (!is_null($position)) {
            if ($position <= 5) {
                $positionNote = " Outstanding class position.";
            } elseif ($position <= 15) {
                $positionNote = " Good class standing.";
            } else {
                $positionNote = " Aim to improve your class position.";
            }
        }

        return $trendMessage . $mainComment . $positionNote;
    }
}



/*
|--------------------------------------------------------------------------
| Helper: Principal Comment
|--------------------------------------------------------------------------
| More formal institutional comment.
*/
if (!function_exists('principalComment')) {
    function principalComment(string $grade, int $trend = null): string
    {
        // Trend messages
        $trendMessage = match ($trend) {
            1 => "The learner shows commendable improvement. ",
            -1 => "There is a decline that needs immediate attention. ",
            default => "",
        };

        // Grade-based comments
        $mainComment = match (strtoupper($grade)) {
            'A', 'A-' =>
            "An excellent performance demonstrating strong academic discipline.",
            'B+', 'B', 'B-' =>
            "A good performance. Greater effort can elevate the learner further.",
            'C+', 'C', 'C-' =>
            "A moderate performance. The learner should strive for higher achievement.",
            'D+', 'D', 'D-' =>
            "Below expectations. The learner needs structured improvement strategies.",
            'E' =>
            "A very weak performance. Significant learning support is required.",
            default =>
            "Maintain focus and continue working hard.",
        };

        return $trendMessage . $mainComment;
    }
}

if (!function_exists('generate_qrcode')) {
    /**
     * Generate a QR Code
     *
     * @param string $data
     * @param int $size
     * @param string $format svg|png
     * @return string
     */
    function generate_qrcode(string $data, int $size = 120)
    {
        $svg = QrCode::format('svg')
            ->size($size)
            ->margin(1)
            ->generate($data);

        // Remove the XML declaration
        return preg_replace('/<\?xml.*?\?>/', '', $svg);
    }
}