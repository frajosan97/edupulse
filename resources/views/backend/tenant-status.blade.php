<div class="d-flex align-items-center">
    @if ($row->status == 'active')
        <span class="badge bg-success">Active</span>
    @elseif ($row->status == 'suspended')
        <span class="badge bg-warning">Suspended</span>
    @elseif ($row->status == 'deactivated')
        <span class="badge bg-danger">Deactivated</span>
    @endif
</div>