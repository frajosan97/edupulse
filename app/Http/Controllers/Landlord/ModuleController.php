<?php

declare(strict_types=1);

namespace App\Http\Controllers\Landlord;

use App\Concerns\SerializesPaginator;
use App\Http\Controllers\Controller;
use App\Http\Requests\IndexModuleRequest;
use App\Http\Requests\StoreModuleRequest;
use App\Http\Requests\UpdateModuleRequest;
use App\Http\Resources\ModuleResource;
use App\Models\Module;
use App\Services\Landlord\ModulePricingService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ModuleController extends Controller
{
    use SerializesPaginator;

    public function __construct(
        private readonly ModulePricingService $pricingService
    ) {
    }

    public function index(IndexModuleRequest $request): Response
    {
        $filters = $request->filters();

        $paginator = Module::query()
            ->filtered($filters)
            ->paginate($filters['per_page'])
            ->withQueryString();

        return Inertia::render('landlord/modules/index', [
            'modules' => $this->paginateToArray($paginator, ModuleResource::class),
            'filters' => $filters,
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Module::class);

        return Inertia::render('landlord/modules/create');
    }

    public function store(StoreModuleRequest $request): RedirectResponse
    {
        $this->authorize('create', Module::class);

        Module::create($request->validated());

        return redirect()
            ->route('modules.index')
            ->with('success', 'Module created successfully.');
    }

    public function show(Module $module): Response
    {
        $this->authorize('view', $module);

        return Inertia::render('landlord/modules/show', [
            'module' => new ModuleResource($module),
        ]);
    }

    public function edit(Module $module): Response
    {
        $this->authorize('update', $module);

        return Inertia::render('landlord/modules/edit', [
            'module' => new ModuleResource($module),
        ]);
    }

    public function update(UpdateModuleRequest $request, Module $module): RedirectResponse
    {
        $this->authorize('update', $module);

        $module->update($request->validated());

        return redirect()
            ->route('modules.index')
            ->with('success', 'Module updated successfully.');
    }

    public function destroy(Module $module): RedirectResponse
    {
        $this->authorize('delete', $module);

        $module->delete();

        return redirect()
            ->route('modules.index')
            ->with('success', 'Module deleted successfully.');
    }
}