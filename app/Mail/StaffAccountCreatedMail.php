<?php

namespace App\Mail;

use App\Models\Tenant\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class StaffAccountCreatedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $password;

    public function __construct(User $user, $password)
    {
        $this->user = $user;
        $this->password = $password;
    }

    public function build()
    {
        return $this->subject('Your Account Has Been Created')
            ->markdown('emails.staff.created')
            ->with([
                'user' => $this->user,
                'password' => $this->password,
                'activationLink' => url('/activate/' . $this->user->token),
            ]);
    }
}
