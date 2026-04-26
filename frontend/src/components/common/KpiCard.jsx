export default function KpiCard({ label, value, helper, tone = 'default' }) {
  return (
    <article className={`kpi-card kpi-card--${tone}`}>
      <span className="kpi-card__label">{label}</span>
      <strong className="kpi-card__value">{value}</strong>
      <span className="kpi-card__helper">{helper}</span>
    </article>
  );
}
