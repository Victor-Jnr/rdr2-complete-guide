interface Props {
  title: string;
  body?: string;
}

export function EmptyState({ title, body }: Props) {
  return (
    <div className="journal-panel" style={{ padding: 20, textAlign: 'center' }}>
      <h2>{title}</h2>
      {body ? <p style={{ color: 'var(--ink-muted)' }}>{body}</p> : null}
    </div>
  );
}
