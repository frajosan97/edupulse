@if ($row->student->parents->count() > 0)
    @foreach ($row->student->parents as $parent)
        <span>{{ $parent->phone}}</span>,
    @endforeach
@endif