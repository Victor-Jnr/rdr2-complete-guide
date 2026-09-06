import { createBrowserRouter, Navigate } from 'react-router';
import { RootLayout } from '@/layouts/RootLayout';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, element: <Navigate to="/journey" replace /> },
      { path: 'journey', lazy: () => import('@/features/journey/JourneyPage').then((m) => ({ Component: m.default })) },
      { path: 'journey/chapter/:chapterId', lazy: () => import('@/features/journey/ChapterDetailPage').then((m) => ({ Component: m.default })) },
      { path: 'journey/:missionId', lazy: () => import('@/features/journey/MissionDetailPage').then((m) => ({ Component: m.default })) },
      { path: 'treasures', lazy: () => import('@/features/treasures/TreasuresPage').then((m) => ({ Component: m.default })) },
      { path: 'treasures/:treasureId', lazy: () => import('@/features/treasures/TreasureDetailPage').then((m) => ({ Component: m.default })) },
      { path: 'map', lazy: () => import('@/features/map/MapPage').then((m) => ({ Component: m.default })) },
      { path: 'compendium', lazy: () => import('@/features/compendium/CompendiumPage').then((m) => ({ Component: m.default })) },
      { path: 'compendium/:entryId', lazy: () => import('@/features/compendium/CompendiumEntryPage').then((m) => ({ Component: m.default })) },
      { path: 'search', lazy: () => import('@/features/search/SearchPage').then((m) => ({ Component: m.default })) },
      { path: 'progress', lazy: () => import('@/features/progress/ProgressPage').then((m) => ({ Component: m.default })) },
      { path: 'progress/saved', lazy: () => import('@/features/progress/SavedPage').then((m) => ({ Component: m.default })) },
      { path: 'locations/:locationId', lazy: () => import('@/features/map/LocationPage').then((m) => ({ Component: m.default })) },
      { path: 'missables/:missableId', lazy: () => import('@/features/journey/MissablePage').then((m) => ({ Component: m.default })) },
      { path: 'settings', lazy: () => import('@/features/settings/SettingsPage').then((m) => ({ Component: m.default })) },
      { path: 'about', lazy: () => import('@/features/about/AboutPage').then((m) => ({ Component: m.default })) },
      { path: '*', lazy: () => import('@/features/NotFoundPage').then((m) => ({ Component: m.default })) },
    ],
  },
]);
