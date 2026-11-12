<?php

namespace App\Services;

/*
|--------------------------------------------------------------------------
| SMS Service
|--------------------------------------------------------------------------
|
| Handles SMS sending via the SMS API with tenant-specific credentials
| support. Includes validation, logging, and message persistence.
|
*/

use App\Models\Message;
use App\Models\SchoolContact;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class SmsService
{
    /*
    |--------------------------------------------------------------------------
    | Properties
    |--------------------------------------------------------------------------
    */

    protected Client $client;
    protected string $apiBaseUrl;
    protected ?string $apiKey = null;
    protected ?string $partnerId = null;
    protected ?string $senderId = null;
    protected bool $credentialsLoaded = false;

    /*
    |--------------------------------------------------------------------------
    | Constructor
    |--------------------------------------------------------------------------
    */

    public function __construct()
    {
        $this->apiBaseUrl = rtrim('https://sms.frajosantech.co.ke/', '/');
        $this->client = new Client([
            'timeout' => 30,
            'connect_timeout' => 10,
            'verify' => app()->environment('production'),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Public Methods
    |--------------------------------------------------------------------------
    */

    /**
     * Send a single SMS
     *
     * @param string $mobile Recipient phone number
     * @param string $message SMS message content
     * @param string|null $scheduleTime Optional scheduled time
     * @param string|null $clientSmsId Optional client reference ID
     * @return array|bool Response info or false on failure
     * @throws ValidationException If input validation fails
     */
    public function sendSms(
        string $mobile,
        string $message,
        ?string $scheduleTime = null,
        ?string $clientSmsId = null
    ): array|bool {
        /*
        |-------------------------------------------------------------------
        | Load credentials and validate input
        |-------------------------------------------------------------------
        */

        $this->loadCredentials();
        $this->validateInput($mobile, $message, $scheduleTime, $clientSmsId);

        /*
        |-------------------------------------------------------------------
        | Build payload
        |-------------------------------------------------------------------
        | Remove null values using array_filter
        */

        $payload = array_filter([
            'apikey' => $this->apiKey,
            'partnerID' => $this->partnerId,
            'message' => $message,
            'shortcode' => $this->senderId,
            'mobile' => formatPhoneNumber($mobile),
            'timeToSend' => $scheduleTime,
            'clientsmsid' => $clientSmsId,
        ]);

        /*
        |-------------------------------------------------------------------
        | Send request and process response
        |-------------------------------------------------------------------
        */

        $response = $this->post('/api/services/sendsms', $payload);
        $responseInfo = $response['responses'][0] ?? null;

        if (!$responseInfo) {
            return false;
        }

        /*
        |-------------------------------------------------------------------
        | Save message record
        |-------------------------------------------------------------------
        */

        $this->saveMessage($responseInfo, $mobile, $message, $clientSmsId);

        return $responseInfo;
    }

    /*
    |--------------------------------------------------------------------------
    | Protected Methods - Credentials
    |--------------------------------------------------------------------------
    */

    /**
     * Load tenant-specific credentials
     *
     * Credentials are loaded once per request and cached in memory
     */
    protected function loadCredentials(): void
    {
        if ($this->credentialsLoaded) {
            return;
        }

        [$this->apiKey, $this->partnerId, $this->senderId] = $this->resolveCredentials();
        $this->credentialsLoaded = true;
    }

    /**
     * Resolve SMS credentials from tenant DB or config
     *
     * Priority: Tenant SchoolContact > Config defaults
     *
     * @return array [apiKey, partnerId, senderId]
     */
    protected function resolveCredentials(): array
    {
        /*
        |-------------------------------------------------------------------
        | Get default credentials from config
        |-------------------------------------------------------------------
        */

        $defaults = [
            'api_key' => config('services.sms.api_key'),
            'partner_id' => config('services.sms.partner_id'),
            'sender_id' => config('services.sms.sender_id'),
        ];

        /*
        |-------------------------------------------------------------------
        | Override with tenant credentials if available
        |-------------------------------------------------------------------
        */

        if (tenant()) {
            try {
                $contacts = SchoolContact::whereIn('contact_type', [
                    'api_key',
                    'partner_id',
                    'sender_id',
                ])->pluck('value', 'contact_type');

                return [
                    $contacts['api_key'] ?? $defaults['api_key'],
                    $contacts['partner_id'] ?? $defaults['partner_id'],
                    $contacts['sender_id'] ?? $defaults['sender_id'],
                ];
            } catch (\Exception $e) {
                Log::warning('Failed to load tenant SMS credentials', [
                    'tenant_id' => tenant()->getKey(),
                    'error' => $e->getMessage()
                ]);
            }
        }

        return array_values($defaults);
    }

    /*
    |--------------------------------------------------------------------------
    | Protected Methods - API Requests
    |--------------------------------------------------------------------------
    */

    /**
     * Centralized POST request handler
     *
     * @param string $endpoint API endpoint
     * @param array $payload Request payload
     * @return array Response data or empty array on failure
     */
    protected function post(string $endpoint, array $payload): array
    {
        try {
            $response = $this->client->post("{$this->apiBaseUrl}{$endpoint}", [
                'headers' => [
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ],
                'json' => $payload,
            ]);

            return json_decode($response->getBody()->getContents(), true) ?? [];
        } catch (RequestException $e) {
            Log::error('Failed to send SMS', [
                'error' => $e->getMessage(),
            ]);
            return [];
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Protected Methods - Validation
    |--------------------------------------------------------------------------
    */

    /**
     * Validate input data
     *
     * @param string $mobile Recipient phone number
     * @param string $message SMS message
     * @param string|null $scheduleTime Scheduled time
     * @param string|null $clientSmsId Client reference ID
     * @throws ValidationException If validation fails
     */
    protected function validateInput(
        string $mobile,
        string $message,
        ?string $scheduleTime,
        ?string $clientSmsId
    ): void {
        $validator = Validator::make([
            'mobile' => $mobile,
            'message' => $message,
            'scheduleTime' => $scheduleTime,
            'clientSmsId' => $clientSmsId,
        ], [
            'mobile' => ['required'],
            'message' => ['required', 'string'],
            'scheduleTime' => ['nullable', 'date_format:Y-m-d H:i', 'after_or_equal:now'],
            'clientSmsId' => ['nullable', 'string', 'max:50'],
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Protected Methods - Persistence
    |--------------------------------------------------------------------------
    */

    /**
     * Save message record to database
     *
     * @param array $responseInfo API response info
     * @param string $mobile Recipient phone number
     * @param string $message SMS content
     * @param string|null $clientSmsId Client reference ID
     */
    protected function saveMessage(
        array $responseInfo,
        string $mobile,
        string $message,
        ?string $clientSmsId
    ): void {
        /*
        |-------------------------------------------------------------------
        | Build base message data
        |-------------------------------------------------------------------
        */

        $data = [
            'mobile' => $responseInfo['mobile'] ?? $mobile,
            'message' => $message,
            'response_code' => $responseInfo['response-code'] ?? null,
            'response_description' => $responseInfo['response-description'] ?? null,
        ];

        /*
        |-------------------------------------------------------------------
        | Handle successful response
        |-------------------------------------------------------------------
        */

        if (($responseInfo['response-code'] ?? null) === 200) {
            $data['network_id'] = $responseInfo['networkid'] ?? null;

            if (!empty($responseInfo['messageid'])) {
                /*
                |-------------------------------------------------------------------
                | Update existing message by message_id
                |-------------------------------------------------------------------
                */

                Message::updateOrCreate(
                    ['message_id' => $responseInfo['messageid']],
                    $data
                );
            } else {
                /*
                |-------------------------------------------------------------------
                | Create new message with generated ID
                |-------------------------------------------------------------------
                */

                $data['message_id'] = $clientSmsId ?? uniqid('msg_', true);
                Message::create($data);
            }
        } else {
            /*
            |-------------------------------------------------------------------
            | Log failed message
            |-------------------------------------------------------------------
            */

            Message::create($data);
        }
    }
}