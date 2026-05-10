# Figma MCP 실습 메모

## 현재 세션 상태

이 작업에서는 Figma 관련 스킬 사용법을 확인했지만, 실제 Figma 파일에 쓰는 `use_figma` 도구와 MCP 리소스가 현재 세션에 노출되어 있지 않았다. 그래서 실습 흐름은 다음처럼 진행했다.

```text
React 화면 구조 확인
-> Figma에서 먼저 만들 디자인 명세 작성
-> 그 명세를 기준으로 React 화면 수정
```

실제 회사 환경에서 Figma MCP가 연결되어 있으면 중간 단계의 디자인 명세를 Figma 캔버스에 직접 만들고, 생성된 화면을 기준으로 React를 수정하면 된다.

## 실습 대상 화면

```text
frontend/src/pages/DashboardPage.jsx
```

대시보드 첫 화면을 기준으로 잡았다. 이유는 KPI, 차트, 위험 교육생 테이블이 모두 있어 Figma 설계와 React 구현의 연결을 연습하기 좋기 때문이다.

## Figma에서 먼저 잡을 설계

화면 목적:

```text
교육생 위험 신호를 빠르게 발견하고, 전체 목록이나 프로그램 비교로 이동한다.
```

첫 화면 정보 우선순위:

```text
1. 화면 제목과 사용 목적
2. 주요 이동 액션
3. 데이터 파이프라인 상태 요약
4. KPI 카드
5. 차트와 위험 교육생 테이블
```

디자인 섹션:

```text
Dashboard Hero
- 화면 목적을 설명하는 타이틀
- 전체 교육생, 프로그램 비교 액션

Insight Strip
- 데이터 기준
- Airflow 자동화 흐름
- 현재 위험도 필터 기준

KPI Grid
- 고유 교육생
- 평균 종합 역량
- 위험 교육생
- 총 학습 클릭

Analytics Grid
- 최종 결과 분포
- 위험도 분포
- 주차별 활동
- 평균 역량 프로필
- 위험 교육생 테이블
```

## React 반영 내용

```text
DashboardPage.jsx
- 기존 단순 링크 toolbar를 제거
- Figma 설계 기준의 dashboard hero 추가
- 데이터 파이프라인 요약 insight strip 추가

global.css
- hero, action button, insight strip 스타일 추가
- 모바일에서 hero와 insight strip이 한 열로 정렬되도록 반응형 보강
```

## 내일 회사에서 설명할 문장

```text
개인 실습에서는 Figma MCP가 연결되어 있지 않아 React 화면을 직접 수정했지만,
실무 흐름으로는 Figma MCP로 화면 구조와 디자인을 먼저 만들고,
그 결과를 기준으로 React 컴포넌트와 CSS를 맞추는 방식으로 작업할 수 있습니다.
```
