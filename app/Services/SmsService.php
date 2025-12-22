<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class SmsService
{
    protected $apiKey;
    protected $partnerId;
    protected $apiBaseUrl;
    protected $senderId;
    protected $client;

    public function __construct()
    {
        $this->apiKey = config('services.sms.api_key');
        $this->partnerId = config('services.sms.partner_id');
        $this->apiBaseUrl = rtrim(config('services.sms.api_url'), '/');
        $this->senderId = config('services.sms.sender_id');

        $this->client = new Client([
            'timeout' => 30,
            'connect_timeout' => 10,
            'verify' => config('app.env') === 'production',
        ]);
    }

    public function sendSms(
        string $mobile,
        string $message,
        ?string $scheduleTime = null,
        ?string $clientSmsId = null
    ) {
        $validator = Validator::make([
            'mobile' => $mobile,
            'message' => $message,
            'scheduleTime' => $scheduleTime,
            'clientSmsId' => $clientSmsId,
        ], [
            'mobile' => ['required'],
            'message' => 'required|string',
            'scheduleTime' => 'nullable|date_format:Y-m-d H:i|after_or_equal:now',
            'clientSmsId' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $payload = [
            'apikey' => $this->apiKey,
            'partnerID' => $this->partnerId,
            'message' => $message,
            'shortcode' => $this->senderId,
            'mobile' => formatPhoneNumber($mobile),
        ];

        if ($scheduleTime) {
            $payload['timeToSend'] = $scheduleTime;
        }

        if ($clientSmsId) {
            $payload['clientsmsid'] = $clientSmsId;
        }

        try {
            $response = $this->client->post("{$this->apiBaseUrl}/api/services/sendsms/", [
                'headers' => [
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ],
                'json' => $payload,
            ]);

            $responseData = json_decode($response->getBody(), true);
            return $responseData['responses'][0] ?? false;

        } catch (RequestException $e) {
            $this->logRequestException($e, 'Single SMS sending failed');
            return false;
        }
    }

    public function getBalance()
    {
        try {
            $response = $this->client->post("{$this->apiBaseUrl}/api/services/getbalance/", [
                'headers' => [
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'apikey' => $this->apiKey,
                    'partnerID' => $this->partnerId,
                ],
            ]);

            $responseData = json_decode($response->getBody(), true);
            return $responseData['responses'] ?? false;

        } catch (RequestException $e) {
            $this->logRequestException($e, 'Balance check failed');
            return false;
        }
    }

    /**
     * Handle and log request exceptions
     */
    protected function logRequestException(RequestException $e, string $context): void
    {
        if ($e->hasResponse()) {
            $response = $e->getResponse();
            $statusCode = $response->getStatusCode();
            $body = json_decode((string) $response->getBody(), true);

            Log::error("{$context}: HTTP {$statusCode}", [
                'response' => $body,
                'exception' => $e->getMessage(),
            ]);
        } else {
            Log::error("{$context}: No response received", [
                'exception' => $e->getMessage(),
            ]);
        }
    }
}