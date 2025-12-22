<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $examInfo?->name }}</title>
    <link rel="stylesheet" href="{{ public_path('/storage/css/analysis.css') }}">
</head>

<body>
    <!-- Header -->
    <div class="header">
        <table class="header-table">
            <tr>
                {{-- LEFT : LOGO --}}
                <td class="left">
                    <img class="logo" src="{{ public_path(
    $schoolInfo['logo']?->image_path ? 'storage/' . $schoolInfo['logo']?->image_path : 'storage/images/landlord/logo/default.png'
) }}" alt="">
                </td>

                {{-- CENTER : SCHOOL DETAILS --}}
                <td class="center">
                    <div class="school-name">
                        {{ $schoolInfo['tenant']?->name }}
                    </div>

                    <div>
                        P.O BOX {{ $schoolInfo['address']?->value }}
                    </div>

                    <div>
                        Tel: {{ $schoolInfo['phone']?->value }}
                        | Email: {{ $schoolInfo['email']?->value }}
                    </div>

                    <div class="exam-title" style="text-transform: uppercase;">
                        Form {{ $examInfo?->classInfo?->name }}
                        – {{ $examInfo?->term?->name }}
                        – {{ $examInfo?->name }} Merit List
                    </div>
                </td>

                {{-- RIGHT : META --}}
                <td class="right">
                    <div>Status: Published</div>
                    <div>Date: {{ now()->format('d/m/Y H:i') }}</div>
                </td>
            </tr>
        </table>
    </div>

    <!-- Dividers -->
    <div class="dividers">
        <div class="line-1"></div>
        <div class="line-2"></div>
    </div>

    <!-- Analysis Cards -->
    <div class="statistics">
        <table class="stats-table">
            <tr>
                <td class="stats-card">
                    <h2>{{ $examInfo?->analysis['overviewStats']['students'] ?? 'N/A' }}</h2>
                    <small>Students</small>
                </td>
                <td class="stats-card">
                    <h2>{{ $examInfo?->analysis['overviewStats']['avgMarks'] ?? 'N/A' }}</h2>
                    <small>Mean Marks</small>
                </td>
                <td class="stats-card">
                    <h2>{{ $examInfo?->analysis['overviewStats']['avgPoints'] ?? 'N/A' }}</h2>
                    <small>Mean Points</small>
                </td>
                <td class="stats-card">
                    <h2>{{ $examInfo?->analysis['overviewStats']['avgGrade'] ?? 'N/A' }}</h2>
                    <small>Mean Grade</small>
                </td>
            </tr>
        </table>
    </div>

    <!-- Merit List -->
    <div class="merit-list">
        <table class="merit-table">
            <thead>
                <tr>
                    <th>Adm</th>
                    <th class="name-col">Name</th>
                    <th class="class-col">Class</th>
                    @foreach ($examInfo?->analysis['subjectPerformance'] ?? [] as $subject)
                        <th class="subject-name">{{ $subject['general']['subjectInfo']['short_name'] ?? 'N/A' }}</th>
                    @endforeach
                    <th>Marks</th>
                    <th>Mean</th>
                    <th>Pnts</th>
                    <th>Avg</th>
                    <th>Grade</th>
                    <th>Postn</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($examInfo?->analysis['meritList'] ?? [] as $student)
                    @php
                        $studentSubjects = collect($student['subjects'] ?? [])->keyBy('subject_id');
                    @endphp
                    <tr>
                        <td>{{ $student['admission_number'] ?? 'N/A' }}</td>
                        <td class="name-col">{{ $student['name'] ?? 'N/A' }}</td>
                        <td class="class-col">{{ $student['class'] ?? 'N/A' }}</td>
                        @foreach ($examInfo?->analysis['subjectPerformance'] ?? [] as $subject)
                            <td class="score-col">
                                {{ $studentSubjects[$subject['general']['subjectInfo']['id']]['full_marks'] ?? '--' }}
                            </td>
                        @endforeach
                        <td class="total-col">{{ $student['total_marks'] ?? 'N/A' }}</td>
                        <td class="mean-col">{{ $student['avg_marks'] ?? 'N/A' }}</td>
                        <td class="points-col">{{ $student['total_points'] ?? 'N/A' }}</td>
                        <td class="avg-points-col">{{ $student['avg_points'] ?? 'N/A' }}</td>
                        <td class="grade-col">{{ $student['avg_grade'] ?? 'N/A' }}</td>
                        <td class="position-col">{{ $student['class_rank'] ?? 'N/A' }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="{{ 8 + (count($examInfo?->analysis['subjectPerformance'] ?? [])) }}"
                            style="text-align: center;">
                            No data available
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <!-- Grade Distribution -->
    <div class="grades-distribution">
        <h4>Overall Performance - Grade Distribution</h4>
        <table class="table" style="margin-bottom: 5px;">
            <thead>
                <tr>
                    <th style="text-align:left;">Form / Stream</th>
                    @foreach ($examInfo?->analysis['gradeDistribution']['general']['grades'] ?? [] as $grade => $value)
                        <th style="width: 50px;">{{ $grade }}</th>
                    @endforeach
                    <th>Count</th>
                    <th>Mean</th>
                    <th>Grade</th>
                    <th>Teacher</th>
                </tr>
            </thead>
            <tbody>
                {{-- Overall (General) Distribution --}}
                <tr>
                    <th style="text-align: left;">{{ $examInfo?->classInfo?->name }}</th>
                    @foreach ($examInfo?->analysis['gradeDistribution']['general']['grades'] ?? [] as $grade => $value)
                        <td>
                            {{ $value['count'] ?? 0 }}
                        </td>
                    @endforeach
                    <td>{{ $examInfo?->analysis['gradeDistribution']['general']['count'] ?? 0 }}</td>
                    <td>{{ $examInfo?->analysis['gradeDistribution']['general']['mean'] ?? 0 }}</td>
                    <td>{{ $examInfo?->analysis['gradeDistribution']['general']['grade'] ?? '-' }}</td>
                    <td>{{ $examInfo?->classInfo?->teacher ?? '-' }}</td>
                </tr>

                {{-- Streams Distribution --}}
                @foreach ($examInfo?->analysis['gradeDistribution']['streams'] ?? [] as $stream => $data)
                    <tr>
                        <th style="text-align: left;">{{ $examInfo?->classInfo?->name . ' ' . $stream }}</th>
                        @foreach ($data['grades'] ?? [] as $grade => $value)
                            <td>
                                {{ $value['count'] ?? 0 }}
                            </td>
                        @endforeach
                        <td>{{ $data['count'] ?? 0 }}</td>
                        <td>{{ $data['mean'] ?? 0 }}</td>
                        <td>{{ $data['grade'] ?? '-' }}</td>
                        <td>{{ $examInfo?->streams[$stream]['teacher'] ?? '-' }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <h4>Subjects Performance - Grade Distribution</h4>
        @foreach ($examInfo?->analysis['subjectPerformance'] ?? [] as $subject => $data)
            <table class="table table-bordered" style="margin-bottom: 10px; border-collapse: collapse; width:100%;">
                <thead>
                    <tr>
                        <th colspan="{{ count($data['general']['grades']) + 5 }}"
                            style="text-align: left; background-color: #f8f9fa;">
                            {{ $subject }}
                        </th>
                    </tr>
                    <tr>
                        <th style="text-align: left;">Form / Stream</th>
                        @foreach ($data['general']['grades'] as $grade)
                            <th style="width: 50px;">{{ $grade['grade'] }}</th>
                        @endforeach
                        <th>Count</th>
                        <th>Mean</th>
                        <th>Grade</th>
                        <th>Teacher</th>
                    </tr>
                </thead>
                <tbody>
                    {{-- General row --}}
                    <tr>
                        <th style="text-align: left;">{{ $examInfo?->classInfo?->name }}</th>
                        @foreach ($data['general']['grades'] as $grade)
                            <td>{{ $grade['count'] }}</td>
                        @endforeach
                        <td>{{ $data['general']['count'] }}</td>
                        <td>{{ $data['general']['avg'] }}</td>
                        <td>{{ $data['general']['grade'] }}</td>
                        <td>{{ $data['general']['teacher'] }}</td>
                    </tr>

                    {{-- Streams rows --}}
                    @foreach ($data['streams'] as $stream => $streamData)
                        <tr>
                            <th style="text-align: left;">{{ $examInfo?->classInfo?->name . ' ' . $stream }}</th>
                            @foreach ($streamData['grades'] as $grade)
                                <td>{{ $grade['count'] }}</td>
                            @endforeach
                            <td>{{ $streamData['count'] }}</td>
                            <td>{{ $streamData['avg'] }}</td>
                            <td>{{ $streamData['grade'] }}</td>
                            <td>{{ $streamData['teacher'] }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @endforeach
    </div>
</body>

</html>