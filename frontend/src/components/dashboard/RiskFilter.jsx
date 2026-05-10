const FILTERS = [
  { label: '전체', value: '' },
  { label: '위험', value: 'medium' },
  { label: '고위험', value: 'high' },
];

export default function RiskFilter({ value, onChange }) {
  return (
    <div className="segmented-control" aria-label="위험 교육생 필터">
      {FILTERS.map((filter) => (
        <button
          className={value === filter.value ? 'segmented-control__item is-active' : 'segmented-control__item'}
          key={filter.value || 'all'}
          onClick={() => onChange(filter.value)}
          type="button"
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
