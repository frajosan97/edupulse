<?php

declare(strict_types=1);

namespace App\Http\Controllers\Landlord;

use App\Concerns\SerializesPaginator;
use App\Http\Controllers\Controller;
use App\Http\Requests\IndexInvoiceRequest;
use App\Http\Requests\StoreInvoiceRequest;
use App\Http\Requests\UpdateInvoiceRequest;
use App\Http\Resources\InvoiceResource;
use App\Models\Invoice;
use App\Models\Module;
use App\Models\Tenant;
use App\Services\Landlord\InvoiceService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    use SerializesPaginator;

    public function __construct(
        private readonly InvoiceService $invoiceService
    ) {
    }

    public function index(IndexInvoiceRequest $request): Response
    {
        $filters = $request->filters();

        $paginator = Invoice::query()
            ->with(['tenant:id,name'])
            ->withCount('items')
            ->filtered($filters)
            ->latest('invoice_date')
            ->paginate($filters['per_page'])
            ->withQueryString();

        return Inertia::render('landlord/invoices/index', [
            'invoices' => $this->paginateToArray($paginator, InvoiceResource::class),
            'filters' => $filters,
            'stats' => $this->invoiceService->summaryStats(),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Invoice::class);

        return Inertia::render('landlord/invoices/create', [
            'tenants' => $this->tenantOptions(),
            'modules' => $this->moduleOptions(),
        ]);
    }

    public function store(StoreInvoiceRequest $request): RedirectResponse
    {
        $this->authorize('create', Invoice::class);

        $invoice = $this->invoiceService->create($request->validated());

        return redirect()
            ->route('invoices.show', $invoice)
            ->with('success', 'Invoice created successfully.');
    }

    public function show(Invoice $invoice): Response
    {
        $this->authorize('view', $invoice);

        $invoice->load([
            'tenant:id,name',
            'items.module:id,name,code',
            'payments',
        ]);

        return Inertia::render('landlord/invoices/show', [
            'invoice' => new InvoiceResource($invoice),
        ]);
    }

    public function edit(Invoice $invoice): Response
    {
        $this->authorize('update', $invoice);

        $invoice->load([
            'tenant:id,name',
            'items.module:id,name,code',
        ]);

        return Inertia::render('landlord/invoices/edit', [
            'invoice' => new InvoiceResource($invoice),
            'tenants' => $this->tenantOptions(),
            'modules' => $this->moduleOptions(),
        ]);
    }

    public function update(UpdateInvoiceRequest $request, Invoice $invoice): RedirectResponse
    {
        $this->authorize('update', $invoice);

        $this->invoiceService->update($invoice, $request->validated());

        return redirect()
            ->route('invoices.show', $invoice)
            ->with('success', 'Invoice updated successfully.');
    }

    public function destroy(Invoice $invoice): RedirectResponse
    {
        $this->authorize('delete', $invoice);

        // Drafts have no ledger impact — hard delete. Issued/paid invoices
        // soft-delete so payment history and audit trails survive.
        if ($invoice->status === 'draft') {
            $invoice->forceDelete();
        } else {
            $invoice->delete();
        }

        return redirect()
            ->route('invoices.index')
            ->with('success', 'Invoice deleted successfully.');
    }

    /* --------------------------------------------------------------------- */
    /* Helpers                                                                */
    /* --------------------------------------------------------------------- */

    /**
     * Minimal tenant list for the invoice-form "Bill To" selector.
     *
     * @return \Illuminate\Support\Collection<int, array{id: string, name: string, email: string|null, phone: string|null, address: string|null}>
     */
    private function tenantOptions()
    {
        return Tenant::query()
            ->select(['id', 'name', 'email', 'phone', 'address'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();
    }

    /**
     * Active modules for the per-line module selector.
     *
     * @return \Illuminate\Support\Collection<int, array{id: int, name: string, code: string, base_price: float}>
     */
    private function moduleOptions()
    {
        return Module::query()
            ->select(['id', 'name', 'code', 'base_price'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();
    }
}