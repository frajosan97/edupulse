<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $examInfo?->name }}</title>
    <link rel="stylesheet" href="{{ public_path('/storage/css/report-form.css') }}">
</head>

<body>

    @forelse ($examInfo?->analysis['meritList'] ?? [] as $student)
        <div class="report-card">
            <!-- Header -->
            <table class="header-table">
                <tr>
                    <td style="text-align: left;">
                        <img class="logo" src="{{ public_path(
            $schoolInfo['logo']?->image_path
            ? 'storage/' . $schoolInfo['logo']?->image_path
            : 'storage/images/landlord/logo/default.png'
        ) }}" alt="School Logo">
                    </td>
                    <td style="text-align: right;">
                        <h1 class="school-name">{{ $schoolInfo['tenant']?->name }}</h1>
                        <h3>P.O BOX {{ $schoolInfo['address']?->value }}</h3>
                        <h3>Tel: {{ $schoolInfo['phone']?->value }}</h3>
                        <h3>Email: {{ $schoolInfo['email']?->value }}</h3>
                    </td>
                </tr>
            </table>

            <!-- Exam Heading -->
            <h3 class="title-section">
                ACADEMIC REPORT FORM - {{ $examInfo?->classInfo?->name }} –
                {{ $examInfo?->term?->name }} – {{ $examInfo?->name }}
            </h3>

            <!-- Student Info -->
            <div class="student-info">
                <table class="student-info-table">
                    <tr>
                        <td>
                            <img class="passport" src="{{ public_path(
            $student['profile_image']
            ? 'storage/' . $student['profile_image']
            : 'storage/images/landlord/profiles/avatar.png'
        ) }}" alt="Student Passport">
                        </td>
                        <td class="student-info-data">
                            <h4>Name: {{ $student['name'] }}</h4>
                            <h4>Adm No: {{ $student['admission_number'] }}</h4>
                            <h4>Form: {{ $student['class'] }}</h4>
                            <h4>UPI: N/A</h4>
                            <h4>KCPE/KJSEA: N/A</h4>
                            <h4>VAP: N/A</h4>
                        </td>
                        <td>
                            <img src="data:image/png;base64,{{ $student['subjectPerformanceGraph'] }}"
                                style="width: 40%; height: 15%;" alt="Performance Graph">
                        </td>
                    </tr>
                </table>

                <table class="performance-table">
                    <tr>
                        <td>
                            <h5>Total Marks</h5>
                            <span>{{ $student['total_marks'] }}</span>
                        </td>
                        <td>
                            <h5>Mean</h5>
                            <span>{{ $student['avg_marks'] }}</span>
                        </td>
                        <td>
                            <h5>Total Points</h5>
                            <span>{{ $student['total_points'] }}</span>
                        </td>
                        <td>
                            <h5>Grade</h5>
                            <span>{{ $student['avg_grade'] }}</span>
                        </td>
                        <td>
                            <h5>Stream Position</h5>
                            <span>{{ $student['stream_rank'] ?? "N/A" }}</span>
                        </td>
                        <td>
                            <h5>Overall Position</h5>
                            <span>{{ $student['class_rank'] ?? "N/A" }}</span>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- Subjects Table -->
            <div class="reportform-body">
                <table class="subjects-table">
                    <tr>
                        <th class="subject-column">SUBJECTS</th>
                        <th class="marks-column">MARKS</th>
                        <th class="points-column">POINTS</th>
                        <th class="dev-column">DEV</th>
                        <th class="grade-column">GRADE</th>
                        <th class="rank-column">RANK</th>
                        <th class="comment-column">COMMENT</th>
                        <th class="teacher-column">TEACHER</th>
                    </tr>

                    @foreach ($student['subjects'] as $subject)
                        <tr>
                            <td class="subject-column">{{ $subject['subject'] }}</td>
                            <td class="marks-column">{{ number_format($subject['marks'], 0) . '%' }}</td>
                            <td class="points-column">{{ $subject['points'] }}</td>
                            <td class="dev-column">{{ $subject['dev'] }}</td>
                            <td class="grade-column">{{ $subject['grade'] }}</td>
                            <td class="rank-column">{{ $subject['rank'] }}</td>
                            <td class="comment-column">{{ $subject['remarks'] }}</td>
                            <td class="teacher-column">{{ $subject['teacher'] }}</td>
                        </tr>
                    @endforeach
                </table>

                <!-- Graphs and Remarks Section -->
                <table class="graphs-section-table">
                    <tr>
                        <td class="graph-td">
                            <table class="remarks-table">
                                <tr>
                                    <td>
                                        <h4>{{ ucwords($student['name']) }} Performance Overtime</h4>
                                        <img src="data:image/png;base64,{{ $student['performanceTrendGraph'] }}"
                                            style="width: 50%; padding: 5px 0; height:auto;" alt="Performance Trend">
                                    </td>
                                </tr>
                                <tr>
                                    <td class="school-dates">
                                        <h4>School Dates</h4>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <h5>Closing Date:</h5>
                                        <h5>Opening Date:</h5>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="text-align:center;">
                                        <img class="stamp" src="{{ public_path(
            $schoolInfo['stamp']?->image_path
            ? 'storage/' . $schoolInfo['stamp']?->image_path
            : 'storage/images/landlord/stamp/default.png'
        ) }}" alt="School Stamp">
                                    </td>
                                </tr>
                            </table>
                        </td>

                        <td class="remarks-td">
                            <table class="remarks-table">
                                <tr>
                                    <td>
                                        <h4>Remarks</h4>
                                    </td>
                                    <td class="signature-column">
                                        <h4>Signature</h4>
                                    </td>
                                </tr>

                                @if(!is_null($student['class_teacher']))
                                    <tr>
                                        <td>
                                            <h5>- Class Teacher</h5>
                                            <p>{{ teacherComment($student['avg_grade']) }}</p>
                                        </td>
                                        <td class="signature-column">
                                            <!-- Class teacher signature -->
                                        </td>
                                    </tr>
                                @endif

                                @if(!is_null($schoolInfo['principal']))
                                                        <tr>
                                                            <td>
                                                                <h5>{{ $schoolInfo['principal']->full_name }} - Principal</h5>
                                                                <p>{{ principalComment($student['avg_grade']) }}</p>
                                                            </td>
                                                            <td class="signature-column">
                                                                <img src="{{ public_path(
                                        $schoolInfo['principal']->signature
                                        ? 'storage/' . $schoolInfo['principal']->signature
                                        : 'storage/' . $schoolInfo['signature']->image_path
                                    ) }}" alt="Principal Signature" height="50">
                                                            </td>
                                                        </tr>
                                @endif

                                <tr>
                                    <td class="description-td">
                                        <p style="line-height: 1.6;">
                                            Scan the QR below to view this report form and other student performance
                                        </p>
                                        <br>
                                        <strong>Username:</strong> {{ $student['admission_number'] }}<br>
                                        <strong>Password:</strong> 12345678 (or last updated password)
                                    </td>
                                    <td class="description-td qrcode-td">
                                        @php
                                            $domain = 'https://' . optional($schoolInfo['tenant']->domains->first())->domain . '/student';
                                        @endphp
                                        @if($domain)
                                            <div class="qrcode-div">
                                                {!! generate_qrcode($domain) !!}
                                            </div>
                                        @endif
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </div>
        </div>

        @if (!$loop->last)
            <div class="page-break"></div>
        @endif

    @empty
        <p>No student data available.</p>
    @endforelse

</body>

</html>