<?php

namespace App\Http\Controllers\LandLord;

use App\Http\Controllers\Controller;
use App\Http\Requests\Landlord\TenantStoreRequest;
use App\Mail\TenantRegistrationMail;
use App\Models\Plan;
use App\Models\Tenant;
use App\Services\SmsService;
use Illuminate\Support\Str;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;
use Yajra\DataTables\Facades\DataTables;

/*
|--------------------------------------------------------------------------
| Tenant Controller
|--------------------------------------------------------------------------
| Handles tenant management in the landlord application.
| Includes listing, creation, editing, invoice generation,
| tenant database provisioning, and account notifications.
*/
class TenantController extends Controller
{
    protected SmsService $smsService;

    /*
    |--------------------------------------------------------------------------
    | Constructor
    |--------------------------------------------------------------------------
    | Injects dependencies such as SmsService.
    */
    public function __construct(SmsService $smsService)
    {
        $this->smsService = $smsService;
    }

    /*
    |--------------------------------------------------------------------------
    | Index - List Tenants
    |--------------------------------------------------------------------------
    | Displays a list of tenants with DataTables support.
    | Supports AJAX datatable requests and Inertia rendering.
    */
    public function index(Request $request): Response|JsonResponse|RedirectResponse
    {
        try {
            if ($request->has('draw')) {
                $query = Tenant::with([
                    'domains',
                    'county',
                    'constituency',
                    'ward',
                    'location',
                    'plan',
                    'creator'
                ])->select('tenants.*')->latest('created_at');

                return DataTables::of($query)
                    ->addColumn('domains', fn($row) => view('backend.domains', compact('row'))->render())
                    ->addColumn('status', fn($row) => view('backend.tenant-status', compact('row'))->render())
                    ->addColumn('action', fn($row) => view('backend.tenant-actions', compact('row'))->render())
                    ->rawColumns(['domains', 'status', 'action'])
                    ->make(true);
            }

            return Inertia::render('LandLord/Backend/Tenant/Index');
        } catch (Throwable $e) {
            return back()->with('error', 'Failed to load tenant list: ' . $e->getMessage());
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Create - Tenant Form
    |--------------------------------------------------------------------------
    | Shows the form for creating a new tenant with available plans.
    */
    public function create(): Response
    {
        return Inertia::render('LandLord/Backend/Tenant/TenantForm', [
            'plans' => Plan::select(['id', 'name', 'price', 'period'])->get(),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Store - Create Tenant
    |--------------------------------------------------------------------------
    | Handles tenant creation, database provisioning, migrations, seeding,
    | and sending email/SMS notifications with login credentials.
    */
    public function store(TenantStoreRequest $request): JsonResponse
    {
        $validated = $request->validated();

        try {
            DB::beginTransaction();

            // Generate tenant info
            $tenantId = $this->generateTenantId($validated['name']);
            $dbName = 'tenant_' . $tenantId;
            $plan = Plan::findOrFail($validated['plan_id'], ['id', 'name', 'price', 'period']);

            // Create tenant
            $tenant = Tenant::create($validated + [
                'id' => $tenantId,
                'database' => $dbName,
                'expires_at' => now()->add(1, $plan->period),
                'created_by' => Auth::id(),
            ]);

            // Assign domain
            $tenant->domains()->create(['domain' => $validated['domain']]);

            // Create invoice
            $invoice = $this->createInvoice($tenant, $plan);

            DB::commit();

            // Database provisioning
            $this->createDatabase($dbName);
            $this->setDatabase($dbName);
            $this->migrateTenant();
            $this->seedTenant();

            // Default admin user
            $adminUser = [
                'email' => 'admin@gmail.com',
                'password' => 'admin123',
            ];

            // Send notifications
            $this->sendAccountCreationEmail($tenant, $invoice, $adminUser);
            $this->sendAccountCreationSms($tenant, $invoice, $adminUser);

            return response()->json([
                'success' => true,
                'message' => 'Tenant created and migrated successfully.',
            ]);
        } catch (Throwable $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create tenant: ' . $e->getMessage(),
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Show Tenant
    |--------------------------------------------------------------------------
    | Displays tenant details with related data.
    */
    public function show(Tenant $tenant): Response
    {
        $tenant->load(['domains', 'county', 'constituency', 'ward', 'location', 'plan', 'creator', 'invoices']);

        return Inertia::render('LandLord/Backend/Tenant/Show', [
            'school' => $tenant
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Edit Tenant
    |--------------------------------------------------------------------------
    | Shows the tenant edit form with preloaded data.
    */
    public function edit(Tenant $tenant): Response
    {
        $tenant->load(['domains', 'county', 'constituency', 'ward', 'location', 'plan', 'creator', 'invoices']);

        return Inertia::render('LandLord/Backend/Tenant/TenantForm', [
            'school' => $tenant,
            'plans' => Plan::select(['id', 'name', 'price', 'period'])->get(),
        ]);
    }

    public function update(Tenant $tenant)
    {
        try {
            return response()->json([
                'success' => true,
                'message' => 'Tenant updated successfully.',
            ]);
        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create tenant: ' . $e->getMessage(),
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Utility Methods
    |--------------------------------------------------------------------------
    | Helper functions for tenant ID generation, invoices,
    | database creation, migration, seeding, and notifications.
    */

    protected function generateTenantId(string $name): string
    {
        $cleanName = preg_replace('/[^a-z0-9]/i', '', strtolower($name));
        return substr($cleanName, 0, 8) . '_' . Str::random(4);
    }

    protected function createInvoice(Tenant $tenant, Plan $plan)
    {
        $dueDate = match ($plan->period) {
            'month' => now()->addMonth(),
            'year' => now()->addYear(),
            'week' => now()->addWeek(),
            default => now()->addYear(),
        };

        $invoice = $tenant->invoices()->create([
            'invoice_number' => strtoupper(Str::random(6)),
            'description' => 'Registration for plan: ' . $plan->name,
            'invoice_date' => now(),
            'due_date' => $dueDate,
            'total_amount' => $plan->price,
        ]);

        $invoice->items()->create([
            'description' => 'Registration for plan: ' . $plan->name,
            'quantity' => 1,
            'unit_price' => $plan->price,
            'total' => $plan->price,
        ]);

        return $invoice;
    }

    protected function createDatabase(string $dbName): void
    {
        DB::statement("CREATE DATABASE IF NOT EXISTS `$dbName` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    }

    protected function setDatabase(string $dbName): void
    {
        config(['database.connections.tenant.database' => $dbName]);
        DB::purge('tenant');
    }

    protected function migrateTenant(): void
    {
        Artisan::call('migrate', [
            '--database' => 'tenant',
            '--path' => 'database/migrations/tenant',
            '--force' => true,
            '--no-interaction' => true,
        ]);
    }

    protected function seedTenant(): void
    {
        Artisan::call('db:seed', [
            '--database' => 'tenant',
            '--class' => 'TenantDatabaseSeeder',
            '--force' => true,
            '--no-interaction' => true,
        ]);
    }

    protected function sendAccountCreationEmail(Tenant $tenant, $invoice, $adminUser): void
    {
        Mail::to($tenant->email)->send(new TenantRegistrationMail($tenant, $invoice, $adminUser));
    }

    protected function sendAccountCreationSms(Tenant $tenant, $invoice, $adminUser): void
    {
        $domain = $tenant->domains->first()->domain;
        $loginUrl = "https://admin.{$domain}";
        $supportPhone = '+254796594366';

        $smsMessage = "School Account Creation\n\n"
            . "Name: {$tenant->name}\n"
            . "Domain: {$domain}\n\n"
            . "Plan: {$tenant->plan->name}\n"
            . "Price: KES {$invoice->total_amount}\n\n"
            . "Login Url: {$loginUrl}\n"
            . "Username/Email: {$adminUser['email']}\n"
            . "Password: {$adminUser['password']}\n\n"
            . "Support: {$supportPhone}";

        $this->smsService->sendSms($tenant->phone, $smsMessage);
    }
}
