<?php

namespace App\Console\Commands;

use App\Mail\SchoolRenewalInvoiceMail;
use App\Mail\SchoolSuspendedMail;
use App\Models\School;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class CheckSchoolSubscriptions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:check-school-subscriptions';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today = now();
        $weekFromNow = $today->copy()->addWeek();

        // 1. Generate invoices 7 days before expiration
        $schools = School::where('subscription_expires_at', $weekFromNow)
            ->where('status', 'active')
            ->get();

        foreach ($schools as $school) {
            if (!$school->invoices()->where('status', 'pending')->exists()) {
                $plan = $school->plan;
                $invoice = $school->invoices()->create([
                    'invoice_number' => 'INV-' . strtoupper(uniqid()),
                    'invoice_date' => now(),
                    'total_amount' => $plan->price,
                    'status' => 'pending',
                ]);

                $invoice->items()->create([
                    'description' => 'Renewal for plan: ' . $plan->name,
                    'quantity' => 1,
                    'unit_price' => $plan->price,
                    'total' => $plan->price,
                ]);

                Mail::to($school->email)->send(new SchoolRenewalInvoiceMail($school, $invoice));
            }
        }

        // 2. Suspend expired unpaid schools
        $expiredSchools = School::where('subscription_expires_at', '<=', $today)
            ->where('status', 'active')
            ->get();

        foreach ($expiredSchools as $school) {
            $latestInvoice = $school->invoices()->latest()->first();

            if (!$latestInvoice || $latestInvoice->status !== 'paid') {
                $school->update(['status' => 'suspended']);
                // Optional: Notify admin and school
                Mail::to($school->email)->send(new SchoolSuspendedMail($school));
            } else {
                // If paid, renew subscription
                $school->update([
                    'subscription_expires_at' => now()->add(1, $school->plan->period)
                ]);
            }
        }

        $this->info('Subscription check complete.');
    }
}
