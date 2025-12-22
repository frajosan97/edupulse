<div class="btn-group btn-group-sm text-nowrap gap-2" role="group">
    <button class="btn btn-outline-primary edit-btn" data-data="{{ $row }}">
        <i class="bi bi-pen me-1"></i> Edit
    </button>
    <button class="btn btn-outline-danger delete-btn" data-id="{{ $row->id }}">
        <i class="bi bi-trash me-1"></i> Delete
    </button>
</div>