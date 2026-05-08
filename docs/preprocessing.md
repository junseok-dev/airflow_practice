# 데이터 탐색 기록

- 생성 시각: 2026-05-08 08:06:11
- 데이터셋: Open University Learning Analytics Dataset(OULAD)
- 원천 경로: `data/raw/oulad/`
- CSV 파일 수: 7개
- CSV 데이터 행 수 합계: 10,900,970행
- CSV 파일 크기 합계: 442.89 MB

## 파일 요약

| 파일 | 크기 | 행 수 | 컬럼 수 | 주요 컬럼 |
| --- | ---: | ---: | ---: | --- |
| `courses.csv` | 526 B | 22 | 3 | `code_module`, `code_presentation` |
| `assessments.csv` | 8.02 KB | 206 | 6 | `code_module`, `code_presentation`, `id_assessment` |
| `studentInfo.csv` | 3.30 MB | 32,593 | 12 | `code_module`, `code_presentation`, `id_student` |
| `studentRegistration.csv` | 1.08 MB | 32,593 | 5 | `code_module`, `code_presentation`, `id_student` |
| `studentAssessment.csv` | 5.43 MB | 173,912 | 5 | `id_assessment`, `id_student` |
| `studentVle.csv` | 432.81 MB | 10,655,280 | 6 | `code_module`, `code_presentation`, `id_student`, `id_site` |
| `vle.csv` | 264.27 KB | 6,364 | 6 | `id_site`, `code_module`, `code_presentation` |
| `OULAD.names` | 11.99 KB | 214 lines | - | 데이터셋 설명 파일 |

## 컬럼 및 결측치

### courses.csv

| 컬럼 | 결측치 수 | 샘플 값 |
| --- | ---: | --- |
| `code_module` | 0 | `AAA`, `BBB`, `CCC` |
| `code_presentation` | 0 | `2013J`, `2014J`, `2013B` |
| `module_presentation_length` | 0 | `268`, `269`, `262` |

### assessments.csv

| 컬럼 | 결측치 수 | 샘플 값 |
| --- | ---: | --- |
| `code_module` | 0 | `AAA`, `BBB`, `CCC` |
| `code_presentation` | 0 | `2013J`, `2014J`, `2013B` |
| `id_assessment` | 0 | `1752`, `1753`, `1754` |
| `assessment_type` | 0 | `TMA`, `Exam`, `CMA` |
| `date` | 11 | `19`, `54`, `117` |
| `weight` | 0 | `10`, `20`, `30` |

### studentInfo.csv

| 컬럼 | 결측치 수 | 샘플 값 |
| --- | ---: | --- |
| `code_module` | 0 | `AAA`, `BBB`, `CCC` |
| `code_presentation` | 0 | `2013J`, `2014J`, `2013B` |
| `id_student` | 0 | `11391`, `28400`, `30268` |
| `gender` | 0 | `M`, `F` |
| `region` | 0 | `East Anglian Region`, `Scotland`, `North Western Region` |
| `highest_education` | 0 | `HE Qualification`, `A Level or Equivalent`, `Lower Than A Level` |
| `imd_band` | 1,111 | `90-100%`, `20-30%`, `30-40%` |
| `age_band` | 0 | `55<=`, `35-55`, `0-35` |
| `num_of_prev_attempts` | 0 | `0`, `1`, `2` |
| `studied_credits` | 0 | `240`, `60`, `120` |
| `disability` | 0 | `N`, `Y` |
| `final_result` | 0 | `Pass`, `Withdrawn`, `Fail` |

### studentRegistration.csv

| 컬럼 | 결측치 수 | 샘플 값 |
| --- | ---: | --- |
| `code_module` | 0 | `AAA`, `BBB`, `CCC` |
| `code_presentation` | 0 | `2013J`, `2014J`, `2013B` |
| `id_student` | 0 | `11391`, `28400`, `30268` |
| `date_registration` | 45 | `-159`, `-53`, `-92` |
| `date_unregistration` | 22,521 | `12`, `96`, `72` |

