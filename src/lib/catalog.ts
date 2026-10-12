export type BodyId =
  | "sun"
  | "mdm"
  | "idol"
  | "hut"
  | "after-hours"
  | "bbtm"
  | "starboy"
  | "kiss-land"
  | "dawn-fm"
  | "trilogy";

export type Track = {
  title: string;
  search: string;
};

export type PbrProfile = {
  base: string;
  detail: string;
  emission: string;
  roughness: number;
  metalness: number;
  emissionIntensity: number;
  clearcoat: number;
  clearcoatRoughness: number;
  transmission: number;
  thickness: number;
  sheen: number;
  sheenColor: string;
  ior: number;
};

export type CelestialBody = {
  id: BodyId;
  name: string;
  planet: string;
  year: string;
  radius: number;
  distance: number;
  orbitalSpeed: number;
  rotationSpeed: number;
  tilt: number;
  cover: string;
  description: string;
  about: string;
  facts: string[];
  tracks: Track[];
  pbr: PbrProfile;
  hasRings?: boolean;
  ringInner?: number;
  ringOuter?: number;
  bpm: number;
  eraRgb: string;
};

const w = (title: string): Track => ({
  title,
  search: `The Weeknd ${title}`,
});

export function albumQuery(name: string, id: BodyId) {
  if (id === "trilogy") return "The Weeknd Trilogy";
  if (id === "idol") return "The Weeknd The Idol";
  if (id === "sun") return "The Weeknd";
  return `The Weeknd ${name}`;
}

export function soundcloudUrl(title: string, permalink?: string | null) {
  if (permalink) return permalink;
  return `https://soundcloud.com/search/sounds?q=${encodeURIComponent(`The Weeknd ${title}`)}`;
}

export const SUN: CelestialBody = {
  id: "sun",
  name: "The Weeknd",
  planet: "XO",
  year: "2010 —",
  radius: 4.4,
  distance: 0,
  orbitalSpeed: 0,
  rotationSpeed: 0.12,
  tilt: 0,
  cover: "/covers/xo.jpg",
  description:
    "The gravitational center. Abel Tesfaye — the voice that pulled a generation from the dark into the light.",
  about:
    "Every era in this system is a body caught in his orbit. From the frozen mixtape nights to the amber of Hurry Up Tomorrow, the catalog is a solar system: nine atmospheres, one gravity well.",
  facts: [
    "A G-type star: core near 15 million °C, surface around 5,500 °C. The light you see left eight minutes ago.",
    "It holds 99.8% of the solar system’s mass — every planet here is just weather caught in that gravity.",
    "XO is the mark at the center: not an album, the house that the nine eras orbit.",
    "The character ends on Earth. The voice that started on Pluto never left the well.",
  ],
  tracks: [
    w("High for This"),
    w("Wicked Games"),
    w("The Hills"),
    w("Can't Feel My Face"),
    w("Starboy"),
    w("Die For You"),
    w("Call Out My Name"),
    w("Blinding Lights"),
    w("Save Your Tears"),
    w("Take My Breath"),
    w("Popular"),
    w("Timeless"),
  ],
  pbr: {
    base: "#7a0b0b",
    detail: "#ff2a2a",
    emission: "#ff1a1a",
    roughness: 0.28,
    metalness: 0.12,
    emissionIntensity: 2.8,
    clearcoat: 0,
    clearcoatRoughness: 0.4,
    transmission: 0,
    thickness: 0,
    sheen: 0,
    sheenColor: "#000000",
    ior: 1.5,
  },
  bpm: 118,
  eraRgb: "255, 48, 32",
};

