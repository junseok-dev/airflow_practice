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

function roundScore(value) {
  return Math.round(Number(value ?? 0) * 10) / 10;
}

export function toCompetencyRadarData(source) {
  if (!source) {
    return [];
  }

  const assessmentScore = Number(source.assessment_score ?? source.average_assessment_score ?? 0);
  const engagementScore = Number(source.engagement_score ?? source.average_engagement_score ?? 0);
  const diligenceScore = Number(source.diligence_score ?? source.average_diligence_score ?? 0);
  const competencyScore = Number(source.competency_score ?? source.average_competency_score ?? 0);

  if (source.submission_rate !== undefined) {
    const submissionRate = Number(source.submission_rate ?? 0);
    const onTimeRate = 100 - Number(source.late_submission_rate ?? 0);
    return [
      { metric: '평가 점수', score: roundScore(assessmentScore) },
      { metric: '제출률', score: roundScore(submissionRate) },
      { metric: '학습 참여', score: roundScore(engagementScore) },
      { metric: '종합 역량', score: roundScore(competencyScore) },
      { metric: '정시 제출', score: roundScore(onTimeRate) },
      { metric: '성실도', score: roundScore(diligenceScore) },
    ];
  }

  if (source.final_result_counts) {
    const counts = source.final_result_counts;
    const totalReg = Number(source.total_registrations ?? 1);
    const passRate = (((counts.Pass ?? 0) + (counts.Distinction ?? 0)) / totalReg) * 100;
    const retentionRate = (1 - (counts.Withdrawn ?? 0) / totalReg) * 100;
    return [
      { metric: '평가 점수', score: roundScore(assessmentScore) },
      { metric: '합격률', score: roundScore(passRate) },
      { metric: '학습 참여', score: roundScore(engagementScore) },
      { metric: '종합 역량', score: roundScore(competencyScore) },
      { metric: '유지율', score: roundScore(retentionRate) },
      { metric: '성실도', score: roundScore(diligenceScore) },
    ];
  }

  return [
    { metric: '평가 점수', score: roundScore(assessmentScore) },
    { metric: '학습 참여', score: roundScore(engagementScore) },
    { metric: '성실도', score: roundScore(diligenceScore) },
    { metric: '종합 역량', score: roundScore(competencyScore) },
  ];
}
