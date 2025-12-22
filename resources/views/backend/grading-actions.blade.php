<div class="btn-group btn-group-sm text-nowrap gap-2" role="group">
    <a class="btn btn-outline-primary" href="{{ route('admin.grading-system.show', $row->id) }}">
        <i class="bi bi-briefcase me-1"></i> Manage
    </a>
    <button class="btn btn-outline-primary edit-btn" data-data="{{ $row }}">
        <i class="bi bi-pen me-1"></i> Edit
    </button>
    <button class="btn btn-outline-danger delete-btn" data-id="{{ $row->id }}">
        <i class="bi bi-trash me-1"></i> Delete
    </button>
</div>