<div class="btn-group btn-group-sm gap-2" role="group">
    <button type="button" class="btn btn-outline-info btn-view" data-id="{{ $row->id }}" title="Preview">
        <i class="bi bi-eye"></i>
    </button>
    <button type="button" class="btn btn-outline-primary btn-edit" data-id="{{ $row->id }}" title="Edit">
        <i class="bi bi-pencil"></i>
    </button>
    <button type="button" class="btn btn-outline-danger btn-delete" data-id="{{ $row->id }}" title="Delete">
        <i class="bi bi-trash"></i>
    </button>
</div>