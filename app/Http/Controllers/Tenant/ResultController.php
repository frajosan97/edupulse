<?php

namespace App\Http\Controllers\Tenant;

use App\Exports\AnalysisExport;
use App\Http\Controllers\Controller;
use App\Models\Tenant\Classes;
use App\Models\Tenant\Exam;
use App\Models\Tenant\GradingSystem;
use App\Models\Tenant\Result;
use App\Models\Tenant\SchoolContact;
use App\Models\Tenant\SchoolImage;
use App\Models\Tenant\Student;
use App\Models\Tenant\Subject;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Mpdf\Mpdf;

class ResultController extends Controller
{
    /* =======================
     *  PUBLIC METHODS (CRUD)
     * ======================= */

    /**
     * Redirect to the latest exam show page.
     */
    public function index()
    {
        $exam = Exam::latest()->first();

        return $exam
            ? redirect()->route('admin.exam.show', $exam)
            : back()->with('error', 'No exam found.');
    }

    /**
     * Show the form for creating results.
     */
    public function create(): Response
    {
        return Inertia::render('Tenant/Backend/Result/Create', [
            'classes' => Classes::with('classStreams.stream')->get(),
            'subjects' => Subject::all(),
        ]);
    }

    /**
     * Fetch students & any existing results for entry.
     */
    public function request(Request $request): JsonResponse
    {
        try {
            $data = $request->validate([
                'examType' => 'required|string',
                'classId' => 'required|integer',
                'streamId' => 'nullable|integer',
                'subjectId' => 'required|integer',
            ]);

            $exam = Exam::with(['classes', 'streams'])
                ->where('is_published', false)
                ->latest()
                ->first();

            if (!$exam) {
                return $this->jsonError('No unpublished exam found.', 404);
            }

            if ($exam->classes->isNotEmpty() && !$exam->classes->contains('id', $data['classId'])) {
                return $this->jsonError('Invalid class for this exam.', 422);
            }

            if (!empty($data['streamId']) && $exam->streams->isNotEmpty() && !$exam->streams->contains('id', $data['streamId'])) {
                return $this->jsonError('Invalid stream for this exam.', 422);
            }

            $students = $this->fetchStudentsWithResults(
                $exam->id,
                $data['classId'],
                $data['subjectId'],
                $data['streamId'] ?? null
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'exam' => $exam,
                    'students' => $students,
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Result request error: ' . $e->getMessage());
            return $this->jsonError('Server error: ' . $e->getMessage());
        }
    }

    /**
     * Store or update student results.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $data = $request->validate([
                'examId' => 'required|integer|exists:exams,id',
                'classId' => 'required|integer|exists:classes,id',
                'streamId' => 'nullable|integer|exists:streams,id',
                'subjectId' => 'required|integer|exists:subjects,id',
                'scores' => 'required|array',
                'outOf' => 'required|array',
            ]);

            DB::transaction(function () use ($data) {
                foreach ($data['scores'] as $studentId => $scoreData) {
                    /** @var \App\Models\Tenant\Student|null $student */
                    $student = Student::find($studentId);
                    if (!$student) {
                        continue;
                    }

                    $score = $scoreData['score'] ?? null;

                    Result::updateOrCreate(
                        [
                            'exam_id' => $data['examId'],
                            'class_id' => $data['classId'],
                            'student_id' => $studentId,
                            'subject_id' => $data['subjectId'],
                        ],
                        [
                            'class_stream_id' => $data['streamId'] ?? $student->class_stream_id,
                            'pp_1' => $scoreData['P1'] ?? null,
                            'pp_1_outof' => $data['outOf']['P1'] ?? null,
                            'pp_2' => $scoreData['P2'] ?? null,
                            'pp_2_outof' => $data['outOf']['P2'] ?? null,
                            'pp_3' => $scoreData['P3'] ?? null,
                            'pp_3_outof' => $data['outOf']['P3'] ?? null,
                            'score' => is_numeric($score) ? round($score) : null,
                            'score_outof' => $data['outOf']['score'] ?? 100,
                            'created_by' => Auth::id(),
                            'updated_by' => Auth::id(),
                        ]
                    );
                }
            });

            return response()->json(['success' => true, 'message' => 'Results saved successfully!']);
        } catch (\Throwable $e) {
            Log::error('Result store error: ' . $e->getMessage());
            return $this->jsonError('Server error: ' . $e->getMessage());
        }
    }

    /* =======================
     *  ANALYSIS METHODS
     * ======================= */

    /**
     * Analyze results for a given exam & class.
     */
    public function analyze(Exam $exam, Classes $class): Response
    {
        $analysisData = $this->prepareAnalysisData($exam, $class);

        return Inertia::render('Tenant/Backend/Result/Index', [
            'examInfo' => $analysisData
        ]);
    }

    /**
     * Generate analysis PDF.
     */
    public function analysisPdf(Exam $exam, Classes $class)
    {
        $analysisData = $this->prepareAnalysisData($exam, $class);
        $schoolInfo = $this->getSchoolInfo();

        $html = view('exports.analysis-pdf', [
            'schoolInfo' => $schoolInfo,
            'examInfo' => $analysisData,
        ])->render();

        $mpdf = new Mpdf([
            'format' => 'A4',
            'orientation' => 'L',
            'margin' => 10,
            'default_font_size' => 10,
            'default_font' => 'dejavusans',
        ]);

        $mpdf->SetHTMLFooter('
            <div style="width: 100%; text-align: center; font-size: 12px; font-family: DejaVu Serif, serif; color: #555; letter-spacing: 0.3px;">
                <em>* This results slip is issued without any erasure or alteration whatsoever *</em>
            </div>
        ');

        $mpdf->SetTitle($exam->name . ' Analysis');
        $mpdf->WriteHTML($html);

        return response($mpdf->Output('', 'S'))
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', "inline; filename=\"{$exam->name}_analysis.pdf\"")
            ->header('Cache-Control', 'no-store, no-cache, must-revalidate')
            ->header('Pragma', 'no-cache');
    }

    /**
     * Generate analysis Excel.
     */
    public function analysisExcel(Exam $exam, Classes $class)
    {
        $analysisData = $this->prepareAnalysisData($exam, $class);
        $schoolInfo = $this->getSchoolInfo();

        return Excel::download(
            new AnalysisExport(
                $exam,
                $class,
                $schoolInfo,
                $analysisData->analysis
            ),
            $exam->name . '_analysis.xlsx'
        );
    }

    /**
     * Generate report forms PDF with graphs.
     */
    public function reportFormsPdf(Exam $exam, Classes $class)
    {
        $analysisData = $this->prepareAnalysisData($exam, $class);
        $analysis = $analysisData['analysis'];

        // Loop per student to generate graphs
        $analysis['meritList'] = $analysis['meritList']->map(function ($student) use ($analysisData, $exam, $class) {
            $studentId = $student['student_id'];

            $student['subjectPerformanceGraph'] = $this->generateSubjectPerformanceGraphForStudentData(
                $analysisData['analysis'],
                $studentId
            );
            $student['performanceTrendGraph'] = $this->generatePerformanceTrendGraphForStudent(
                $analysisData['analysis'],
                $exam,
                $class,
                $studentId
            );

            return $student;
        });

        $analysisData['analysis'] = $analysis;
        $schoolInfo = $this->getSchoolInfo();

        $html = view('exports.report-forms-pdf', [
            'schoolInfo' => $schoolInfo,
            'examInfo' => $analysisData,
        ])->render();

        $mpdf = new Mpdf([
            'format' => 'A4',
            'orientation' => 'P',
            'margin_top' => 5,
            'margin_bottom' => 5,
            'margin_left' => 5,
            'margin_right' => 5,
            'default_font_size' => 10,
            'default_font' => 'dejavusans',
        ]);

        $mpdf->SetHTMLFooter('
            <div style="width: 100%; text-align: center; font-size: 12px; font-family: DejaVu Serif, serif; color: #555; letter-spacing: 0.3px;">
                <em>* This results slip is issued without any erasure or alteration whatsoever *</em>
            </div>
        ');

        $mpdf->SetTitle($exam->name . ' Report Forms');
        $mpdf->WriteHTML($html);

        return response($mpdf->Output('', 'S'))
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', "inline; filename=\"{$exam->name}_report_forms.pdf\"")
            ->header('Cache-Control', 'no-store, no-cache, must-revalidate')
            ->header('Pragma', 'no-cache');
    }

    /* =======================
     *  CORE DATA PROCESSING
     * ======================= */

    /**
     * Prepare analysis data for reuse across multiple methods.
     */
    private function prepareAnalysisData(Exam $exam, Classes $class)
    {
        $exam->load([
            'results' => fn($q) => $q->where('class_id', $class->id)->with([
                'student.user',
                'student.class',
                'student.classStream.stream',
                'subject'
            ]),
        ]);

        $allSubjects = Subject::where('is_active', true)
            ->with('gradingSystem.gradeScales')
            ->orderBy('code')
            ->get();

        $classStreams = $class->classStreams()->with('stream')->get();

        $groupedResults = $this->buildStudentResults($exam->results);

        // Class & Stream ranking
        $groupedResults = $this->applyClassRanks($groupedResults);
        $groupedResults = $this->applyStreamRanks($groupedResults);

        $exam->setRelation('results', $groupedResults);
        $exam->setRelation('classInfo', $class);

        $analysisStats = $this->buildAnalysis(
            $groupedResults,
            $allSubjects,
            $classStreams
        );
        $exam->setAttribute('analysis', $analysisStats);

        return $exam;
    }

    /**
     * Transform raw Result models grouped by student into a normalized collection.
     */
    private function buildStudentResults($results)
    {
        return $results
            ->groupBy('student_id')
            ->map(function ($rows) {
                $first = $rows->first();
                $student = $first->student;

                $avgMarks = round($rows->avg('score'), 2);

                // Build subjects first
                $subjects = $rows->map(function ($r) {
                    $scale = $this->getGradeByScore(
                        $r->subject->id,
                        $r->score
                    );

                    $otherInfo = $this->getSubjectAdditionalInfo($r->id);

                    return [
                        'subject_id' => $r->subject->id,
                        'subject' => $r->subject->name,
                        'marks' => $r->score ?? '-',
                        'grade' => $scale->name ?? '-',
                        'points' => (int) ($scale->grade_point ?? 0),
                        'remarks' => $scale->remark ?? 'N/A',
                        'dev' => $otherInfo['deviation'],
                        'rank' => $otherInfo['rank'],
                        'teacher' => $otherInfo['teacher'],
                        'full_marks' => is_numeric($r->score)
                            ? round($r->score) . ' ' . ($scale->name ?? '')
                            : ($scale->name ?? ''),
                    ];
                })->values();

                // Calculate points from subjects
                $totalPoints = $subjects->sum('points');
                $avgPoints = $subjects->count() > 0
                    ? round($subjects->avg('points'), 2)
                    : 0;

                return [
                    'class_stream_id' => $first->class_stream_id,
                    'student_id' => $student->id,
                    'name' => $student->user->full_name,
                    'profile_image' => $student->user->profile_image,
                    'signature' => $student->user->signature,
                    'class' => trim(
                        ($student->class?->name ?? '') . ' ' .
                        ($student->classStream?->stream?->name ?? '')
                    ),
                    'admission_number' => $student->admission_number,
                    'subjects' => $subjects,
                    'total_marks' => $rows->sum('score'),
                    'avg_marks' => $avgMarks,
                    'total_points' => $totalPoints,
                    'avg_points' => $avgPoints,
                    'avg_grade' => $this->determineGrade($avgMarks),
                    'class_rank' => null,
                    'stream_rank' => null,
                    'class_teacher' => null,
                ];
            })
            ->values();
    }

    /**
     * Build the combined analysis array used in the frontend and PDFs.
     */
    private function buildAnalysis($groupedResults, $allSubjects, $classStreams): array
    {
        $analysisAvg = round($groupedResults->avg('avg_marks'), 2);
        $gradeScale = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E'];

        return [
            'overviewStats' => [
                'students' => $groupedResults->count(),
                'totalMarks' => $groupedResults->sum('total_marks'),
                'avgMarks' => $analysisAvg,
                'avgPoints' => round($groupedResults->avg('avg_points'), 2),
                'avgGrade' => $this->determineGrade($analysisAvg),
            ],
            'gradeDistribution' => $this->buildGradeDistribution($groupedResults, $classStreams, $gradeScale),
            'subjectPerformance' => $this->buildSubjectPerformanceCombined($groupedResults, $allSubjects, $classStreams, $gradeScale),
            'meritList' => $groupedResults,
        ];
    }

    /**
     * Build combined grade distribution (general + streams).
     */
    private function buildGradeDistribution($groupedResults, $classStreams, array $gradeScale): array
    {
        // Calculate overall mean & grade
        $overallMean = round($groupedResults->avg('avg_marks'), 2);
        $overallGrade = $this->determineGrade($overallMean);

        // Overall grade distribution
        $general = [
            'grades' => collect($gradeScale)->mapWithKeys(fn($g) => [
                $g => [
                    'count' => $groupedResults->where('avg_grade', $g)->count(),
                    'color' => $this->getGradeColor($g),
                ]
            ]),
            'count' => $groupedResults->count(),
            'mean' => $overallMean,
            'grade' => $overallGrade,
            'color' => $this->getGradeColor($overallGrade),
        ];

        // Per stream distribution
        $streams = $classStreams->mapWithKeys(function ($stream) use ($groupedResults, $gradeScale) {
            $streamResults = $groupedResults->where('class_stream_id', $stream->id);

            $mean = round($streamResults->avg('avg_marks'), 2);

            if ($mean <= 0) {
                return [];
            }

            $grade = $this->determineGrade($mean);

            return [
                ucwords($stream->stream->name) => [
                    'grades' => collect($gradeScale)->mapWithKeys(fn($g) => [
                        $g => [
                            'count' => $streamResults->where('avg_grade', $g)->count(),
                            'color' => $this->getGradeColor($g),
                        ]
                    ]),
                    'count' => $streamResults->count(),
                    'mean' => $mean,
                    'grade' => $grade,
                    'color' => $this->getGradeColor($grade),
                ]
            ];
        });

        return [
            'general' => $general,
            'streams' => $streams,
        ];
    }

    /**
     * Build combined subject performance (general + streams per subject).
     */
    private function buildSubjectPerformanceCombined($groupedResults, $allSubjects, $classStreams, array $gradeScale): array
    {
        $subjectsData = [];

        foreach ($allSubjects as $subject) {
            // General metrics for this subject
            $generalRecords = $groupedResults
                ->flatMap(fn($s) => $s['subjects'])
                ->where('subject', $subject->name);

            $general = $this->buildSubjectMetricsFromRecords($subject, $generalRecords, $gradeScale);

            // Stream metrics for this subject
            $streams = $classStreams->mapWithKeys(function ($stream) use ($groupedResults, $subject, $gradeScale) {
                $streamResults = $groupedResults->where('class_stream_id', $stream->id);

                $records = $streamResults
                    ->flatMap(fn($s) => $s['subjects'])
                    ->where('subject', $subject->name);

                $metrics = $this->buildSubjectMetricsFromRecords($subject, $records, $gradeScale);

                // Skip streams with mean 0
                if ($metrics['count'] <= 0) {
                    return [];
                }

                return [
                    ucwords($stream->stream->name) => $metrics,
                ];
            });

            // Attach to subject key
            $subjectsData[ucwords($subject->name)] = [
                'general' => $general,
                'streams' => $streams,
            ];
        }

        return $subjectsData;
    }

    /* =======================
     *  RANKING METHODS
     * ======================= */

    private function applyClassRanks($students)
    {
        return $students->sortByDesc('avg_marks')->values()->map(function ($item, $index) {
            $item['class_rank'] = $index + 1;
            return $item;
        });
    }

    private function applyStreamRanks($students)
    {
        return $students->groupBy('class_stream_id')
            ->flatMap(function ($streamStudents) {
                return $streamStudents->sortByDesc('avg_marks')->values()->map(function ($student, $i) {
                    $student['stream_rank'] = $i + 1;
                    return $student;
                });
            })->values();
    }

    /* =======================
     *  GRAPH GENERATION
     * ======================= */

    /**
     * Generate subject performance graph with real data.
     */
    private function generateSubjectPerformanceGraphForStudentData(array $analysisData, int $studentId): ?string
    {
        $student = null;
        foreach ($analysisData['meritList'] as $studentRecord) {
            if (($studentRecord['student_id'] ?? null) === $studentId) {
                $student = $studentRecord;
                break;
            }
        }

        $subjectPerformance = $analysisData['subjectPerformance'] ?? [];

        if (!$student) {
            return null;
        }

        $labels = [];
        $studentMarks = [];
        $classAverages = [];

        foreach ($student['subjects'] as $subject) {
            $subjectName = $subject['subject'] ?? null;
            if (!$subjectName) {
                continue;
            }

            $labels[] = $subjectName;
            $studentMarks[] = $subject['marks'] ?? 0;
            $classAverages[] = $subjectPerformance[$subjectName]['general']['avg'] ?? 0;
        }

        if (empty($labels)) {
            return null;
        }

        $chartConfig = [
            "type" => "line",
            "data" => [
                "labels" => $labels,
                "datasets" => [
                    [
                        "label" => "Student Marks",
                        "data" => $studentMarks,
                        "backgroundColor" => "rgba(54,162,235,0.35)",
                        "borderColor" => "rgba(54,162,235,1)",
                        "borderWidth" => 2,
                        "fill" => true,
                        "tension" => 0.3,
                    ],
                    [
                        "label" => "Class Average",
                        "data" => $classAverages,
                        "borderColor" => "rgba(255,99,132,1)",
                        "borderWidth" => 2,
                        "fill" => false,
                        "tension" => 0.3,
                    ],
                ],
            ],
            "options" => [
                "plugins" => [
                    "legend" => ["position" => "bottom"],
                    "title" => ["display" => true, "text" => "Subject Performance Analysis"],
                ],
                "scales" => [
                    "y" => ["beginAtZero" => true, "title" => ["display" => true, "text" => "Marks"]],
                    "x" => ["title" => ["display" => true, "text" => "Subjects"]],
                ],
            ],
        ];

        return $this->generateChartBase64($chartConfig);
    }

    /**
     * Generate performance trend graph for a specific student.
     */
    private function generatePerformanceTrendGraphForStudent(
        array $analysisData,
        Exam $currentExam,
        Classes $class,
        int $studentId
    ): string {
        // Fetch previous exams (last 4)
        $previousExams = Exam::where('id', '<', $currentExam->id)
            ->whereHas('results', fn($q) => $q->where('class_id', $class->id))
            ->orderBy('id', 'desc')
            ->take(4)
            ->get();

        $labels = [];
        $studentAverages = [];
        $classAverages = [];

        // Current exam
        $labels[] = substr($currentExam->name, 0, 10);

        // Find current student score
        $studentCurrentScore = collect($analysisData['meritList'])
            ->first(fn($s) => ($s['student_id'] ?? null) === $studentId)['avg_marks'] ?? 0;

        $studentAverages[] = $studentCurrentScore;

        // Class average for current exam
        $classCurrentAvg = $analysisData['overviewStats']['avgMarks'] ?? 0;
        $classAverages[] = $classCurrentAvg;

        // Previous exams
        foreach ($previousExams as $exam) {
            $labels[] = substr($exam->name, 0, 10);

            // Get all results for this exam and class
            $examResults = Result::where('exam_id', $exam->id)
                ->where('class_id', $class->id)
                ->get();

            // Student result
            $studentResult = $examResults->firstWhere('student_id', $studentId);
            $studentAverages[] = $studentResult->score ?? 0;

            // Class average
            $classAverages[] = $examResults->isNotEmpty()
                ? round($examResults->avg('score'), 2)
                : 0;
        }

        // Reverse for chronological order
        $labels = array_reverse($labels);
        $studentAverages = array_reverse($studentAverages);
        $classAverages = array_reverse($classAverages);

        // Chart configuration
        $chartConfig = [
            "type" => "bar",
            "data" => [
                "labels" => $labels,
                "datasets" => [
                    [
                        "type" => "bar",
                        "label" => "Student Performance",
                        "data" => $studentAverages,
                        "backgroundColor" => "rgba(54,162,235,0.7)",
                        "borderColor" => "rgba(54,162,235,1)",
                        "borderWidth" => 1,
                    ],
                    [
                        "type" => "line",
                        "label" => "Class Average",
                        "data" => $classAverages,
                        "borderColor" => "rgba(255,99,132,1)",
                        "borderWidth" => 2,
                        "fill" => false,
                        "tension" => 0.3,
                    ],
                ],
            ],
            "options" => [
                "plugins" => [
                    "legend" => ["position" => "bottom"],
                    "title" => ["display" => true, "text" => "Performance Trend Over Time"],
                ],
                "scales" => [
                    "y" => [
                        "beginAtZero" => true,
                        "title" => ["display" => true, "text" => "Average Marks"]
                    ],
                    "x" => [
                        "title" => ["display" => true, "text" => "Exams"]
                    ],
                ],
            ],
        ];

        return $this->generateChartBase64($chartConfig);
    }

    /* =======================
     *  HELPER METHODS
     * ======================= */

    private function fetchStudentsWithResults(int $examId, int $classId, int $subjectId, ?int $streamId)
    {
        return Student::query()
            ->with([
                'user',
                'results' => fn($q) => $q->where('exam_id', $examId)->where('subject_id', $subjectId),
            ])
            ->where('class_id', $classId)
            ->when($streamId, fn($q) => $q->where('class_stream_id', $streamId))
            ->whereHas('subjects', fn($q) => $q->where('subject_id', $subjectId))
            ->get()
            ->map(function ($student) {
                $result = $student->results->first();
                return [
                    'id' => $student->id,
                    'admission_number' => $student->admission_number,
                    'user' => [
                        'id' => $student->user->id,
                        'full_name' => $student->user->full_name,
                    ],
                    'result' => $result ? [
                        'score' => $result->score,
                        'score_outof' => $result->score_outof,
                        'P1' => $result->pp_1,
                        'P1_outof' => $result->pp_1_outof,
                        'P2' => $result->pp_2,
                        'P2_outof' => $result->pp_2_outof,
                        'P3' => $result->pp_3,
                        'P3_outof' => $result->pp_3_outof,
                    ] : null,
                ];
            });
    }

    private function getGradeByScore($subjectId = null, ?float $score = 0)
    {
        if ($score === null) {
            return [null, null];
        }

        // Get grading system by subject
        if ($subjectId) {
            $subject = Subject::with('gradingSystem.gradeScales')
                ->find($subjectId);
            $gradingSystem = $subject?->gradingSystem;
        } else {
            // default grading system - you might want to handle this
            $gradingSystem = null;
        }

        if (!$gradingSystem) {
            return null;
        }

        foreach ($gradingSystem->gradeScales as $scale) {
            if ($score >= $scale->min_score && $score <= $scale->max_score) {
                return $scale;
            }
        }

        return null;
    }

    private function getSubjectAdditionalInfo($resultId): array
    {
        // Current record (load subject + teachers)
        $record = Result::with('subject.teachers.teacher.user')
            ->findOrFail($resultId);

        // Subject rank
        $subjectResults = Result::where('exam_id', $record->exam_id)
            ->where('class_id', $record->class_id)
            ->where('subject_id', $record->subject_id)
            ->orderByDesc('score')
            ->get(['student_id', 'score']);

        $totalStudents = $subjectResults->count();

        if ($totalStudents > 0) {
            // Dense ranking (handles ties correctly)
            $rankedScores = $subjectResults
                ->pluck('score')
                ->unique()
                ->sortDesc()
                ->values();

            $position = $rankedScores->search($record->score) + 1;
            $rank = "{$position}/{$totalStudents}";
        } else {
            $rank = '-';
        }

        // Deviation (by date)
        $previous = Result::where('student_id', $record->student_id)
            ->where('subject_id', $record->subject_id)
            ->where('created_at', '<', $record->created_at)
            ->orderBy('created_at', 'desc')
            ->first();

        $deviation = $previous
            ? round((float) $record->score - (float) $previous->score, 2)
            : '-';

        // Subject teacher
        $teacher = 'Not Assigned';

        if (
            $record->subject &&
            $record->subject->teachers->isNotEmpty() &&
            $record->subject->teachers->first()->teacher &&
            $record->subject->teachers->first()->teacher->user
        ) {
            $teacher = $record->subject->teachers->first()->teacher->user->name;
        }

        return [
            'deviation' => $deviation,
            'teacher' => $teacher,
            'rank' => $rank,
        ];
    }

    /**
     * Build subject metrics (grades, count, avg, grade) from a collection of records.
     */
    private function buildSubjectMetricsFromRecords($subject, $records, array $gradeScale): array
    {
        $avg = $records->avg('marks') ?? 0;
        $counts = $records->groupBy('grade')->map->count();

        return [
            'subject' => ucwords($subject->name),
            'subjectInfo' => [
                'id' => $subject->id,
                'name' => ucwords($subject->name),
                'code' => $subject->code,
                'short_name' => $subject->short_name,
            ],
            'grades' => collect($gradeScale)->map(fn($g) => [
                'grade' => $g,
                'count' => $counts[$g] ?? 0,
                'color' => $this->getGradeColor($g),
            ])->values(),
            'count' => $records->count(),
            'avg' => round($avg, 2),
            'grade' => $this->determineGrade($avg),
            'teacher' => '',
        ];
    }

    private function determineGrade(float $marks): string
    {
        $marks = round($marks);

        $gradingSystem = GradingSystem::where('is_default', true)
            ->with('gradeScales')
            ->first();

        if (!$gradingSystem) {
            return '-';
        }

        $scale = $gradingSystem->gradeScales
            ->where('min_score', '<=', $marks)
            ->where('max_score', '>=', $marks)
            ->first();

        return $scale?->name ?? '-';
    }

    private function getSchoolInfo(): array
    {
        $contacts = SchoolContact::whereIn('contact_type', [
            'phone',
            'email',
            'address',
        ])->get()->keyBy('contact_type');

        $images = SchoolImage::whereIn('image_type', [
            'logo',
            'stamp',
            'signature',
        ])->get()->keyBy('image_type');

        $principal = User::role('principal')->first();

        return [
            'tenant' => tenant()->load('domains'),
            'phone' => $contacts->get('phone'),
            'email' => $contacts->get('email'),
            'address' => $contacts->get('address'),
            'logo' => $images->get('logo'),
            'stamp' => $images->get('stamp'),
            'signature' => $images->get('signature'),
            'principal' => $principal,
        ];
    }

    private function getGradeColor(string $grade): string
    {
        return match ($grade) {
            'A', 'A-' => '#198754', // green
            'B+', 'B', 'B-' => '#0dcaf0', // teal
            'C+', 'C', 'C-' => '#ffc107', // yellow
            'D+', 'D' => '#fd7e14', // orange
            'E' => '#dc3545', // red
            default => '#6c757d', // gray fallback
        };
    }

    /**
     * Generate base64 encoded chart from config.
     */
    private function generateChartBase64(array $chartConfig): string
    {
        try {
            $chartUrl = "https://quickchart.io/chart?width=500&height=250&c=" . urlencode(json_encode($chartConfig));
            $chartData = @file_get_contents($chartUrl);

            if ($chartData === false) {
                return $this->getEmptyGraphPlaceholder();
            }

            return base64_encode($chartData);
        } catch (\Exception $e) {
            Log::error('Chart generation error: ' . $e->getMessage());
            return $this->getEmptyGraphPlaceholder();
        }
    }

    /**
     * Get placeholder for empty graph.
     */
    private function getEmptyGraphPlaceholder(): string
    {
        $emptyChart = [
            "type" => "bar",
            "data" => [
                "labels" => ["No Data"],
                "datasets" => [
                    [
                        "label" => "No Data Available",
                        "data" => [0],
                        "backgroundColor" => "rgba(200,200,200,0.5)"
                    ]
                ]
            ]
        ];

        $chartUrl = "https://quickchart.io/chart?width=500&height=250&c=" . urlencode(json_encode($emptyChart));
        $chartContent = @file_get_contents($chartUrl);
        return base64_encode($chartContent ?: '');
    }

    private function jsonError(string $message, int $code = 500): JsonResponse
    {
        return response()->json(['success' => false, 'error' => $message], $code);
    }
}