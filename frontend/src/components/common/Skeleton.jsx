function SkeletonLine({ width = '100%', height = 14, style }) {
  return <div className="skeleton" style={{ width, height, borderRadius: 4, ...style }} />;
}

export function SkeletonKpiGrid() {
  return (
    <section className="kpi-grid">
      {Array.from({ length: 4 }, (_, i) => (
        <article key={i} className="kpi-card">
          <SkeletonLine width="55%" height={13} />
          <SkeletonLine width="45%" height={32} style={{ margin: '14px 0 10px' }} />
          <SkeletonLine width="70%" height={13} />
        </article>
      ))}
    </section>
  );
}

export function SkeletonChartGrid() {
  return (
    <section className="dashboard-grid">
      {Array.from({ length: 4 }, (_, i) => (
        <section key={i} className="panel">
          <div className="panel__header">
            <SkeletonLine width={120} height={17} />
          </div>
          <div className="chart-box" style={{ display: 'flex', alignItems: 'flex-end', gap: 8, padding: 18 }}>
            {Array.from({ length: 6 }, (_, j) => (
              <SkeletonLine key={j} width="100%" height={`${40 + Math.sin(j) * 30 + 60}px`} style={{ flex: 1 }} />
            ))}
          </div>
        </section>
      ))}
    </section>
  );
}

export function SkeletonTable({ rows = 6, cols = 7 }) {
  return (
    <section className="panel panel--wide">
      <div className="panel__header">
        <SkeletonLine width={140} height={17} />
      </div>
      <div style={{ padding: '12px 20px', display: 'grid', gap: 4 }}>
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12, padding: '10px 0', borderBottom: '1px solid #eef2f7' }}>
            {Array.from({ length: cols }, (_, j) => (
              <SkeletonLine key={j} width={j === 0 ? '60%' : '80%'} height={14} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
