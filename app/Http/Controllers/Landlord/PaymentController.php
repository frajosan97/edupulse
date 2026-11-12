<?php

declare(strict_types=1);

namespace App\Http\Controllers\Landlord;

use App\Concerns\SerializesPaginator;
use App\Http\Controllers\Controller;
use App\Http\Requests\IndexPaymentRequest;
use App\Http\Requests\StorePaymentRequest;
use App\Http\Requests\UpdatePaymentRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\PaymentMethod;
use App\Services\Landlord\PaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    use SerializesPaginator;

    public function __construct(
        private readonly PaymentService $paymentService
    ) {
    }

    public function index(IndexPaymentRequest $request): Response
    {
        $filters = $request->filters();

        $paginator = Payment::query()
            ->with(['invoice:id,invoice_number,total,amount_paid,status'])
            ->with('paymentMethod:id,code,name')
            ->filtered($filters)
            ->latest('payment_date')
            ->paginate($filters['per_page'])
            ->withQueryString();

        return Inertia::render('landlord/payments/index', [
            'payments' => $this->paginateToArray($paginator, PaymentResource::class),
            'filters' => $filters,
            'stats' => $this->paymentService->summaryStats(),
            'invoices' => $this->invoiceOptions(),
            'paymentMethods' => $this->paymentMethodOptions(),
            'hasShowRoute' => Route::has('payments.show'),
        ]);
    }

    public function store(StorePaymentRequest $request): RedirectResponse
    {
        $this->authorize('create', Payment::class);

        $payment = $this->paymentService->create($request->validated());

        return redirect()
            ->route('payments.index')
            ->with('success', "Payment #{$payment->id} recorded successfully.");
    }

    public function show(Payment $payment): Response
    {
        $this->authorize('view', $payment);

        $payment->load([
            'invoice:id,invoice_number,total,amount_paid,status',
            'paymentMethod:id,code,name',
        ]);

        return Inertia::render('landlord/payments/show', [
            'payment' => new PaymentResource($payment),
        ]);
    }

    public function update(UpdatePaymentRequest $request, Payment $payment): RedirectResponse
    {
        $this->authorize('update', $payment);

        $this->paymentService->update($payment, $request->validated());

        return redirect()
            ->route('payments.index')
            ->with('success', 'Payment updated successfully.');
    }

    public function destroy(Payment $payment): RedirectResponse
    {
        $this->authorize('delete', $payment);

        $this->paymentService->delete($payment);

        return redirect()
            ->route('payments.index')
            ->with('success', 'Payment deleted successfully.');
    }

    /* --------------------------------------------------------------------- */

    /**
     * @return Collection<int, array{id: int, invoice_number: string, total: float, amount_paid: float, amount_due: float, currency: string, status: string}>
     */
    private function invoiceOptions(): Collection
    {
        return Invoice::query()
            ->select(['id', 'invoice_number', 'total', 'amount_paid', 'currency', 'status'])
            ->outstanding()
            ->orderByDesc('invoice_date')
            ->get()
            ->map(fn($inv) => [
                'id' => $inv->id,
                'invoice_number' => $inv->invoice_number,
                'total' => (float) $inv->total,
                'amount_paid' => (float) $inv->amount_paid,
                'amount_due' => (float) ($inv->total - $inv->amount_paid),
                'currency' => $inv->currency,
                'status' => $inv->status,
            ]);
    }

    /**
     * @return Collection<int, array{id: int, code: string, name: string, icon: string|null, is_active: bool, display_order: int, settings: array|null}>
     */
    private function paymentMethodOptions(): Collection
    {
        return PaymentMethod::query()
            ->select(['id', 'code', 'name', 'icon', 'is_active', 'display_order', 'settings'])
            ->where('is_active', true)
            ->orderBy('display_order')
            ->orderBy('name')
            ->get()
            ->map(fn($m) => [
                'id' => $m->id,
                'code' => $m->code,
                'name' => $m->name,
                'icon' => $m->icon,
                'is_active' => $m->is_active,
                'display_order' => $m->display_order,
                'settings' => $m->settings, // Pass the settings object to the frontend
            ]);
    }
}