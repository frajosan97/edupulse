<?php

namespace App\Mail;

use App\Models\Invoice;
use App\Models\Tenant;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TenantRegistrationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $tenant;
    public $invoice;
    public $adminUser;

    /**
     * Create a new message instance.
     */
    public function __construct(Tenant $tenant, Invoice $invoice, $adminUser)
    {
        $this->tenant = $tenant;
        $this->invoice = $invoice;
        $this->adminUser = $adminUser;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Tenant Registration Mail',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.tenants.registration',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
