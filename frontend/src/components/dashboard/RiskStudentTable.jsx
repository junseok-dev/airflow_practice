function formatScore(value) {
  if (value === null || value === undefined) {
    return '-';
  }

  return Number(value).toFixed(1);
}

export default function RiskStudentTable({ students }) {
  return (
    <section className="panel panel--wide">
      <div className="panel__header">
        <h2>위험 교육생</h2>
        <span>{students.length}명 표시</span>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>교육생 ID</th>
              <th>과정</th>
              <th>최종 결과</th>
              <th>평가</th>
              <th>참여</th>
              <th>종합</th>
              <th>위험도</th>
              <th>위험 사유</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={`${student.code_module}-${student.code_presentation}-${student.id_student}`}>
                <td>{student.id_student}</td>
                <td>
                  {student.code_module} / {student.code_presentation}
                </td>
                <td>{student.final_result}</td>
                <td>{formatScore(student.assessment_score)}</td>
                <td>{formatScore(student.engagement_score)}</td>
                <td>{formatScore(student.competency_score)}</td>
                <td>
                  <span className={`badge badge--${student.risk_level}`}>{student.risk_level}</span>
                </td>
                <td>{student.risk_reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
