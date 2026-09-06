import { ExternalLink } from '@/components/ExternalLink';
import { chapters, missions, treasures } from '@/data';

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
        {chapters.length} chapters, {missions.length} mission records ({researched} researched),{' '}
        {treasures.length} treasure chains. Later chapters currently list titles and structure; Gold Medal
        and missable detail is filled in for Chapter 1–2 story missions. Collectibles, challenges, the
        compendium, and the 100% Total Completion list are modelled in the data layer but not researched yet.
      </p>
      <p>Version 0.1.0</p>
    </main>
  );
}
