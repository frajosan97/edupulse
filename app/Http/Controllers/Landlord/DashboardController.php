<?php

declare(strict_types=1);

namespace App\Http\Controllers\Landlord;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Module;
use App\Models\Payment;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    private const TREND_DAYS = 30;

    /** @var list<string>|null */
    private ?array $paymentColumns = null;

    public function index(): Response
    {
        return Inertia::render('dashboards/landlord-admin', [
            'stats' => $this->stats(),
            'revenueTrend' => $this->revenueTrend(),
            'tenantGrowth' => $this->tenantGrowth(),
            'invoiceBreakdown' => $this->invoiceBreakdown(),
            'moduleDistribution' => $this->moduleDistribution(),
            'paymentMethods' => $this->paymentMethods(),
            'userRoles' => $this->userRoles(),
            'topTenants' => $this->topTenants(),
            'recentActivity' => $this->recentActivity(),
        ]);
    }

    /* -----------------------------------------------------------------
     | Aggregators
     |-----------------------------------------------------------------*/

    /**
     * @return array<string, mixed>
     */
    private function stats(): array
    {
        $monthStart = now()->startOfMonth();
        $lastMonthStart = now()->subMonthNoOverflow()->startOfMonth();
        $lastMonthEnd = now()->subMonthNoOverflow()->endOfMonth();

        // Tenants
        $tenantsTotal = Tenant::query()->count();
        $tenantsActive = Tenant::query()->where('is_active', true)->count();
        $newThisMonth = Tenant::query()->where('created_at', '>=', $monthStart)->count();
        $newLastMonth = Tenant::query()
            ->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])
            ->count();

        // Modules
        $modulesTotal = Module::query()->count();
        $modulesActive = Module::query()->where('is_active', true)->count();

        // Invoices
        $billedThisMonth = (float) Invoice::query()
            ->where('status', '!=', 'cancelled')
            ->whereBetween('invoice_date', [$monthStart, now()])
            ->sum('total');
        $billedLastMonth = (float) Invoice::query()
            ->where('status', '!=', 'cancelled')
            ->whereBetween('invoice_date', [$lastMonthStart, $lastMonthEnd])
            ->sum('total');
        $outstanding = (float) Invoice::query()
            ->whereIn('status', ['issued', 'partially_paid'])
            ->sum(DB::raw('total - amount_paid'));
        $overdue = Invoice::query()
            ->whereIn('status', ['issued', 'partially_paid'])
            ->whereDate('due_date', '<', now())
            ->count();

        // Payments
        $paidCol = $this->paymentDateColumn();
        $collectedThisMonth = (float) Payment::query()
            ->whereBetween($paidCol, [$monthStart, now()])
            ->sum('amount');
        $collectedLastMonth = (float) Payment::query()
            ->whereBetween($paidCol, [$lastMonthStart, $lastMonthEnd])
            ->sum('amount');

        // Users
        $usersTotal = User::query()->count();
        $usersNewThisMonth = User::query()
            ->where('created_at', '>=', $monthStart)
            ->count();

        return [
            'tenants' => [
                'total' => $tenantsTotal,
                'active' => $tenantsActive,
                'new_this_month' => $newThisMonth,
                'trend_pct' => $this->pct($newThisMonth, $newLastMonth),
            ],
            'modules' => [
                'total' => $modulesTotal,
                'active' => $modulesActive,
            ],
            'invoices' => [
                'billed_this_month' => round($billedThisMonth, 2),
                'billed_last_month' => round($billedLastMonth, 2),
                'trend_pct' => $this->pct($billedThisMonth, $billedLastMonth),
                'outstanding' => round($outstanding, 2),
                'overdue' => $overdue,
            ],
            'payments' => [
                'collected_this_month' => round($collectedThisMonth, 2),
                'collected_last_month' => round($collectedLastMonth, 2),
                'trend_pct' => $this->pct($collectedThisMonth, $collectedLastMonth),
            ],
            'users' => [
                'total' => $usersTotal,
                'new_this_month' => $usersNewThisMonth,
            ],
        ];
    }

    /**
     * Daily billed vs. collected over the trend window.
     *
     * @return list<array{label: string, billed: float, collected: float}>
     */
    private function revenueTrend(): array
    {
        $from = now()->subDays(self::TREND_DAYS - 1)->startOfDay();
        $paidCol = $this->paymentDateColumn();

        $billed = Invoice::query()
            ->where('status', '!=', 'cancelled')
            ->where('invoice_date', '>=', $from)
            ->selectRaw('DATE(invoice_date) as d, SUM(total) as total')
            ->groupBy('d')
            ->pluck('total', 'd');

        $collected = Payment::query()
            ->where($paidCol, '>=', $from)
            ->selectRaw("DATE({$paidCol}) as d, SUM(amount) as total")
            ->groupBy('d')
            ->pluck('total', 'd');

        return collect(range(0, self::TREND_DAYS - 1))
            ->map(function (int $i) use ($from, $billed, $collected): array {
                /** @var Carbon $day */
                $day = $from->copy()->addDays($i);
                $key = $day->toDateString();

                return [
                    'label' => $day->format('M j'),
                    'billed' => round((float) ($billed[$key] ?? 0), 2),
                    'collected' => round((float) ($collected[$key] ?? 0), 2),
                ];
            })
            ->all();
    }

    /**
     * @return list<array{label: string, tenants: int}>
     */
    private function tenantGrowth(): array
    {
        $start = now()->subMonthsNoOverflow(5)->startOfMonth();
        $driver = DB::connection()->getDriverName();
        $expr = $driver === 'sqlite'
            ? "strftime('%Y-%m', created_at)"
            : "DATE_FORMAT(created_at, '%Y-%m')";

        $rows = Tenant::query()
            ->where('created_at', '>=', $start)
            ->selectRaw("{$expr} as ym, COUNT(*) as total")
            ->groupBy('ym')
            ->get()
            ->keyBy('ym');

        return collect(range(0, 5))
            ->map(function (int $i) use ($start, $rows): array {
                /** @var Carbon $month */
                $month = $start->copy()->addMonthsNoOverflow($i);
                $row = $rows[$month->format('Y-m')] ?? null;

                return [
                    'label' => $month->format('M'),
                    'tenants' => (int) (data_get($row, 'total') ?? 0),
                ];
            })
            ->all();
    }

    /**
     * @return array<string, int>
     */
    private function invoiceBreakdown(): array
    {
        $monthStart = now()->startOfMonth();

        $rows = Invoice::query()
            ->where('created_at', '>=', $monthStart)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status')
            ->map(fn($v): int => (int) $v)
            ->all();

        return [
            'draft' => $rows['draft'] ?? 0,
            'issued' => $rows['issued'] ?? 0,
            'partially_paid' => $rows['partially_paid'] ?? 0,
            'paid' => $rows['paid'] ?? 0,
            'cancelled' => $rows['cancelled'] ?? 0,
        ];
    }

    /**
     * Active tenants per module.
     *
     * @return list<array{name: string, code: string, tenants: int}>
     */
    private function moduleDistribution(): array
    {
        return Module::query()
            ->withCount([
                'tenants as tenants_count' => fn($q) => $q->where('tenant_module.status', 'active'),
            ])
            ->orderByDesc('tenants_count')
            ->take(6)
            ->get(['id', 'name', 'code'])
            ->map(function ($m): array {
                /** @var Module $m */
                return [
                    'name' => (string) $m->name,
                    'code' => (string) $m->code,
                    'tenants' => (int) $m->tenants_count,
                ];
            })
            ->all();
    }

    /**
     * Payment volume split by method for the current month.
     *
     * @return list<array{name: string, value: float}>
     */
    private function paymentMethods(): array
    {
        $monthStart = now()->startOfMonth();
        $paidCol = $this->paymentDateColumn();
        $methodCol = $this->paymentMethodColumn();

        return Payment::query()
            ->where($paidCol, '>=', $monthStart)
            ->selectRaw("COALESCE({$methodCol}, 'other') as method, SUM(amount) as total")
            ->groupBy('method')
            ->orderByDesc('total')
            ->get()
            ->map(fn($row) => [
                'name' => (string) data_get($row, 'method'),
                'value' => round((float) data_get($row, 'total'), 2),
            ])
            ->all();
    }

    /**
     * Users grouped by primary role.
     *
     * @return list<array{role: string, count: int}>
     */
    private function userRoles(): array
    {
        return DB::table('model_has_roles')
            ->join('roles', 'roles.id', '=', 'model_has_roles.role_id')
            ->where('model_has_roles.model_type', User::class)
            ->selectRaw('roles.name as role, COUNT(*) as count')
            ->groupBy('roles.name')
            ->orderByDesc('count')
            ->get()
            ->map(fn($row) => [
                'role' => (string) data_get($row, 'role'),
                'count' => (int) data_get($row, 'count'),
            ])
            ->all();
    }

    /**
     * @return list<array{id: string, name: string, revenue: float}>
     */
    private function topTenants(): array
    {
        $monthStart = now()->startOfMonth();

        return Invoice::query()
            ->where('invoice_date', '>=', $monthStart)
            ->where('status', '!=', 'cancelled')
            ->selectRaw('tenant_id, SUM(total) as revenue')
            ->groupBy('tenant_id')
            ->orderByDesc('revenue')
            ->take(5)
            ->with('tenant:id,name')
            ->get()
            ->map(function ($inv): array {
                /** @var Invoice $inv */
                return [
                    'id' => (string) $inv->tenant_id,
                    'name' => $inv->tenant?->name ?? '—',
                    'revenue' => round((float) $inv->revenue, 2),
                ];
            })
            ->all();
    }

    /**
     * @return list<array{type: string, title: string, description: string, amount: float|null, at: string|null}>
     */
    private function recentActivity(): array
    {
        $paidCol = $this->paymentDateColumn();

        $invoices = Invoice::query()
            ->latest('created_at')
            ->take(4)
            ->get(['invoice_number', 'total', 'status', 'created_at'])
            ->map(function ($inv): array {
                /** @var Invoice $inv */
                return [
                    'type' => 'invoice',
                    'title' => "Invoice {$inv->invoice_number}",
                    'description' => ucfirst((string) $inv->status),
                    'amount' => (float) $inv->total,
                    'at' => $inv->created_at?->toIso8601String(),
                ];
            });

        $payments = Payment::query()
            ->latest($paidCol)
            ->take(4)
            ->get(['amount', $paidCol])
            ->map(function ($p) use ($paidCol): array {
                /** @var Payment $p */
                return [
                    'type' => 'payment',
                    'title' => 'Payment received',
                    'description' => 'Amount collected',
                    'amount' => (float) $p->amount,
                    'at' => $p->{$paidCol}?->toIso8601String(),
                ];
            });

        $tenants = Tenant::query()
            ->latest('created_at')
            ->take(4)
            ->get(['name', 'created_at'])
            ->map(function ($t): array {
                /** @var Tenant $t */
                return [
                    'type' => 'tenant',
                    'title' => "New tenant: {$t->name}",
                    'description' => 'Onboarded',
                    'amount' => null,
                    'at' => $t->created_at?->toIso8601String(),
                ];
            });

        return $invoices
            ->concat($payments)
            ->concat($tenants)
            ->sortByDesc('at')
            ->take(10)
            ->values()
            ->all();
    }

    /* -----------------------------------------------------------------
     | Schema helpers (payments column resolution)
     |-----------------------------------------------------------------*/

    private function paymentDateColumn(): string
    {
        $cols = $this->paymentColumns();
        foreach (['paid_at', 'payment_date', 'paid_on', 'date', 'created_at'] as $c) {
            if (in_array($c, $cols, true)) {
                return $c;
            }
        }
        return 'created_at';
    }

    private function paymentMethodColumn(): string
    {
        $cols = $this->paymentColumns();
        foreach (['method', 'payment_method', 'channel', 'provider'] as $c) {
            if (in_array($c, $cols, true)) {
                return $c;
            }
        }
        return 'id';
    }

    /**
     * @return list<string>
     */
    private function paymentColumns(): array
    {
        return $this->paymentColumns ??= Schema::getColumnListing('payments');
    }

    private function pct(float|int $current, float|int $previous): float
    {
        if ($previous <= 0) {
            return $current > 0 ? 100.0 : 0.0;
        }
        return round((($current - $previous) / $previous) * 100, 1);
    }
}