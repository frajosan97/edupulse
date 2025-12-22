<?php

namespace App\Exports;

use App\Models\Tenant\Exam;
use App\Models\Tenant\Classes;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

/**
 * Main Export – contains 3 sheets
 */
class AnalysisExport implements WithMultipleSheets
{
    protected $exam;
    protected $class;
    protected $schoolInfo;
    protected $analysisData;

    public function __construct(Exam $exam, Classes $class, $schoolInfo, $analysisData)
    {
        $this->exam = $exam;
        $this->class = $class;
        $this->schoolInfo = $schoolInfo;
        $this->analysisData = $analysisData;
    }

    public function sheets(): array
    {
        return [
            new MeritSheet($this->exam, $this->class, $this->schoolInfo, $this->analysisData),
            new GradeDistributionSheet($this->exam, $this->class, $this->schoolInfo, $this->analysisData),
            new SubjectsPerformanceSheet($this->exam, $this->class, $this->schoolInfo, $this->analysisData),
        ];
    }
}

/**
 * Sheet 1 - Merit List
 */
class MeritSheet implements FromArray, WithTitle, WithEvents, WithColumnWidths
{
    protected $exam;
    protected $class;
    protected $schoolInfo;
    protected $analysisData;

    public function __construct($exam, $class, $schoolInfo, $analysisData)
    {
        $this->exam = $exam;
        $this->class = $class;
        $this->schoolInfo = $schoolInfo;
        $this->analysisData = $analysisData;
    }

    public function array(): array
    {
        $data = [];

        // --- Header ---
        $data[] = [$this->schoolInfo->name ?? 'School Name'];
        $data[] = ['P.O BOX ' . ($this->schoolInfo->address ?? 'Address')];
        $data[] = ['Tel: ' . ($this->schoolInfo->phone ?? 'Phone') . ' | Email: ' . ($this->schoolInfo->email ?? 'Email')];
        $data[] = ['Form ' . $this->class->name . ' - ' . ($this->exam->term->name ?? 'Term') . ' - ' . $this->exam->name . ' Merit List'];
        $data[] = ['Status: Published | Date: ' . now()->format('d/m/Y H:i')];
        $data[] = [];

        // --- Statistics ---
        $overview = $this->analysisData['overviewStats'] ?? [];
        $data[] = ['STATISTICS OVERVIEW'];
        $data[] = [
            ($overview['students'] ?? 0) . ' Students',
            ($overview['avgMarks'] ?? 0) . ' Mean Marks',
            ($overview['avgPoints'] ?? 0) . ' Mean Points',
            ($overview['avgGrade'] ?? '-') . ' Mean Grade',
        ];
        $data[] = [];

        // --- Merit List Table ---
        $data[] = ['MERIT LIST'];
        $headers = ['Adm', 'Name', 'Class'];
        $subjects = $this->analysisData['subjectPerformance'] ?? [];
        foreach ($subjects as $subjectData) {
            $headers[] = $subjectData['general']['subjectInfo']['short_name'] ?? 'Sub';
        }
        $headers = array_merge($headers, ['Marks', 'Mean', 'Pnts', 'Avg', 'Grade', 'Postn']);
        $data[] = $headers;

        // Student rows
        foreach ($this->analysisData['meritList'] ?? [] as $student) {
            $studentSubjects = collect($student['subjects'] ?? [])->keyBy('subject_id');
            $row = [
                $student['admission_number'] ?? '',
                $student['name'] ?? '',
                $student['class'] ?? '',
            ];

            foreach ($subjects as $subjectData) {
                $sid = $subjectData['general']['subjectInfo']['id'] ?? null;
                $row[] = $sid ? ($studentSubjects[$sid]['full_marks'] ?? '--') : '--';
            }

            $row = array_merge($row, [
                $student['total_marks'] ?? '',
                $student['avg_marks'] ?? '',
                $student['total_points'] ?? '',
                $student['avg_points'] ?? '',
                $student['avg_grade'] ?? '',
                $student['class_rank'] ?? '',
            ]);
            $data[] = $row;
        }

        return $data;
    }

    public function title(): string
    {
        return 'Merit List';
    }

