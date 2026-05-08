export function toWeeklyChartData(items = []) {
  const weeklyTotals = items.reduce((acc, item) => {
    const week = Number(item.week ?? 0);
    acc.set(week, (acc.get(week) ?? 0) + Number(item.total_clicks ?? 0));
    return acc;
  }, new Map());

  return Array.from(weeklyTotals.entries())
    .sort(([weekA], [weekB]) => weekA - weekB)
    .map(([week, totalClicks]) => ({
      week,
      weekLabel: `${week}주`,
      totalClicks,
    }));
}

export function toCompetencyRadarData(source) {
  if (!source) {
    return [];
  }

  const assessmentScore = Number(source.assessment_score ?? source.average_assessment_score ?? 0);
  const engagementScore = Number(source.engagement_score ?? source.average_engagement_score ?? 0);
  const diligenceScore = Number(source.diligence_score ?? source.average_diligence_score ?? 0);
  const competencyScore = Number(source.competency_score ?? source.average_competency_score ?? 0);

  // 집계 데이터(대시보드)일 때만 6각형, 개인 데이터(상세 페이지)는 4각형
  if (!source.final_result_counts) {
    return [
      { metric: '평가 점수', score: Math.round(assessmentScore * 10) / 10 },
      { metric: '학습 참여', score: Math.round(engagementScore * 10) / 10 },
      { metric: '성실도', score: Math.round(diligenceScore * 10) / 10 },
      { metric: '종합 역량', score: Math.round(competencyScore * 10) / 10 },
    ];
  }

  const counts = source.final_result_counts;
  const totalReg = Number(source.total_registrations ?? 1);
  const passRate = (((counts.Pass ?? 0) + (counts.Distinction ?? 0)) / totalReg) * 100;
  const retentionRate = (1 - (counts.Withdrawn ?? 0) / totalReg) * 100;

  return [
    { metric: '평가 점수', score: Math.round(assessmentScore * 10) / 10 },
    { metric: '합격률', score: Math.round(passRate * 10) / 10 },
    { metric: '학습 참여', score: Math.round(engagementScore * 10) / 10 },
    { metric: '종합 역량', score: Math.round(competencyScore * 10) / 10 },
    { metric: '수료 유지율', score: Math.round(retentionRate * 10) / 10 },
    { metric: '성실도', score: Math.round(diligenceScore * 10) / 10 },
  ];
}