### studentAssessment.csv

| 컬럼 | 결측치 수 | 샘플 값 |
| --- | ---: | --- |
| `id_assessment` | 0 | `1752`, `1753`, `1754` |
| `id_student` | 0 | `11391`, `28400`, `31604` |
| `date_submitted` | 0 | `18`, `22`, `17` |
| `is_banked` | 0 | `0`, `1` |
| `score` | 173 | `78`, `70`, `72` |

### studentVle.csv

| 컬럼 | 결측치 수 | 샘플 값 |
| --- | ---: | --- |
| `code_module` | 0 | `AAA`, `BBB`, `CCC` |
| `code_presentation` | 0 | `2013J`, `2014J`, `2013B` |
| `id_student` | 0 | `28400`, `30268`, `31604` |
| `id_site` | 0 | `546652`, `546614`, `546714` |
| `date` | 0 | `-10`, `-9`, `-8` |
| `sum_click` | 0 | `4`, `1`, `11` |

### vle.csv

| 컬럼 | 결측치 수 | 샘플 값 |
| --- | ---: | --- |
| `id_site` | 0 | `546943`, `546712`, `546998` |
| `code_module` | 0 | `AAA`, `BBB`, `CCC` |
| `code_presentation` | 0 | `2013J`, `2014J`, `2013B` |
| `activity_type` | 0 | `resource`, `oucontent`, `url` |
| `week_from` | 5,243 | `2`, `1`, `9` |
| `week_to` | 5,243 | `2`, `1`, `9` |

## 조인 키 후보

| 키 | 등장 파일 | 파일별 고유값 수 |
| --- | --- | --- |
| `code_module` | `courses.csv`, `assessments.csv`, `studentInfo.csv`, `studentRegistration.csv`, `studentVle.csv`, `vle.csv` | `courses.csv`: 7, `assessments.csv`: 7, `studentInfo.csv`: 7, `studentRegistration.csv`: 7, `studentVle.csv`: 7, `vle.csv`: 7 |
| `code_presentation` | `courses.csv`, `assessments.csv`, `studentInfo.csv`, `studentRegistration.csv`, `studentVle.csv`, `vle.csv` | `courses.csv`: 4, `assessments.csv`: 4, `studentInfo.csv`: 4, `studentRegistration.csv`: 4, `studentVle.csv`: 4, `vle.csv`: 4 |
| `id_assessment` | `assessments.csv`, `studentAssessment.csv` | `assessments.csv`: 206, `studentAssessment.csv`: 188 |
| `id_site` | `studentVle.csv`, `vle.csv` | `studentVle.csv`: 6,268, `vle.csv`: 6,364 |
| `id_student` | `studentInfo.csv`, `studentRegistration.csv`, `studentAssessment.csv`, `studentVle.csv` | `studentInfo.csv`: 28,785, `studentRegistration.csv`: 28,785, `studentAssessment.csv`: 23,369, `studentVle.csv`: 26,074 |

## 전처리 아이디어

- `studentInfo.csv` + `studentRegistration.csv`를 `code_module`, `code_presentation`, `id_student` 기준으로 조인
- `studentAssessment.csv` + `assessments.csv`를 `id_assessment` 기준으로 조인
- `studentVle.csv` + `vle.csv`를 `code_module`, `code_presentation`, `id_site` 기준으로 조인
- 평가 점수, 제출 지연 여부, 평가 가중치를 활용해 평가 성취도 계산
- VLE 클릭 수와 활동 일수를 활용해 학습 참여도 계산
- 낮은 평가 점수, 낮은 활동량, `Withdrawn` 결과를 활용해 위험 교육생 후보 산출

## 다음 작업

1. `studentInfo`, `studentRegistration` 조인 결과 생성
2. `studentAssessment`, `assessments` 조인 결과 생성
3. `studentVle`를 주차 단위로 집계
4. `data/mart/dashboard_summary.json` 생성
