export function ProgressBar({ done, total, label }: { done: number; total: number; label?: string }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div>
      {label ? (
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span>{label}</span>
          <span>
            {done} / {total} · {pct}%
          </span>
        </div>
      ) : null}
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{ height: 10, background: 'var(--leather)', borderRadius: 99 }}
      >
        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--brass)', borderRadius: 99 }} />
      </div>
    </div>
  );
}
