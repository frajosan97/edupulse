<!-- domains listing -->
@foreach ($row->domains as $domain)
    <span class="badge bg-info">{{ $domain->domain }}</span>
@endforeach