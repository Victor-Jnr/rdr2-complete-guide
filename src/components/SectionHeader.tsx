export function SectionHeader({ title, aside }: { title: string; aside?: string }) {
  return (
    <header className="row" style={{ justifyContent: 'space-between', margin: '8px 0' }}>
      <h2 style={{ fontSize: '1.15rem' }}>{title}</h2>
      {aside ? <span style={{ color: 'var(--ink-muted)' }}>{aside}</span> : null}
    </header>
  );
}