export const PLANETS: CelestialBody[] = [
  {
    id: "mdm",
    name: "My Dear Melancholy,",
    planet: "Mercury",
    year: "2018",
    radius: 1.2,
    distance: 10.4,
    orbitalSpeed: 3.6,
    rotationSpeed: 0.22,
    tilt: 0.03,
    cover: "/covers/mdm.jpg",
    description:
      "A short, cratered EP — scorched because it sits closest to the flame.",
    about:
      "Six tracks, twenty-one minutes, no atmosphere left to hide in. Call Out My Name is a dry scream across a rust planet: matte, abrasive, zero reflectivity. Heartbreak as geology.",
    facts: [
      "Closest world to the Sun. A year is 88 Earth days — the fastest lap in the system.",
      "Almost no atmosphere, so the ground swings from 430°C in daylight to −180°C at night.",
      "Named for the Roman messenger: smallest planet, always nearest the fire.",
      "Matches the EP: six tracks, nowhere to hide, scorched and over before the orbit cools.",
    ],
    tracks: [
      w("Call Out My Name"),
      w("Try Me"),
      w("Wasted Times"),
      w("I Was Never There"),
      w("Hurt You"),
      w("Privilege"),
    ],
    pbr: {
      base: "#4a1a0a",
      detail: "#ff6a22",
      emission: "#ff4a12",
      roughness: 0.55,
      metalness: 0.18,
      emissionIntensity: 0.95,
      clearcoat: 0.15,
      clearcoatRoughness: 0.55,
      transmission: 0,
      thickness: 0,
      sheen: 0.25,
      sheenColor: "#ff6a22",
      ior: 1.5,
    },
    bpm: 74,
    eraRgb: "255, 106, 34",
  },
  {
    id: "idol",
    name: "The Idol Soundtrack",
    planet: "Venus",
    year: "2023",
    radius: 1.65,
    distance: 14.6,
    orbitalSpeed: 1.55,
    rotationSpeed: -0.08,
    tilt: 177,
    cover: "/covers/the-idol.jpg",
    description:
      "Named for love and seduction. Under the gloss, a toxic pressure cooker.",
    about:
      "Hollywood glamour as a high-clearcoat shell — velvet purple, sleaze violet atmosphere, completely impenetrable. Popular, One of the Girls, Double Fantasy: beauty that suffocates.",
    facts: [
      "Hottest planet in the solar system — a CO₂ greenhouse that outburns Mercury.",
      "Spins backwards, and slower than it orbits: a day on Venus is longer than its year.",
      "Named for the goddess of love. The clouds are sulfuric; the pressure would crush a submarine.",
      "The Idol era: a high-gloss shell over a toxic atmosphere. Beauty that does not let you leave.",
    ],
    tracks: [
      w("Double Fantasy"),
      w("Popular"),
      w("Family"),
      w("False Idols"),
      w("Take Me Back"),
      w("A Lesser Man"),
      w("Like A God"),
      w("Fill The Void"),
      w("One of the Girls"),
    ],
    pbr: {
      base: "#3a0060",
      detail: "#d46bff",
      emission: "#c44cff",
      roughness: 0.22,
      metalness: 0.42,
      emissionIntensity: 1.15,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      transmission: 0,
      thickness: 0,
      sheen: 0.55,
      sheenColor: "#d46bff",
      ior: 1.7,
    },
    bpm: 100,
    eraRgb: "212, 107, 255",
  },
  {
    id: "hut",
    name: "Hurry Up Tomorrow",
    planet: "Earth",
    year: "2025",
    radius: 1.8,
    distance: 19.2,
    orbitalSpeed: 1,
    rotationSpeed: 0.9,
    tilt: 23.4,
    cover: "/covers/hurry-up-tomorrow.jpg",
    description:
      "The amber sunrise of coming home. Warm, grounded, finally awake.",
    about:
      "After the outer dark, a living world. Mixed roughness, a glowing yellow-orange rim — the sun coming up. Wake Me Up, São Paulo, Timeless, Hurry Up Tomorrow: the last dawn of the character.",
    facts: [
      "The only world known to hold liquid water and life. 71% ocean, one large moon.",
      "Tilted 23.4° — that lean is why we have seasons, and why every sunrise looks different.",
      "From anywhere else in this system, Earth is the amber planet: home, after the night.",
      "Hurry Up Tomorrow is the last dawn of the character. The orbit finally comes home.",
    ],
    tracks: [
      w("Wake Me Up"),
      w("Cry For Me"),
      w("I Can't Fucking Sing"),
      w("São Paulo"),
      w("Until We're Skin & Bones"),
      w("Baptized In Fear"),
      w("Open Hearts"),
      w("Opening Night"),
      w("Reflections Laughing"),
      w("Enjoy The Show"),
      w("Given Up On Me"),
      w("I Can't Wait To Get There"),
      w("Timeless"),
      w("Niagara Falls"),
      w("Take Me Back To LA"),
      w("Big Sleep"),
      w("Give Me Mercy"),
      w("Drive"),
      w("The Abyss"),
      w("Red Terror"),
      w("Without a Warning"),
      w("Hurry Up Tomorrow"),
    ],
    pbr: {
      base: "#E55B13",
      detail: "#ffe27a",
      emission: "#ffc84b",
      roughness: 0.38,
      metalness: 0.12,
      emissionIntensity: 1.05,
      clearcoat: 0.22,
      clearcoatRoughness: 0.4,
      transmission: 0,
      thickness: 0,
      sheen: 0.3,
      sheenColor: "#ffe27a",
      ior: 1.5,
    },
    bpm: 104,
    eraRgb: "255, 200, 75",
  },
  {
    id: "after-hours",
    name: "After Hours",
    planet: "Mars",
    year: "2020",
    radius: 1.4,
    distance: 24.2,
    orbitalSpeed: 0.53,
    rotationSpeed: 0.88,
    tilt: 25.2,
    cover: "/covers/after-hours.jpg",
    description:
      "The red planet. Dust, blood, and a Vegas night that never ended.",
    about:
      "Dried blood base, Vegas-red dust, a chaotic sandstorm with a red Fresnel rim. Blinding Lights through Until I Bleed Out — the most violent, cinematic bender in the catalog.",
    facts: [
      "The red planet — iron-oxide dust, like dried blood across an entire world.",
      "Olympus Mons is the tallest volcano in the solar system, nearly three times Everest.",
      "A day is 24.6 hours; a year is 687 Earth days of long, cold nights.",
      "After Hours is that night stretched: red neon, a bender that does not end at dawn.",
    ],
    tracks: [
      w("Alone Again"),
      w("Too Late"),
      w("Hardest To Love"),
      w("Scared To Live"),
      w("Snowchild"),
      w("Escape From LA"),
      w("Heartless"),
      w("Faith"),
      w("Blinding Lights"),
      w("In Your Eyes"),
      w("Save Your Tears"),
      w("Repeat After Me (Interlude)"),
      w("After Hours"),
      w("Until I Bleed Out"),
      w("Nothing Compares"),
      w("Missed You"),
      w("Final Lullaby"),
    ],
    pbr: {
      base: "#6a0e04",
      detail: "#ff2a22",
      emission: "#ff1e18",
      roughness: 0.48,
      metalness: 0.12,
      emissionIntensity: 1.2,
      clearcoat: 0.08,
      clearcoatRoughness: 0.6,
      transmission: 0,
      thickness: 0,
      sheen: 0.22,
      sheenColor: "#ff2a22",
      ior: 1.5,
    },
    bpm: 171,
    eraRgb: "255, 42, 34",
  },
  {
    id: "bbtm",
    name: "Beauty Behind the Madness",
    planet: "Jupiter",
    year: "2015",
    radius: 3.5,
    distance: 32,
    orbitalSpeed: 0.09,
    rotationSpeed: 2.1,
    tilt: 3.1,
    cover: "/covers/bbtm.jpg",
    description:
      "The explosion. A gas giant of sepia gold — underground no longer.",
    about:
      "The Hills, Can't Feel My Face, Earned It. Horizontal storm bands in sepia and dusty brown: the moment a secret became a weather system the whole world felt.",
    facts: [
      "The giant: more mass than every other planet combined. A failed star that still runs the weather.",
      "The Great Red Spot is a storm older than the United States — a wound that never closes.",
      "A day is under 10 hours. That spin stretches the clouds into stripes you can see from Earth.",
      "BBTM is that explosion: the underground becoming a system the whole world felt.",
    ],
    tracks: [
      w("Real Life"),
      w("Losers"),
      w("Tell Your Friends"),
      w("Often"),
      w("The Hills"),
      w("Acquainted"),
      w("Can't Feel My Face"),
      w("Shameless"),
      w("Earned It"),
      w("In the Night"),
      w("As You Are"),
      w("Dark Times"),
      w("Prisoner"),
      w("Angel"),
    ],
    pbr: {
      base: "#C7A775",
      detail: "#ffe0a0",
      emission: "#ffd078",
      roughness: 0.42,
      metalness: 0.18,
      emissionIntensity: 0.72,
      clearcoat: 0.18,
      clearcoatRoughness: 0.45,
      transmission: 0,
      thickness: 0,
      sheen: 0.28,
      sheenColor: "#ffe0a0",
      ior: 1.4,
    },
    hasRings: true,
    ringInner: 1.28,
    ringOuter: 1.82,
    bpm: 112,
    eraRgb: "255, 208, 120",
  },
  {
    id: "starboy",
    name: "Starboy",
    planet: "Saturn",
    year: "2016",
    radius: 3.1,
    distance: 44,
    orbitalSpeed: 0.038,
    rotationSpeed: 1.9,
    tilt: 26.7,
    cover: "/covers/starboy.jpg",
    description:
      "The show-off. Polished like a sports car, wearing a neon-pink ring.",
    about:
      "Midnight sky metal, electric pink emission, roughness near zero. Starboy, Party Monster, Die For You, I Feel It Coming — the rockstar year, rendered as chrome and a glowing ring.",
    facts: [
      "The showpiece: a ring system 280,000 km across, ice and rock catching the sun.",
      "Less dense than water — in a bath big enough, Saturn would float.",
      "A hexagonal storm sits on the north pole. 146 known moons, including Titan.",
      "Starboy is that ring: chrome, neon pink, the year the character went supernova.",
    ],
    tracks: [
      w("Starboy"),
      w("Party Monster"),
      w("False Alarm"),
      w("Reminder"),
      w("Rockin'"),
      w("Secrets"),
      w("True Colors"),
      w("Stargirl Interlude"),
      w("Sidewalks"),
      w("Six Feet Under"),
      w("Love To Lay"),
      w("A Lonely Night"),
      w("Attention"),
      w("Ordinary Life"),
      w("Nothing Without You"),
      w("All I Know"),
      w("Die For You"),
      w("I Feel It Coming"),
    ],
    pbr: {
      base: "#0D0F12",
      detail: "#ff2f8a",
      emission: "#ff1f7a",
      roughness: 0.08,
      metalness: 0.85,
      emissionIntensity: 1.35,
      clearcoat: 0.8,
      clearcoatRoughness: 0.06,
      transmission: 0,
      thickness: 0,
      sheen: 0.15,
      sheenColor: "#ff2f8a",
      ior: 1.8,
    },
    hasRings: true,
    ringInner: 1.28,
    ringOuter: 1.95,
    bpm: 186,
    eraRgb: "255, 47, 138",
  },
  {
    id: "kiss-land",
    name: "Kiss Land",
    planet: "Uranus",
    year: "2013",
    radius: 2.2,
    distance: 55.5,
    orbitalSpeed: 0.014,
    rotationSpeed: -1.2,
    tilt: 97.8,
    cover: "/covers/kiss-land.jpg",
    description:
      "Toxic gas, spinning on its side. Neon-green cyberpunk, deeply alien.",
    about:
      "The first full-length: Tokyo as a fever. Low roughness, radioactive emission, synthetic atmosphere. Professional through Tears in the Rain — love as a theme park that kills you.",
    facts: [
      "Tilted 98° — it rolls on its side, so a season here lasts 21 Earth years.",
      "Coldest planetary atmosphere in the system, down to −224°C.",
      "Methane in the haze makes it cyan. Faint rings were found in 1977, by accident.",
      "Kiss Land is that sideways world: Tokyo as a fever, love as a park that kills you.",
    ],
    tracks: [
      w("Professional"),
      w("The Town"),
      w("Adaptation"),
      w("Love in the Sky"),
      w("Belong to the World"),
      w("Live For"),
      w("Wanderlust"),
      w("Kiss Land"),
      w("Pretty"),
      w("Tears in the Rain"),
      w("Odd Look"),
    ],
    pbr: {
      base: "#0d3d2a",
      detail: "#3dff9a",
      emission: "#2dff88",
      roughness: 0.14,
      metalness: 0.28,
      emissionIntensity: 1.55,
      clearcoat: 0.35,
      clearcoatRoughness: 0.18,
      transmission: 0.04,
      thickness: 0.5,
      sheen: 0.35,
      sheenColor: "#3dff9a",
      ior: 1.35,
    },
    hasRings: true,
    ringInner: 1.38,
    ringOuter: 1.82,
    bpm: 122,
    eraRgb: "61, 255, 154",
  },
  {
    id: "dawn-fm",
    name: "Dawn FM",
    planet: "Neptune",
    year: "2022",
    radius: 2.1,
    distance: 64.5,
    orbitalSpeed: 0.007,
    rotationSpeed: 1.35,
    tilt: 28.3,
    cover: "/covers/dawn-fm.jpg",
    description:
      "Purgatory radio. Translucent ice, lit from the inside, 103.5.",
    about:
      "Deep ocean dark with synthetic ice-blue emission. High transmission — a freezing gas, suspended. Gasoline, Take My Breath, Out of Time, Less Than Zero: the waiting room after the crash.",
    facts: [
      "The farthest true planet. Sunlight takes more than four hours to arrive.",
      "Fastest winds in the system — up to 2,000 km/h, a deep-blue fury.",
      "Found with math in 1846, before anyone saw it. A year lasts 165 Earth years.",
      "Dawn FM is that waiting room: ice-blue radio, 103.5, after the crash and before the dawn.",
    ],
    tracks: [
      w("Dawn FM"),
      w("Gasoline"),
      w("How Do I Make You Love Me?"),
      w("Take My Breath"),
      w("Sacrifice"),
      w("A Tale by Quincy"),
      w("Out of Time"),
      w("Here We Go… Again"),
      w("Best Friends"),
      w("Is There Someone Else?"),
      w("Starry Eyes"),
      w("Every Angel Is Terrifying"),
      w("Don't Break My Heart"),
      w("I Heard You're Married"),
      w("Less Than Zero"),
      w("Phantom Regret by Jim"),
    ],
    pbr: {
      base: "#063a58",
      detail: "#5ad6ff",
      emission: "#3ec8ff",
      roughness: 0.12,
      metalness: 0.1,
      emissionIntensity: 1.4,
      clearcoat: 0.4,
      clearcoatRoughness: 0.16,
      transmission: 0.12,
      thickness: 1.2,
      sheen: 0.4,
      sheenColor: "#5ad6ff",
      ior: 1.28,
    },
    hasRings: true,
    ringInner: 1.48,
    ringOuter: 2.05,
    bpm: 117,
    eraRgb: "90, 214, 255",
  },
  {
    id: "trilogy",
    name: "The Mixtapes / Trilogy",
    planet: "Pluto",
    year: "2011–12",
    radius: 1.4,
    distance: 73.5,
    orbitalSpeed: 0.004,
    rotationSpeed: 0.45,
    tilt: 15,
    cover: "/covers/trilogy.jpg",
    description:
      "The cold beginning. A light-absorbing rock on the darkest fringe.",
    about:
      "House of Balloons, Thursday, Echoes of Silence — compacted into one distant body. Void black, cold ash ice, roughness 0.9, zero emission. The underground, before the orbit went mainstream.",
    facts: [
      "Reclassified as a dwarf planet in 2006 — still the original outer dark.",
      "Tombaugh Regio is a heart-shaped nitrogen glacier roughly the size of Texas.",
      "A day lasts 6.4 Earth days. Charon is so large they orbit a common center.",
      "Trilogy is that fringe: House of Balloons, Thursday, Echoes of Silence — before the orbit went mainstream.",
    ],
    tracks: [
      w("High for This"),
      w("What You Need"),
      w("House of Balloons / Glass Table Girls"),
      w("The Morning"),
      w("Wicked Games"),
      w("The Party & The After Party"),
      w("Coming Down"),
      w("Loft Music"),
      w("The Knowing"),
      w("Twenty Eight"),
      w("Lonely Star"),
      w("Life of the Party"),
      w("Thursday"),
      w("The Zone"),
      w("The Birds Pt. 1"),
      w("The Birds Pt. 2"),
      w("Gone"),
      w("Rolling Stone"),
      w("Heaven or Las Vegas"),
      w("Valerie"),
      w("D.D."),
      w("Montreal"),
      w("Outside"),
      w("XO / The Host"),
      w("Initiation"),
      w("Same Old Song"),
      w("The Fall"),
      w("Next"),
      w("Echoes of Silence"),
      w("Till Dawn (Here Comes the Sun)"),
    ],
    pbr: {
      base: "#070d12",
      detail: "#9ad8ff",
      emission: "#7ecfff",
      roughness: 0.55,
      metalness: 0.2,
      emissionIntensity: 0.85,
      clearcoat: 0.12,
      clearcoatRoughness: 0.5,
      transmission: 0,
      thickness: 0,
      sheen: 0.2,
      sheenColor: "#9ad8ff",
      ior: 1.5,
    },
    bpm: 88,
    eraRgb: "154, 216, 255",
  },
];

