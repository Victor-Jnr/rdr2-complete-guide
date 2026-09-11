import { ExternalLink } from '@/components/ExternalLink';
import {
  challenges,
  chapters,
  collectibles,
  completionRequirements,
  compendium,
  missions,
  treasures,
} from '@/data';

export default function AboutPage() {
  const researched = missions.filter((m) => m.research.verificationStatus !== 'unresearched').length;
  return (
    <main className="page stack">
      <h1>About</h1>
      <p>
        This is an unofficial fan-made companion application and is not affiliated with, endorsed by, or
        associated with Rockstar Games or Take-Two Interactive.
      </p>
      <p>
        Red Dead Redemption, Red Dead Redemption 2, and related names, characters, locations and properties
        belong to their respective rights holders.
      </p>
      <h2>Sources & Attribution</h2>
      <p>
        This companion guide was created using independent research and publicly available reference material.
        The Red Dead Wiki is an important reference used during the research and verification of mission,
        character, location, treasure and progression information. Where practical, individual guide entries
        include links to their relevant source pages.
      </p>
      <p>
        Additional facts may be verified using official game material, direct gameplay observation and other
        reputable guide sources.
      </p>
      <p>
        This project is independent and is not affiliated with or endorsed by Rockstar Games, Take-Two
        Interactive, Fandom, or the maintainers of the Red Dead Wiki.
      </p>
      <p>
        <ExternalLink href="https://reddead.fandom.com/wiki/Red_Dead_Wiki">↗ Red Dead Wiki</ExternalLink>
      </p>
      <h2>Map artwork</h2>
      <p>
        The world map image is in-game artwork owned by Rockstar Games / Take-Two Interactive. A copy hosted
        on the Red Dead Wiki is stored locally so the map works offline. The Wiki file page does not carry a
        redistribution license; this project includes it as a non-commercial fan work. Rockstar’s published
        statement on fan projects is not a license. The image can be replaced without changing marker data.
      </p>
      <h2>License</h2>
      <p>
        Application source code and original project assets are licensed under the MIT License. That license
        does not cover Rockstar, Take-Two, Fandom, or other third-party material.
      </p>
      <h2>Research status</h2>
      <p>
        Map pins come from the public-domain (Unlicense){' '}
        <ExternalLink href="https://github.com/jeanropke/RDOMap">↗ jeanropke/RDOMap</ExternalLink> dataset, not from
        commercial map sites. Coordinates are game-extracted data, like the in-game map image, fitted onto this
        project’s tile crop.
      </p>
      <p>
        {chapters.length} chapters, {missions.length} mission records ({researched} researched),{' '}
        {treasures.length} treasure chains, {collectibles.length} collectibles, {challenges.length}{' '}
        challenge trees, {compendium.length} compendium entries, and{' '}
        {completionRequirements.filter((r) => r.countsToward100).length} official 100% criteria.
        Missions that have no Gold Medal list on the Red Dead Wiki are left without gold requirements.
      </p>
      <h2>Android</h2>
      <p>
        Application ID <code>io.github.victorjnr.rdr2guide</code>. Sideload APKs, when published, are attached to
        GitHub Releases rather than committed in git. This is not a Play Store listing. Updates must use the same
        signing keystore.
      </p>
      <p>
        <ExternalLink href="https://github.com/Victor-Jnr/rdr2-complete-guide/releases">↗ GitHub Releases</ExternalLink>
      </p>
      <p>Version 0.5.3</p>
    </main>
  );
}
