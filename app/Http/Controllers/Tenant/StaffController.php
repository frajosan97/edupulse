<?php

namespace App\Http\Controllers\Tenant;

use App\Concerns\SerializesPaginator;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\IndexStaffRequest;
use App\Http\Requests\Tenant\StoreStaffRequest;
use App\Http\Requests\Tenant\UpdateStaffRequest;
use App\Http\Resources\Tenant\StaffResource;
use App\Models\User;
use App\Services\Tenant\StaffService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class StaffController extends Controller
{
    use SerializesPaginator;

    public function __construct(private readonly StaffService $staffService)
    {
    }

    public function index(IndexStaffRequest $request): Response
    {
        $filters = $request->filters();
        $search = trim($filters['search'] ?? '');

        $paginator = User::query()
            ->whereHas('roles', fn($q) => $q->whereIn('name', User::STAFF_ROLES))
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('other_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->when(
                $filters['role'] ?? null,
                fn($q, $role) => $q->whereHas('roles', fn($r) => $r->where('name', $role))
            )
            ->when(
                $filters['status'] ?? null,
                fn($q, $status) => $q->where('status', $status)
            )
            ->with('roles:id,name')
            ->orderBy('first_name')
            ->paginate($filters['per_page'])
            ->withQueryString();

        return Inertia::render('tenant/staff/index', [
            'staff' => $this->paginateToArray($paginator, StaffResource::class),
            'filters' => $filters,
            'roles' => $this->staffService->assignableRoles(),
            'statuses' => $this->statuses(),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', User::class);

        return Inertia::render('tenant/staff/create', [
            'roles' => $this->staffService->assignableRoles(),
            'genders' => User::GENDERS,
            'statuses' => $this->statuses(),
        ]);
    }

    public function store(StoreStaffRequest $request): RedirectResponse
    {
        try {
            $user = $this->staffService->create(
                $request->validated(),
                $request->file('avatar'),
                $request->file('signature'),
            );
        } catch (ValidationException $e) {
            throw $e;
        } catch (Throwable $e) {
            Log::error('Staff creation failed', [
                'payload' => $request->validated(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()
                ->withInput()
                ->with('error', 'Failed to create staff member: ' . $e->getMessage());
        }

        return redirect()
            ->route('staff.index')
            ->with('success', "Staff member \"{$user->name}\" created successfully. An invite has been prepared for them to set their password.");
    }

    public function show(User $staff): Response
    {
        $this->authorize('view', $staff);

        return Inertia::render('tenant/staff/show', $this->staffService->show($staff));
    }

    public function edit(User $staff): Response
    {
        $this->authorize('update', $staff);

        $staff->load('roles:id,name');

        return Inertia::render('tenant/staff/edit', [
            'staff' => new StaffResource($staff),
            'roles' => $this->staffService->assignableRoles(),
            'genders' => User::GENDERS,
            'statuses' => $this->statuses(),
        ]);
    }

    public function update(UpdateStaffRequest $request, User $staff): RedirectResponse
    {
        try {
            $this->staffService->update(
                $staff,
                $request->validated(),
                $request->file('avatar'),
                $request->file('signature'),
            );
        } catch (ValidationException $e) {
            throw $e;
        } catch (Throwable $e) {
            Log::error('Staff update failed', [
                'staff_id' => $staff->id,
                'payload' => $request->validated(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()
                ->withInput()
                ->with('error', 'Failed to update staff member: ' . $e->getMessage());
        }

        return redirect()
            ->route('staff.index')
            ->with('success', 'Staff member updated successfully.');
    }

    public function destroy(User $staff): RedirectResponse
    {
        $this->authorize('delete', $staff);

        try {
            $this->staffService->delete($staff);
        } catch (Throwable $e) {
            Log::error('Staff deletion failed', [
                'staff_id' => $staff->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->with('error', 'Failed to delete staff member.');
        }

        return redirect()
            ->route('staff.index')
            ->with('success', 'Staff member deleted successfully.');
    }

    /**
     * @return list<string>
     */
    private function statuses(): array
    {
        return [
            User::STATUS_ACTIVE,
            User::STATUS_PENDING,
            User::STATUS_INACTIVE,
            User::STATUS_SUSPENDED,
        ];
    }
}