    public function columnWidths(): array
    {
        $widths = ['A' => 10, 'B' => 30, 'C' => 15];
        $subjectsCount = count($this->analysisData['subjectPerformance'] ?? []);
        $startCol = 4;
        for ($i = 0; $i < $subjectsCount; $i++) {
            $widths[Coordinate::stringFromColumnIndex($startCol + $i)] = 10;
        }
        $summaryCols = ['Marks', 'Mean', 'Pnts', 'Avg', 'Grade', 'Postn'];
        $summaryStart = $startCol + $subjectsCount;
        foreach ($summaryCols as $i => $c) {
            $widths[Coordinate::stringFromColumnIndex($summaryStart + $i)] = 12;
        }
        return $widths;
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $highestCol = $sheet->getHighestColumn();
                $highestRow = $sheet->getHighestRow();

                // Merge headers
                for ($r = 1; $r <= 5; $r++) {
                    $sheet->mergeCells("A{$r}:{$highestCol}{$r}");
                }

                $sheet->getStyle('A1:A5')->applyFromArray([
                    'font' => ['bold' => true, 'size' => 11],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                ]);

                // Stats
                $sheet->getStyle('A7')->applyFromArray(['font' => ['bold' => true, 'size' => 12]]);
                $sheet->mergeCells("A7:{$highestCol}7");
                $sheet->getStyle("A8:D8")->applyFromArray([
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
                    'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'F8F9FA']],
                ]);

                // Merit header
                $meritHeaderRow = 10;
                $sheet->getStyle("A{$meritHeaderRow}")->applyFromArray(['font' => ['bold' => true, 'size' => 12]]);
                $sheet->mergeCells("A{$meritHeaderRow}:{$highestCol}{$meritHeaderRow}");
                $hdrRow = $meritHeaderRow + 1;
                $sheet->getStyle("A{$hdrRow}:{$highestCol}{$hdrRow}")->applyFromArray([
                    'font' => ['bold' => true],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'E9ECEF']],
                    'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                ]);
                $sheet->getStyle("A{$hdrRow}:{$highestCol}{$highestRow}")
                    ->applyFromArray(['borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]]]);
            },
        ];
    }
}

/**
 * Sheet 2 - Grade Distribution
 */
class GradeDistributionSheet implements FromArray, WithTitle, WithEvents, WithColumnWidths
{
    protected $exam;
    protected $class;
    protected $schoolInfo;
    protected $analysisData;
    protected $gradeScale = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E'];

    public function __construct($exam, $class, $schoolInfo, $analysisData)
    {
        $this->exam = $exam;
        $this->class = $class;
        $this->schoolInfo = $schoolInfo;
        $this->analysisData = $analysisData;
    }

    public function array(): array
    {
        $data = [];
        $data[] = ['OVERALL PERFORMANCE - GRADE DISTRIBUTION'];
        $data[] = array_merge(['Form / Stream'], $this->gradeScale, ['Count', 'Mean', 'Grade', 'Teacher']);

        $general = $this->analysisData['gradeDistribution']['general'] ?? [];
        $row = [$this->class->name];
        foreach ($this->gradeScale as $g) {
            $row[] = $general['grades'][$g]['count'] ?? 0;
        }
        $row[] = $general['count'] ?? 0;
        $row[] = $general['mean'] ?? 0;
        $row[] = $general['grade'] ?? '-';
        $row[] = $this->class->teacher ?? '-';
        $data[] = $row;

        foreach ($this->analysisData['gradeDistribution']['streams'] ?? [] as $sname => $sdata) {
            $r = [$this->class->name . ' ' . $sname];
            foreach ($this->gradeScale as $g) {
                $r[] = $sdata['grades'][$g]['count'] ?? 0;
            }
            $r[] = $sdata['count'] ?? 0;
            $r[] = $sdata['mean'] ?? 0;
            $r[] = $sdata['grade'] ?? '-';
            $r[] = $this->analysisData['streams'][$sname]['teacher'] ?? '-';
            $data[] = $r;
        }
        return $data;
    }

    public function title(): string
    {
        return 'Grade Distribution';
    }

