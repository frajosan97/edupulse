<?php

namespace App\Http\Controllers\LandLord\Setting;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Yajra\DataTables\Facades\DataTables;

class DatabaseController extends Controller
{
    public function index(Request $request)
    {
        if ($request->has('draw')) {
            $tenants = Tenant::all();
            $data = [];

            foreach ($tenants as $tenant) {
                try {
                    $connection = $this->createTenantConnection($tenant->database);

                    // Database info
                    $databaseInfo = $connection->selectOne("
                        SELECT 
                            SCHEMA_NAME AS database_name,
                            DEFAULT_CHARACTER_SET_NAME AS character_set,
                            DEFAULT_COLLATION_NAME AS collation
                        FROM information_schema.SCHEMATA 
                        WHERE SCHEMA_NAME = ?
                    ", [$tenant->database]);

                    // Table count
                    $tableCount = $connection->selectOne("
                        SELECT COUNT(*) AS table_count
                        FROM information_schema.TABLES 
                        WHERE TABLE_SCHEMA = ?
                    ", [$tenant->database])->table_count ?? 0;

                    // Storage usage
                    $storageUsage = $connection->selectOne("
                        SELECT ROUND(SUM(DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) AS storage_mb
                        FROM information_schema.TABLES 
                        WHERE TABLE_SCHEMA = ?
                    ", [$tenant->database])->storage_mb ?? 0;

                    $data[] = [
                        'id' => $tenant->id,
                        'database' => $databaseInfo->database_name ?? $tenant->database,
                        'collation' => $databaseInfo->collation ?? 'N/A',
                        'tables' => $tableCount,
                        'storage_usage' => $storageUsage ? "{$storageUsage} MB" : '0 MB',
                        'action' => '',
                    ];
                } catch (\Exception $e) {
                    $data[] = [
                        'id' => $tenant->id,
                        'database' => $tenant->database,
                        'collation' => 'Connection Error',
                        'tables' => 'N/A',
                        'storage_usage' => 'N/A',
                        'action' => '',
                    ];
                }
            }

            return DataTables::of($data)
                ->addIndexColumn()
                ->addColumn(
                    'action',
                    fn($row) =>
                    view('backend.database-actions', compact('row'))->render()
                )
                ->rawColumns(['action'])
                ->make(true);
        }

        return inertia('LandLord/Backend/Setting/Database');
    }

    public function show(Tenant $database)
    {
        try {
            $connection = $this->createTenantConnection($database->database);

            // Database info
            $dbInfo = $connection->selectOne("
                SELECT 
                    SCHEMA_NAME AS database_name,
                    DEFAULT_CHARACTER_SET_NAME AS character_set,
                    DEFAULT_COLLATION_NAME AS collation,
                    SQL_PATH AS sql_path
                FROM information_schema.SCHEMATA 
                WHERE SCHEMA_NAME = ?
            ", [$database->database]);

            // Tables
            $tables = $connection->select("
                SELECT 
                    TABLE_NAME AS table_name,
                    TABLE_ROWS AS row_count,
                    DATA_LENGTH AS data_size,
                    INDEX_LENGTH AS index_size,
                    DATA_FREE AS free_size,
                    ENGINE AS engine,
                    TABLE_COLLATION AS collation,
                    CREATE_TIME AS created_at,
                    UPDATE_TIME AS updated_at,
                    ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) AS total_size_mb,
                    ROUND(DATA_LENGTH / 1024 / 1024, 2) AS data_size_mb,
                    ROUND(INDEX_LENGTH / 1024 / 1024, 2) AS index_size_mb
                FROM information_schema.TABLES 
                WHERE TABLE_SCHEMA = ?
                ORDER BY TABLE_NAME
            ", [$database->database]);

            // Add exact row counts if possible
            foreach ($tables as $table) {
                try {
                    $table->exact_row_count = $connection->table($table->table_name)->count();
                } catch (\Exception $e) {
                    $table->exact_row_count = $table->row_count; // fallback
                }
            }

            // Size summary
            $totalSize = $connection->selectOne("
                SELECT 
                    ROUND(SUM(DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) AS total_size_mb,
                    ROUND(SUM(DATA_LENGTH) / 1024 / 1024, 2) AS data_size_mb,
                    ROUND(SUM(INDEX_LENGTH) / 1024 / 1024, 2) AS index_size_mb,
                    COUNT(TABLE_NAME) AS table_count
                FROM information_schema.TABLES 
                WHERE TABLE_SCHEMA = ?
            ", [$database->database]);

        } catch (\Exception $e) {
            return inertia('LandLord/Backend/Setting/DatabaseShow', [
                'database' => $database,
                'dbInfo' => null,
                'tables' => [],
                'totalSize' => null,
                'error' => 'Failed to connect: ' . $e->getMessage(),
            ]);
        }

        return inertia('LandLord/Backend/Setting/DatabaseShow', [
            'database' => $database,
            'dbInfo' => $dbInfo,
            'tables' => $tables,
            'totalSize' => $totalSize,
            'error' => null,
        ]);
    }

    public function tableDetails(Tenant $database, string $tableName)
    {
        try {
            $connection = $this->createTenantConnection($database->database);

            $structure = $connection->select("
                SELECT 
                    COLUMN_NAME AS column_name,
                    COLUMN_TYPE AS data_type,
                    IS_NULLABLE AS is_nullable,
                    COLUMN_KEY AS column_key,
                    COLUMN_DEFAULT AS default_value,
                    EXTRA AS extra,
                    COLUMN_COMMENT AS comment
                FROM information_schema.COLUMNS 
                WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
                ORDER BY ORDINAL_POSITION
            ", [$database->database, $tableName]);

            $sampleData = $connection->table($tableName)
                ->limit(10)
                ->get()
                ->toArray();

            $indexes = $connection->select("
                SELECT 
                    INDEX_NAME AS index_name,
                    COLUMN_NAME AS column_name,
                    NON_UNIQUE AS non_unique,
                    INDEX_TYPE AS index_type
                FROM information_schema.STATISTICS 
                WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
                ORDER BY INDEX_NAME, SEQ_IN_INDEX
            ", [$database->database, $tableName]);

            return response()->json([
                'structure' => $structure,
                'sampleData' => $sampleData,
                'indexes' => $indexes,
                'tableName' => $tableName,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to get table details: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $tenants = Tenant::all();
        $results = [];

        foreach ($tenants as $tenant) {
            try {
                // Configure tenant connection
                $connection = $this->createTenantConnection($tenant->database);

                // Run migrations for this tenant only
                Artisan::call('migrate', [
                    '--database' => 'tenant',
                    '--path' => 'database/migrations/tenant',
                    '--force' => true,
                    '--no-interaction' => true,
                ]);

                $results[] = [
                    'tenant' => $tenant->id,
                    'database' => $tenant->database,
                    'status' => 'success',
                    'output' => Artisan::output(),
                ];
            } catch (\Exception $e) {
                $results[] = [
                    'tenant' => $tenant->id,
                    'database' => $tenant->database,
                    'status' => 'error',
                    'error' => $e->getMessage(),
                ];
            }
        }

        return response()->json([
            'message' => 'Migrations executed for all tenants.',
            'results' => $results,
        ]);
    }

    public function update(Request $request, Tenant $database)
    {
        try {
            // Configure tenant connection
            $connection = $this->createTenantConnection($database->database);

            // Run migrations for this specific tenant
            Artisan::call('migrate', [
                '--database' => 'tenant',
                '--path' => 'database/migrations/tenant',
                '--force' => true,
                '--no-interaction' => true,
            ]);

            return response()->json([
                'success' => true,
                'message' => "Migrations executed for tenant {$database->id}.",
                'output' => Artisan::output(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => "Migration failed for tenant {$database->id}.",
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    private function createTenantConnection(string $databaseName)
    {
        config(['database.connections.tenant.database' => $databaseName]);
        return DB::connection('tenant');
    }
}