export const BODIES: CelestialBody[] = [SUN, ...PLANETS];

export function bodyById(id: BodyId | null): CelestialBody | null {
  if (!id) return null;
  return BODIES.find((b) => b.id === id) ?? null;
}

export const CAROUSEL: { id: BodyId; cover: string; rgb: string; label: string }[] = [
  { id: "trilogy", cover: "/covers/trilogy.jpg", rgb: "154, 216, 255", label: "Trilogy" },
  { id: "kiss-land", cover: "/covers/kiss-land.jpg", rgb: "61, 255, 154", label: "Kiss Land" },
  { id: "bbtm", cover: "/covers/bbtm.jpg", rgb: "255, 208, 120", label: "BBTM" },
  { id: "starboy", cover: "/covers/starboy.jpg", rgb: "255, 47, 138", label: "Starboy" },
  { id: "mdm", cover: "/covers/mdm.jpg", rgb: "255, 106, 34", label: "MDM" },
  { id: "after-hours", cover: "/covers/after-hours.jpg", rgb: "255, 42, 34", label: "After Hours" },
  { id: "dawn-fm", cover: "/covers/dawn-fm.jpg", rgb: "90, 214, 255", label: "Dawn FM" },
  { id: "idol", cover: "/covers/the-idol.jpg", rgb: "212, 107, 255", label: "The Idol" },
  { id: "hut", cover: "/covers/hurry-up-tomorrow.jpg", rgb: "255, 200, 75", label: "HUT" },
  { id: "sun", cover: "/covers/xo.jpg", rgb: "255, 48, 32", label: "XO" },
];
