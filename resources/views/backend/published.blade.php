@if($row->is_published)
    <span class="badge bg-success">Published</span>
@else
    <span class="badge bg-warning">Pending</span>
@endif