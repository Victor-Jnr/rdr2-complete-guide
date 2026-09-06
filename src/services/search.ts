import MiniSearch from 'minisearch';
import {
  activities,
  challenges,
  chapters,
  collectibles,
  compendium,
  itemRequests,
  locations,
  missions,
  missables,
  treasures,
} from '@/data';

export type SearchKind =
  | 'mission'
  | 'treasure'
  | 'location'
  | 'missable'
  | 'activity'
  | 'item-request'
  | 'chapter'
  | 'collectible'
  | 'challenge'
  | 'compendium';

export interface SearchHit {
  id: string;
  kind: SearchKind;
  title: string;
  subtitle?: string;
  href: string;
}

interface Doc {
  id: string;
  kind: SearchKind;
  title: string;
  subtitle: string;
  body: string;
  href: string;
}

function docs(): Doc[] {
  const out: Doc[] = [];
  for (const c of chapters) {
    out.push({
      id: `chapter:${c.id}`,
      kind: 'chapter',
      title: c.title,
      subtitle: c.subtitle ?? '',
      body: [c.subtitle, c.region, c.description].filter(Boolean).join(' '),
      href: `/journey/chapter/${c.id}`,
    });
  }
  for (const m of missions) {
    out.push({
      id: `mission:${m.id}`,
      kind: 'mission',
      title: m.title,
      subtitle: m.questGiver ?? '',
      body: [
        m.questGiver,
        m.summary,
        m.missableWarning,
        ...(m.tags ?? []),
        ...(m.objectives?.map((o) => o.label) ?? []),
        ...(m.missables?.map((x) => x.label) ?? []),
      ]
        .filter(Boolean)
        .join(' '),
      href: `/journey/${m.id}`,
    });
  }
  for (const t of treasures) {
    out.push({
      id: `treasure:${t.id}`,
      kind: 'treasure',
      title: t.name,
      subtitle: 'Treasure chain',
      body: [t.description, ...t.steps.map((s) => `${s.title} ${s.description ?? ''}`)].join(' '),
      href: `/treasures/${t.id}`,
    });
    for (const step of t.steps) {
      out.push({
        id: `treasure-step:${t.id}:${step.id}`,
        kind: 'treasure',
        title: step.title,
        subtitle: t.name,
        body: `${t.name} ${step.description ?? ''} ${step.reward ?? ''}`,
        href: `/treasures/${t.id}`,
      });
    }
  }
  for (const l of locations) {
    out.push({
      id: `location:${l.id}`,
      kind: 'location',
      title: l.name,
      subtitle: l.region ?? '',
      body: l.region ?? '',
      href: `/locations/${l.id}`,
    });
  }
  for (const m of missables) {
    out.push({
      id: `missable:${m.id}`,
      kind: 'missable',
      title: m.title,
      subtitle: m.category ?? '',
      body: m.description ?? '',
      href: `/missables/${m.id}`,
    });
  }
  for (const a of activities) {
    out.push({
      id: `activity:${a.id}`,
      kind: 'activity',
      title: a.title,
      subtitle: a.companion ?? a.kind,
      body: `${a.companion ?? ''} ${a.description ?? ''}`,
      href: `/journey/chapter/${a.availability.displayChapterId}`,
    });
  }
  for (const i of itemRequests) {
    out.push({
      id: `item:${i.id}`,
      kind: 'item-request',
      title: i.title,
      subtitle: i.requester ?? '',
      body: `${i.requester ?? ''} ${i.description ?? ''}`,
      href: `/journey/chapter/${i.availability.displayChapterId}`,
    });
  }
  for (const c of collectibles) {
    out.push({
      id: `collectible:${c.id}`,
      kind: 'collectible',
      title: c.title,
      subtitle: c.kind,
      body: c.kind,
      href: '/progress',
    });
  }
  for (const c of challenges) {
    out.push({
      id: `challenge:${c.id}`,
      kind: 'challenge',
      title: c.title,
      subtitle: c.category,
      body: [c.category, ...c.ranks.map((r) => r.description)].join(' '),
      href: '/progress',
    });
  }
  for (const c of compendium) {
    out.push({
      id: `compendium:${c.id}`,
      kind: 'compendium',
      title: c.title,
      subtitle: c.kind,
      body: [c.kind, c.familyTitle, c.generalLocation?.summary, ...(c.generalLocation?.namedPlaces ?? [])]
        .filter(Boolean)
        .join(' '),
      href: `/compendium/${c.id}`,
    });
  }
  return out;
}

let index: MiniSearch<Doc> | null = null;

export function getSearchIndex(): MiniSearch<Doc> {
  if (!index) {
    index = new MiniSearch({
      fields: ['title', 'subtitle', 'body'],
      storeFields: ['kind', 'title', 'subtitle', 'href'],
      searchOptions: { prefix: true, fuzzy: 0.2, boost: { title: 3, subtitle: 1.5 } },
    });
    index.addAll(docs());
  }
  return index;
}

export function searchGuide(query: string, limit = 40): SearchHit[] {
  const q = query.trim();
  if (!q) return [];
  const results = getSearchIndex().search(q);
  return results.slice(0, limit).map((r) => ({
    id: String(r.id),
    kind: r.kind as SearchKind,
    title: r.title as string,
    subtitle: (r.subtitle as string) || undefined,
    href: r.href as string,
  }));
}

export const SEARCH_GROUP_ORDER: SearchKind[] = [
  'mission',
  'treasure',
  'location',
  'missable',
  'activity',
  'item-request',
  'collectible',
  'challenge',
  'compendium',
  'chapter',
];