    public function columnWidths(): array
    {
        $widths = ['A' => 30];
        $i = 2;
        foreach ($this->gradeScale as $g) {
            $widths[Coordinate::stringFromColumnIndex($i++)] = 8;
        }
        $widths[Coordinate::stringFromColumnIndex($i++)] = 10; // Count
        $widths[Coordinate::stringFromColumnIndex($i++)] = 10; // Mean
        $widths[Coordinate::stringFromColumnIndex($i++)] = 10; // Grade
        $widths[Coordinate::stringFromColumnIndex($i++)] = 20; // Teacher
        return $widths;
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $s = $event->sheet->getDelegate();
                $hcol = $s->getHighestColumn();
                $hrow = $s->getHighestRow();
                $s->getStyle('A1')->applyFromArray(['font' => ['bold' => true, 'size' => 12]]);
                $s->mergeCells("A1:{$hcol}1");
                $s->getStyle("A2:{$hcol}2")->applyFromArray([
                    'font' => ['bold' => true],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'E9ECEF']],
                    'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
                ]);
                $s->getStyle("A2:{$hcol}{$hrow}")->applyFromArray([
                    'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
                ]);
            }
        ];
    }
}

/**
 * Sheet 3 - Subjects Performance
 */
class SubjectsPerformanceSheet implements FromArray, WithTitle, WithEvents, WithColumnWidths
{
    protected $exam;
    protected $class;
    protected $schoolInfo;
    protected $analysisData;
    protected $gradeScale = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E'];

    public function __construct($exam, $class, $schoolInfo, $analysisData)
    {
        $this->exam = $exam;
        $this->class = $class;
        $this->schoolInfo = $schoolInfo;
        $this->analysisData = $analysisData;
    }

    public function array(): array
    {
        $data = [['SUBJECTS PERFORMANCE - GRADE DISTRIBUTION'], []];
        foreach ($this->analysisData['subjectPerformance'] ?? [] as $sname => $sdata) {
            $data[] = [$sname];
            $data[] = array_merge(['Form / Stream'], $this->gradeScale, ['Count', 'Mean', 'Grade', 'Teacher']);
            $gen = $sdata['general'] ?? [];
            $row = [$this->class->name];
            foreach ($this->gradeScale as $g) {
                $row[] = $gen['grades'][$g]['count'] ?? (collect($gen['grades'] ?? [])->firstWhere('grade', $g)['count'] ?? 0);
            }
            $row[] = $gen['count'] ?? 0;
            $row[] = $gen['avg'] ?? 0;
            $row[] = $gen['grade'] ?? '-';
            $row[] = $gen['teacher'] ?? '-';
            $data[] = $row;
            foreach ($sdata['streams'] ?? [] as $sn => $sd) {
                $r = [$this->class->name . ' ' . $sn];
                foreach ($this->gradeScale as $g) {
                    $r[] = $sd['grades'][$g]['count'] ?? (collect($sd['grades'] ?? [])->firstWhere('grade', $g)['count'] ?? 0);
                }
                $r[] = $sd['count'] ?? 0;
                $r[] = $sd['avg'] ?? 0;
                $r[] = $sd['grade'] ?? '-';
                $r[] = $sd['teacher'] ?? '-';
                $data[] = $r;
            }
            $data[] = [];
        }
        return $data;
    }

    public function title(): string
    {
        return 'Subjects Performance';
    }

    public function columnWidths(): array
    {
        $widths = ['A' => 30];
        $i = 2;
        foreach ($this->gradeScale as $g) {
            $widths[Coordinate::stringFromColumnIndex($i++)] = 8;
        }
        $widths[Coordinate::stringFromColumnIndex($i++)] = 10;
        $widths[Coordinate::stringFromColumnIndex($i++)] = 10;
        $widths[Coordinate::stringFromColumnIndex($i++)] = 10;
        $widths[Coordinate::stringFromColumnIndex($i++)] = 20;
        return $widths;
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $s = $event->sheet->getDelegate();
                $hcol = $s->getHighestColumn();
                $hrow = $s->getHighestRow();
                $s->getStyle('A1')->applyFromArray(['font' => ['bold' => true, 'size' => 12]]);
                $s->mergeCells("A1:{$hcol}1");
                foreach (range(1, $hrow) as $r) {
                    if ($s->getCell("A{$r}")->getValue() === 'Form / Stream') {
                        $s->getStyle("A{$r}:{$hcol}{$r}")->applyFromArray([
                            'font' => ['bold' => true],
                            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'E9ECEF']],
                            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
                            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                        ]);
                    }
                }
                $s->getStyle("A1:{$hcol}{$hrow}")->applyFromArray([
                    'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
                ]);
            }
        ];
    }
}
