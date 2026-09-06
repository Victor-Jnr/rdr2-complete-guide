import { useParams } from 'react-router';
import { missablesById } from '@/data';
import { EmptyState } from '@/components/EmptyState';
import { AvailabilityPanel } from '@/components/AvailabilityPanel';
import { SourceAttribution } from '@/components/SourceAttribution';

export default function MissablePage() {
  const { missableId = '' } = useParams();
  const item = missablesById.get(missableId);
  if (!item) {
    return (
      <main className="page">
        <EmptyState title="Missable not found" body="Standalone missable pages appear when that record has been researched." />
      </main>
    );
  }
  return (
    <main className="page stack">
      <h1>{item.title}</h1>
      {item.description ? <p>{item.description}</p> : null}
      <AvailabilityPanel availability={item.availability} />
      <SourceAttribution sourceIds={item.sourceIds} extra={[item.research]} />
    </main>
  );
}
