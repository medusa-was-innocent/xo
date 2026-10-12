import { i as __toESM } from "../_runtime.mjs";
import { G as require_jsx_runtime, K as require_react } from "../_libs/@react-three/drei+[...].mjs";
import { _ as createFileRoute, d as Scripts, f as HeadContent, g as lazyRouteComponent, h as Outlet, m as createRouter, v as createRootRoute, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as TriangleAlert } from "../_libs/lucide-react.mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/catalog-PENDd2Ua.js
var w = (title) => ({
	title,
	search: `The Weeknd ${title}`
});
function albumQuery(name, id) {
	if (id === "trilogy") return "The Weeknd Trilogy";
	if (id === "idol") return "The Weeknd The Idol";
	if (id === "sun") return "The Weeknd";
	return `The Weeknd ${name}`;
}
function soundcloudUrl(title, permalink) {
	if (permalink) return permalink;
	return `https://soundcloud.com/search/sounds?q=${encodeURIComponent(`The Weeknd ${title}`)}`;
}
var SUN = {
	id: "sun",
	name: "The Weeknd",
	planet: "XO",
	year: "2010 —",
	radius: 4.4,
	distance: 0,
	orbitalSpeed: 0,
	rotationSpeed: .12,
	tilt: 0,
	cover: "/covers/xo.jpg",
	description: "The gravitational center. Abel Tesfaye — the voice that pulled a generation from the dark into the light.",
	about: "Every era in this system is a body caught in his orbit. From the frozen mixtape nights to the amber of Hurry Up Tomorrow, the catalog is a solar system: nine atmospheres, one gravity well.",
	facts: [
		"A G-type star: core near 15 million °C, surface around 5,500 °C. The light you see left eight minutes ago.",
		"It holds 99.8% of the solar system’s mass — every planet here is just weather caught in that gravity.",
		"XO is the mark at the center: not an album, the house that the nine eras orbit.",
		"The character ends on Earth. The voice that started on Pluto never left the well."
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
		w("Timeless")
	],
	pbr: {
		base: "#7a0b0b",
		detail: "#ff2a2a",
		emission: "#ff1a1a",
		roughness: .28,
		metalness: .12,
		emissionIntensity: 2.8,
		clearcoat: 0,
		clearcoatRoughness: .4,
		transmission: 0,
		thickness: 0,
		sheen: 0,
		sheenColor: "#000000",
		ior: 1.5
	},
	bpm: 118,
	eraRgb: "255, 48, 32"
};
var PLANETS = [
	{
		id: "mdm",
		name: "My Dear Melancholy,",
		planet: "Mercury",
		year: "2018",
		radius: 1.2,
		distance: 10.4,
		orbitalSpeed: 3.6,
		rotationSpeed: .22,
		tilt: .03,
		cover: "/covers/mdm.jpg",
		description: "A short, cratered EP — scorched because it sits closest to the flame.",
		about: "Six tracks, twenty-one minutes, no atmosphere left to hide in. Call Out My Name is a dry scream across a rust planet: matte, abrasive, zero reflectivity. Heartbreak as geology.",
		facts: [
			"Closest world to the Sun. A year is 88 Earth days — the fastest lap in the system.",
			"Almost no atmosphere, so the ground swings from 430°C in daylight to −180°C at night.",
			"Named for the Roman messenger: smallest planet, always nearest the fire.",
			"Matches the EP: six tracks, nowhere to hide, scorched and over before the orbit cools."
		],
		tracks: [
			w("Call Out My Name"),
			w("Try Me"),
			w("Wasted Times"),
			w("I Was Never There"),
			w("Hurt You"),
			w("Privilege")
		],
		pbr: {
			base: "#4a1a0a",
			detail: "#ff6a22",
			emission: "#ff4a12",
			roughness: .55,
			metalness: .18,
			emissionIntensity: .95,
			clearcoat: .15,
			clearcoatRoughness: .55,
			transmission: 0,
			thickness: 0,
			sheen: .25,
			sheenColor: "#ff6a22",
			ior: 1.5
		},
		bpm: 74,
		eraRgb: "255, 106, 34"
	},
	{
		id: "idol",
		name: "The Idol Soundtrack",
		planet: "Venus",
		year: "2023",
		radius: 1.65,
		distance: 14.6,
		orbitalSpeed: 1.55,
		rotationSpeed: -.08,
		tilt: 177,
		cover: "/covers/the-idol.jpg",
		description: "Named for love and seduction. Under the gloss, a toxic pressure cooker.",
		about: "Hollywood glamour as a high-clearcoat shell — velvet purple, sleaze violet atmosphere, completely impenetrable. Popular, One of the Girls, Double Fantasy: beauty that suffocates.",
		facts: [
			"Hottest planet in the solar system — a CO₂ greenhouse that outburns Mercury.",
			"Spins backwards, and slower than it orbits: a day on Venus is longer than its year.",
			"Named for the goddess of love. The clouds are sulfuric; the pressure would crush a submarine.",
			"The Idol era: a high-gloss shell over a toxic atmosphere. Beauty that does not let you leave."
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
			w("One of the Girls")
		],
		pbr: {
			base: "#3a0060",
			detail: "#d46bff",
			emission: "#c44cff",
			roughness: .22,
			metalness: .42,
			emissionIntensity: 1.15,
			clearcoat: 1,
			clearcoatRoughness: .1,
			transmission: 0,
			thickness: 0,
			sheen: .55,
			sheenColor: "#d46bff",
			ior: 1.7
		},
		bpm: 100,
		eraRgb: "212, 107, 255"
	},
	{
		id: "hut",
		name: "Hurry Up Tomorrow",
		planet: "Earth",
		year: "2025",
		radius: 1.8,
		distance: 19.2,
		orbitalSpeed: 1,
		rotationSpeed: .9,
		tilt: 23.4,
		cover: "/covers/hurry-up-tomorrow.jpg",
		description: "The amber sunrise of coming home. Warm, grounded, finally awake.",
		about: "After the outer dark, a living world. Mixed roughness, a glowing yellow-orange rim — the sun coming up. Wake Me Up, São Paulo, Timeless, Hurry Up Tomorrow: the last dawn of the character.",
		facts: [
			"The only world known to hold liquid water and life. 71% ocean, one large moon.",
			"Tilted 23.4° — that lean is why we have seasons, and why every sunrise looks different.",
			"From anywhere else in this system, Earth is the amber planet: home, after the night.",
			"Hurry Up Tomorrow is the last dawn of the character. The orbit finally comes home."
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
			w("Hurry Up Tomorrow")
		],
		pbr: {
			base: "#E55B13",
			detail: "#ffe27a",
			emission: "#ffc84b",
			roughness: .38,
			metalness: .12,
			emissionIntensity: 1.05,
			clearcoat: .22,
			clearcoatRoughness: .4,
			transmission: 0,
			thickness: 0,
			sheen: .3,
			sheenColor: "#ffe27a",
			ior: 1.5
		},
		bpm: 104,
		eraRgb: "255, 200, 75"
	},
	{
		id: "after-hours",
		name: "After Hours",
		planet: "Mars",
		year: "2020",
		radius: 1.4,
		distance: 24.2,
		orbitalSpeed: .53,
		rotationSpeed: .88,
		tilt: 25.2,
		cover: "/covers/after-hours.jpg",
		description: "The red planet. Dust, blood, and a Vegas night that never ended.",
		about: "Dried blood base, Vegas-red dust, a chaotic sandstorm with a red Fresnel rim. Blinding Lights through Until I Bleed Out — the most violent, cinematic bender in the catalog.",
		facts: [
			"The red planet — iron-oxide dust, like dried blood across an entire world.",
			"Olympus Mons is the tallest volcano in the solar system, nearly three times Everest.",
			"A day is 24.6 hours; a year is 687 Earth days of long, cold nights.",
			"After Hours is that night stretched: red neon, a bender that does not end at dawn."
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
			w("Final Lullaby")
		],
		pbr: {
			base: "#6a0e04",
			detail: "#ff2a22",
			emission: "#ff1e18",
			roughness: .48,
			metalness: .12,
			emissionIntensity: 1.2,
			clearcoat: .08,
			clearcoatRoughness: .6,
			transmission: 0,
			thickness: 0,
			sheen: .22,
			sheenColor: "#ff2a22",
			ior: 1.5
		},
		bpm: 171,
		eraRgb: "255, 42, 34"
	},
	{
		id: "bbtm",
		name: "Beauty Behind the Madness",
		planet: "Jupiter",
		year: "2015",
		radius: 3.5,
		distance: 32,
		orbitalSpeed: .09,
		rotationSpeed: 2.1,
		tilt: 3.1,
		cover: "/covers/bbtm.jpg",
		description: "The explosion. A gas giant of sepia gold — underground no longer.",
		about: "The Hills, Can't Feel My Face, Earned It. Horizontal storm bands in sepia and dusty brown: the moment a secret became a weather system the whole world felt.",
		facts: [
			"The giant: more mass than every other planet combined. A failed star that still runs the weather.",
			"The Great Red Spot is a storm older than the United States — a wound that never closes.",
			"A day is under 10 hours. That spin stretches the clouds into stripes you can see from Earth.",
			"BBTM is that explosion: the underground becoming a system the whole world felt."
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
			w("Angel")
		],
		pbr: {
			base: "#C7A775",
			detail: "#ffe0a0",
			emission: "#ffd078",
			roughness: .42,
			metalness: .18,
			emissionIntensity: .72,
			clearcoat: .18,
			clearcoatRoughness: .45,
			transmission: 0,
			thickness: 0,
			sheen: .28,
			sheenColor: "#ffe0a0",
			ior: 1.4
		},
		hasRings: true,
		ringInner: 1.28,
		ringOuter: 1.82,
		bpm: 112,
		eraRgb: "255, 208, 120"
	},
	{
		id: "starboy",
		name: "Starboy",
		planet: "Saturn",
		year: "2016",
		radius: 3.1,
		distance: 44,
		orbitalSpeed: .038,
		rotationSpeed: 1.9,
		tilt: 26.7,
		cover: "/covers/starboy.jpg",
		description: "The show-off. Polished like a sports car, wearing a neon-pink ring.",
		about: "Midnight sky metal, electric pink emission, roughness near zero. Starboy, Party Monster, Die For You, I Feel It Coming — the rockstar year, rendered as chrome and a glowing ring.",
		facts: [
			"The showpiece: a ring system 280,000 km across, ice and rock catching the sun.",
			"Less dense than water — in a bath big enough, Saturn would float.",
			"A hexagonal storm sits on the north pole. 146 known moons, including Titan.",
			"Starboy is that ring: chrome, neon pink, the year the character went supernova."
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
			w("I Feel It Coming")
		],
		pbr: {
			base: "#0D0F12",
			detail: "#ff2f8a",
			emission: "#ff1f7a",
			roughness: .08,
			metalness: .85,
			emissionIntensity: 1.35,
			clearcoat: .8,
			clearcoatRoughness: .06,
			transmission: 0,
			thickness: 0,
			sheen: .15,
			sheenColor: "#ff2f8a",
			ior: 1.8
		},
		hasRings: true,
		ringInner: 1.28,
		ringOuter: 1.95,
		bpm: 186,
		eraRgb: "255, 47, 138"
	},
	{
		id: "kiss-land",
		name: "Kiss Land",
		planet: "Uranus",
		year: "2013",
		radius: 2.2,
		distance: 55.5,
		orbitalSpeed: .014,
		rotationSpeed: -1.2,
		tilt: 97.8,
		cover: "/covers/kiss-land.jpg",
		description: "Toxic gas, spinning on its side. Neon-green cyberpunk, deeply alien.",
		about: "The first full-length: Tokyo as a fever. Low roughness, radioactive emission, synthetic atmosphere. Professional through Tears in the Rain — love as a theme park that kills you.",
		facts: [
			"Tilted 98° — it rolls on its side, so a season here lasts 21 Earth years.",
			"Coldest planetary atmosphere in the system, down to −224°C.",
			"Methane in the haze makes it cyan. Faint rings were found in 1977, by accident.",
			"Kiss Land is that sideways world: Tokyo as a fever, love as a park that kills you."
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
			w("Odd Look")
		],
		pbr: {
			base: "#0d3d2a",
			detail: "#3dff9a",
			emission: "#2dff88",
			roughness: .14,
			metalness: .28,
			emissionIntensity: 1.55,
			clearcoat: .35,
			clearcoatRoughness: .18,
			transmission: .04,
			thickness: .5,
			sheen: .35,
			sheenColor: "#3dff9a",
			ior: 1.35
		},
		hasRings: true,
		ringInner: 1.38,
		ringOuter: 1.82,
		bpm: 122,
		eraRgb: "61, 255, 154"
	},
	{
		id: "dawn-fm",
		name: "Dawn FM",
		planet: "Neptune",
		year: "2022",
		radius: 2.1,
		distance: 64.5,
		orbitalSpeed: .007,
		rotationSpeed: 1.35,
		tilt: 28.3,
		cover: "/covers/dawn-fm.jpg",
		description: "Purgatory radio. Translucent ice, lit from the inside, 103.5.",
		about: "Deep ocean dark with synthetic ice-blue emission. High transmission — a freezing gas, suspended. Gasoline, Take My Breath, Out of Time, Less Than Zero: the waiting room after the crash.",
		facts: [
			"The farthest true planet. Sunlight takes more than four hours to arrive.",
			"Fastest winds in the system — up to 2,000 km/h, a deep-blue fury.",
			"Found with math in 1846, before anyone saw it. A year lasts 165 Earth years.",
			"Dawn FM is that waiting room: ice-blue radio, 103.5, after the crash and before the dawn."
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
			w("Phantom Regret by Jim")
		],
		pbr: {
			base: "#063a58",
			detail: "#5ad6ff",
			emission: "#3ec8ff",
			roughness: .12,
			metalness: .1,
			emissionIntensity: 1.4,
			clearcoat: .4,
			clearcoatRoughness: .16,
			transmission: .12,
			thickness: 1.2,
			sheen: .4,
			sheenColor: "#5ad6ff",
			ior: 1.28
		},
		hasRings: true,
		ringInner: 1.48,
		ringOuter: 2.05,
		bpm: 117,
		eraRgb: "90, 214, 255"
	},
	{
		id: "trilogy",
		name: "The Mixtapes / Trilogy",
		planet: "Pluto",
		year: "2011–12",
		radius: 1.4,
		distance: 73.5,
		orbitalSpeed: .004,
		rotationSpeed: .45,
		tilt: 15,
		cover: "/covers/trilogy.jpg",
		description: "The cold beginning. A light-absorbing rock on the darkest fringe.",
		about: "House of Balloons, Thursday, Echoes of Silence — compacted into one distant body. Void black, cold ash ice, roughness 0.9, zero emission. The underground, before the orbit went mainstream.",
		facts: [
			"Reclassified as a dwarf planet in 2006 — still the original outer dark.",
			"Tombaugh Regio is a heart-shaped nitrogen glacier roughly the size of Texas.",
			"A day lasts 6.4 Earth days. Charon is so large they orbit a common center.",
			"Trilogy is that fringe: House of Balloons, Thursday, Echoes of Silence — before the orbit went mainstream."
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
			w("Till Dawn (Here Comes the Sun)")
		],
		pbr: {
			base: "#070d12",
			detail: "#9ad8ff",
			emission: "#7ecfff",
			roughness: .55,
			metalness: .2,
			emissionIntensity: .85,
			clearcoat: .12,
			clearcoatRoughness: .5,
			transmission: 0,
			thickness: 0,
			sheen: .2,
			sheenColor: "#9ad8ff",
			ior: 1.5
		},
		bpm: 88,
		eraRgb: "154, 216, 255"
	}
];
var BODIES = [SUN, ...PLANETS];
function bodyById(id) {
	if (!id) return null;
	return BODIES.find((b) => b.id === id) ?? null;
}
var CAROUSEL = [
	{
		id: "trilogy",
		cover: "/covers/trilogy.jpg",
		rgb: "154, 216, 255",
		label: "Trilogy"
	},
	{
		id: "kiss-land",
		cover: "/covers/kiss-land.jpg",
		rgb: "61, 255, 154",
		label: "Kiss Land"
	},
	{
		id: "bbtm",
		cover: "/covers/bbtm.jpg",
		rgb: "255, 208, 120",
		label: "BBTM"
	},
	{
		id: "starboy",
		cover: "/covers/starboy.jpg",
		rgb: "255, 47, 138",
		label: "Starboy"
	},
	{
		id: "mdm",
		cover: "/covers/mdm.jpg",
		rgb: "255, 106, 34",
		label: "MDM"
	},
	{
		id: "after-hours",
		cover: "/covers/after-hours.jpg",
		rgb: "255, 42, 34",
		label: "After Hours"
	},
	{
		id: "dawn-fm",
		cover: "/covers/dawn-fm.jpg",
		rgb: "90, 214, 255",
		label: "Dawn FM"
	},
	{
		id: "idol",
		cover: "/covers/the-idol.jpg",
		rgb: "212, 107, 255",
		label: "The Idol"
	},
	{
		id: "hut",
		cover: "/covers/hurry-up-tomorrow.jpg",
		rgb: "255, 200, 75",
		label: "HUT"
	},
	{
		id: "sun",
		cover: "/covers/xo.jpg",
		rgb: "255, 48, 32",
		label: "XO"
	}
];
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-CGpSkYs9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var styles_default = "/assets/styles-ZYUNSEet.css";
var APP_NAME = "XO Universe";
var Route$4 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, viewport-fit=cover"
			},
			{ title: APP_NAME },
			{
				name: "description",
				content: "Nine Weeknd eras as a living solar system. Drag, zoom, and play the catalog."
			},
			{
				name: "theme-color",
				content: "#070709"
			},
			{
				name: "referrer",
				content: "strict-origin-when-cross-origin"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,200;0,400;0,600;1,200&family=Manrope:wght@400;500;600;700&family=Oswald:wght@400;500;600;700&display=swap"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	})
});
var $$splitComponentImporter = () => import("./routes-ToyWMQR-.mjs").then((n) => n.t);
var Route$3 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
function allowed(host) {
	return host.endsWith("itunes.apple.com") || host.endsWith("mzstatic.com") || host.endsWith("apple.com");
}
var Route$2 = createFileRoute("/api/audio")({ server: { handlers: { GET: async ({ request }) => {
	const src = new URL(request.url).searchParams.get("src");
	if (!src) return new Response("missing src", { status: 400 });
	let url;
	try {
		url = new URL(src);
	} catch {
		return new Response("bad src", { status: 400 });
	}
	if (url.protocol !== "https:" || !allowed(url.hostname)) return new Response("forbidden", { status: 403 });
	const upstream = await fetch(url.toString(), {
		headers: { Accept: "audio/mpeg,audio/*,*/*" },
		redirect: "follow"
	});
	if (!upstream.ok) return new Response("upstream", { status: 502 });
	const buf = new Uint8Array(await upstream.arrayBuffer());
	const type = upstream.headers.get("content-type") || "audio/mpeg";
	const match = request.headers.get("range")?.match(/bytes=(\d+)-(\d*)/);
	if (match) {
		const start = Number(match[1]);
		const end = match[2] ? Number(match[2]) : buf.length - 1;
		if (start >= buf.length || end >= buf.length || start > end) return new Response(null, {
			status: 416,
			headers: { "Content-Range": `bytes */${buf.length}` }
		});
		const slice = buf.subarray(start, end + 1);
		return new Response(slice, {
			status: 206,
			headers: {
				"Content-Type": type,
				"Content-Length": String(slice.byteLength),
				"Content-Range": `bytes ${start}-${end}/${buf.length}`,
				"Accept-Ranges": "bytes",
				"Cache-Control": "public, max-age=86400"
			}
		});
	}
	return new Response(buf, {
		status: 200,
		headers: {
			"Content-Type": type,
			"Content-Length": String(buf.byteLength),
			"Accept-Ranges": "bytes",
			"Cache-Control": "public, max-age=86400"
		}
	});
} } } });
var LINES = {
	"High for This": ["you don't know what's in store but you know what you're here for", "let me make you high"],
	"What You Need": ["baby i can make it better", "i got what you need"],
	"House of Balloons / Glass Table Girls": ["i just want to tell you i come from a city", "where nobody gives a damn"],
	"The Morning": ["i'm the type to leave with every girl i meet"],
	"Wicked Games": ["bring your love baby i could bring my shame", "let me inside i want you tonight"],
	"The Party & The After Party": ["you've been dancing for a while"],
	"Coming Down": ["i always want you when i'm coming down"],
	"Loft Music": ["we can enjoy slow kisses"],
	"The Knowing": ["i know you've got someone else"],
	"Twenty Eight": ["this house is not a home to you"],
	"Lonely Star": ["i'm a lonely star"],
	"Life of the Party": ["i just want to tell you i come from a city"],
	Thursday: ["i only want you on thursdays"],
	"The Zone": ["i'm in the zone"],
	"The Birds Pt. 1": ["i told you not to fall in love"],
	"The Birds Pt. 2": ["she told me not to fall in love"],
	Gone: ["baby i've been gone"],
	"Rolling Stone": ["i'm a rolling stone"],
	"Heaven or Las Vegas": ["heaven or las vegas"],
	Valerie: ["valerie it's so hard"],
	"D.D.": ["dirty diana"],
	Montreal: ["talk to me in french"],
	"XO / The Host": ["xo until we overdose"],
	Initiation: ["you can meet me in the palace"],
	"Echoes of Silence": ["echoes of silence"],
	"Till Dawn (Here Comes the Sun)": ["here comes the sun"],
	Professional: ["i'm a professional"],
	"The Town": ["i'm from the town"],
	Adaptation: ["adaptation"],
	"Love in the Sky": ["love in the sky"],
	"Belong to the World": ["you belong to the world"],
	"Live For": ["live for"],
	Wanderlust: ["wanderlust"],
	"Kiss Land": ["this is the moment you've waited for", "welcome to the kiss land"],
	Pretty: ["you're so pretty"],
	"Tears in the Rain": ["tears in the rain"],
	"Real Life": ["this ain't no real life"],
	Often: ["she asked me if i do this every day i said often"],
	"The Hills": [
		"i only call you when it's half past five",
		"the only time that i'll be by your side",
		"i've been here for too long"
	],
	Acquainted: ["let's get acquainted"],
	"Can't Feel My Face": ["i can't feel my face when i'm with you", "but i love it"],
	Shameless: ["i'll be shameless"],
	"Earned It": ["you deserve it baby you earned it"],
	"In the Night": ["in the night she hears him calling"],
	"As You Are": ["i'll take you as you are"],
	Prisoner: ["you got me trapped"],
	Starboy: ["look what you've done", "i'm a starboy"],
	"Party Monster": ["i'm good i've been rolling"],
	"False Alarm": ["false alarm"],
	Reminder: ["i just need a reminder"],
	"Rockin'": ["we gon' be rocking"],
	Secrets: ["everybody's got a secret"],
	"True Colors": ["show me your true colors"],
	"Stargirl Interlude": ["i just wanna see you shine"],
	Sidewalks: ["i walked the sidewalks"],
	"Die For You": ["i'd die for you"],
	"I Feel It Coming": ["i feel it coming"],
	"Call Out My Name": ["i want you to stay even when you say we can't be together", "call out my name"],
	"Try Me": ["try me"],
	"Wasted Times": ["wasted times i spent with you"],
	"I Was Never There": ["when it's time you always leave me", "i was never there"],
	"Hurt You": ["i don't wanna hurt you"],
	Privilege: ["it's a privilege"],
	"Alone Again": ["have you seen that charity ad with the dogs", "alone again"],
	"Too Late": ["it's too late"],
	"Hardest To Love": ["i'm the hardest to love"],
	"Scared To Live": ["i'm scared to live"],
	Snowchild: ["i used to pray when i was sixteen"],
	"Escape From LA": ["escape from la"],
	Heartless: ["never need a bitch i'm what a bitch need", "i'm heartless"],
	Faith: ["i still got faith"],
	"Blinding Lights": [
		"i've been tryna call i've been on my own for long enough",
		"the city's blinding lights",
		"i can't sleep until i feel your touch"
	],
	"In Your Eyes": ["in your eyes i see there's something burning inside you"],
	"Save Your Tears": ["save your tears for another day"],
	"After Hours": ["tell them that it's after hours"],
	"Until I Bleed Out": ["until i bleed out"],
	"Dawn FM": ["you've been in the dark for way too long"],
	Gasoline: ["it's 5am i'm drunk again"],
	"How Do I Make You Love Me?": ["how do i make you love me"],
	"Take My Breath": ["i want you to take my breath"],
	Sacrifice: ["i don't wanna sacrifice"],
	"Out of Time": ["say i love you girl but i'm out of time"],
	"Is There Someone Else?": ["is there someone else or not"],
	"Less Than Zero": ["i tried to hide but i'm wasting my time"],
	Popular: ["i'm popular"],
	"One of the Girls": ["i wanna be one of the girls"],
	"Double Fantasy": ["double fantasy"],
	"Wake Me Up": ["wake me up"],
	"Cry For Me": ["cry for me"],
	"São Paulo": ["sao paulo"],
	"Baptized In Fear": ["baptized in fear"],
	"Open Hearts": ["open hearts"],
	"I Can't Wait To Get There": ["i can't wait to get there"],
	Timeless: ["timeless"],
	"Niagara Falls": ["niagara falls"],
	"Take Me Back To LA": ["take me back to la"],
	"Hurry Up Tomorrow": ["hurry up tomorrow"],
	"Without a Warning": ["without a warning"],
	"The Abyss": ["the abyss"]
};
var STOP = /* @__PURE__ */ new Set([
	"the",
	"a",
	"an",
	"and",
	"or",
	"to",
	"of",
	"in",
	"on",
	"for",
	"i",
	"you",
	"me",
	"my",
	"it",
	"is",
	"im",
	"we",
	"that",
	"this",
	"with",
	"when",
	"but",
	"your",
	"be",
	"do",
	"dont",
	"just",
	"so",
	"its"
]);
function norm$1(s) {
	return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/['’]/g, "").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}
function tokens(s) {
	return norm$1(s).split(" ").filter((t) => t.length > 1 && !STOP.has(t));
}
var DOCS = BODIES.flatMap((b) => b.tracks.map((t) => ({
	bodyId: b.id,
	title: t.title,
	album: b.name,
	planet: b.planet,
	text: norm$1([
		t.title,
		b.name,
		b.planet,
		...LINES[t.title] ?? []
	].join(" "))
})));
var EXAMPLE_QUERIES = [
	"I can't feel my face",
	"half past five",
	"save your tears",
	"call out my name",
	"in your eyes",
	"I've been on my own for long enough"
];
function editDist(a, b) {
	if (a === b) return 0;
	if (Math.abs(a.length - b.length) > 1) return 99;
	if (!a.length || !b.length) return Math.max(a.length, b.length);
	let i = 0;
	let j = 0;
	let cuts = 0;
	while (i < a.length && j < b.length) {
		if (a[i] === b[j]) {
			i += 1;
			j += 1;
			continue;
		}
		cuts += 1;
		if (cuts > 1) return 99;
		if (a.length > b.length) i += 1;
		else if (b.length > a.length) j += 1;
		else {
			i += 1;
			j += 1;
		}
	}
	return cuts + (a.length - i) + (b.length - j);
}
function fuzzyHit(hay, needle) {
	if (hay.includes(needle)) return true;
	if (needle.length < 4) return false;
	return hay.split(" ").some((w) => editDist(w, needle) <= 1);
}
function lineScore(line, q, qt) {
	const n = norm$1(line);
	let s = 0;
	if (q.length >= 5 && n.includes(q)) s += 12;
	for (const t of qt) if (n.includes(t)) s += t.length > 4 ? 1.8 : 1;
	else if (fuzzyHit(n, t)) s += .9;
	const phrase = qt.slice(0, 5).join(" ");
	if (phrase.length > 7 && n.includes(phrase)) s += 5;
	return s;
}
function searchLyrics(query, limit = 6) {
	const q = norm$1(query);
	if (q.length < 2) return [];
	const qt = tokens(q);
	if (!qt.length && q.length < 4) return [];
	return collapseHits(DOCS.map((d) => {
		const lines = LINES[d.title] ?? [d.title];
		let bestLine = lines[0] ?? d.title;
		let lineBest = -1;
		for (const line of lines) {
			const ls = lineScore(line, q, qt);
			if (ls > lineBest) {
				lineBest = ls;
				bestLine = line;
			}
		}
		let score = lineBest;
		const tn = norm$1(d.title);
		const hay = `${tn} ${d.text}`;
		const cover = qt.filter((t) => hay.includes(t) || fuzzyHit(hay, t)).length / Math.max(qt.length, 1);
		if (qt.length >= 2 && cover < .5 && lineBest < 8) return {
			d,
			score: 0,
			line: bestLine
		};
		if (tn.includes(q) || tn.length > 4 && q.includes(tn)) score += 6;
		for (const t of qt) {
			if (tn.includes(t)) score += 1.5;
			if (d.text.includes(t)) score += .35;
			else if (fuzzyHit(d.text, t)) score += .4;
		}
		if (q.length >= 6 && d.text.includes(q)) score += 4;
		if (d.bodyId === "sun") score -= 1.2;
		return {
			d,
			score,
			line: bestLine
		};
	}).filter((x) => x.score > 3.2).sort((a, b) => b.score - a.score).map(({ d, score, line }) => ({
		bodyId: d.bodyId,
		title: d.title,
		album: d.album,
		planet: d.planet,
		line,
		score
	})), limit);
}
function collapseHits(hits, limit = 6) {
	const seen = /* @__PURE__ */ new Set();
	const out = [];
	for (const h of hits) {
		const key = h.title.toLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);
		out.push(h);
		if (out.length >= limit) break;
	}
	return out;
}
function catalogForPrompt() {
	return BODIES.map((b) => `${b.planet} | ${b.name} | ${b.id} | ${b.tracks.map((t) => t.title).join("; ")}`).join("\n");
}
function env(key) {
	return process.env[key]?.trim() || void 0;
}
var Route$1 = createFileRoute("/api/lyrics")({ server: { handlers: { POST: async ({ request }) => {
	let q = "";
	try {
		const body = await request.json();
		q = typeof body.q === "string" ? body.q.slice(0, 240) : "";
	} catch {
		return Response.json({ hits: [] });
	}
	const local = searchLyrics(q, 6);
	const key = env("XAI_API_KEY");
	if (!key || q.trim().length < 4) return Response.json({
		hits: local,
		source: "index"
	});
	try {
		const res = await fetch("https://api.x.ai/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${key}`
			},
			body: JSON.stringify({
				model: "grok-4.5",
				temperature: 0,
				max_tokens: 420,
				messages: [{
					role: "system",
					content: "You retrieve The Weeknd songs from half-remembered lyrics. Use only this catalog. Reply JSON only: {\"hits\":[{\"title\":\"\",\"bodyId\":\"\",\"line\":\"\",\"confidence\":0-1}]} max 5. bodyId must be one of sun,mdm,idol,hut,after-hours,bbtm,starboy,kiss-land,dawn-fm,trilogy."
				}, {
					role: "user",
					content: `CATALOG:\n${catalogForPrompt()}\n\nREMEMBERED LYRICS:\n${q}`
				}]
			})
		});
		if (!res.ok) return Response.json({
			hits: local,
			source: "index"
		});
		const raw = (await res.json()).choices?.[0]?.message?.content ?? "";
		const json = raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
		const merged = [...(JSON.parse(json).hits ?? []).filter((h) => h.title && h.bodyId).map((h) => {
			const body = bodyById(h.bodyId);
			const track = body?.tracks.find((t) => t.title.toLowerCase() === String(h.title).toLowerCase());
			return {
				bodyId: body?.id ?? h.bodyId,
				title: track?.title ?? h.title,
				album: body?.name ?? "",
				planet: body?.planet ?? "",
				line: h.line || "",
				score: 10 + (h.confidence ?? .5) * 4
			};
		}).filter((h) => h.album)];
		for (const hit of local) if (!merged.some((m) => m.title === hit.title && m.bodyId === hit.bodyId)) merged.push(hit);
		return Response.json({
			hits: collapseHits(merged, 5),
			source: "rag"
		});
	} catch {
		return Response.json({
			hits: local,
			source: "index"
		});
	}
} } } });
function norm(s) {
	return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/&/g, "and").replace(/são/g, "sao").replace(/…/g, " ").replace(/['’]/g, "").replace(/\(feat\.?[^)]*\)/gi, " ").replace(/\(ft\.?[^)]*\)/gi, " ").replace(/\bfeat(uring)?\.?\s+.+$/i, " ").replace(/\bwith\s+daft punk\b/gi, " ").replace(/[^a-z0-9]+/g, " ").replace(/\b(pt|part)\b/g, "pt").trim();
}
function scoreTitle(query, hitTitle) {
	const na = norm(query);
	const nb = norm(hitTitle);
	if (!na || !nb) return 0;
	if (na === nb) return 5;
	if (nb.startsWith(na) || na.startsWith(nb)) return 4.2;
	if (na.includes(nb) || nb.includes(na)) return 3.4;
	const wa = new Set(na.split(" ").filter((w) => w.length > 1));
	const wb = nb.split(" ").filter((w) => w.length > 1);
	if (!wb.length) return 0;
	let hit = 0;
	for (const w of wb) if (wa.has(w)) hit++;
	return hit / Math.max(wb.length, wa.size, 1) * 3.2;
}
function slugify(title) {
	return title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/&/g, "and").replace(/['’]/g, "").replace(/…/g, "").replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}
var SLUG_OVERRIDES = {
	"I Feel It Coming": ["i-feel-it-coming", "i-feel-it-coming-feat-daft-punk"],
	"Can't Feel My Face": ["cant-feel-my-face"],
	"House of Balloons / Glass Table Girls": ["house-of-balloons-glass-table-girls", "house-of-balloons"],
	"The Party & The After Party": ["the-party-the-after-party"],
	"XO / The Host": ["xo-the-host"],
	"The Birds Pt. 1": ["the-birds-pt-1", "the-birds-part-1"],
	"The Birds Pt. 2": ["the-birds-pt-2", "the-birds-part-2"],
	"Here We Go… Again": ["here-we-go-again"],
	"How Do I Make You Love Me?": ["how-do-i-make-you-love-me"],
	"Is There Someone Else?": ["is-there-someone-else"],
	"Don't Break My Heart": ["dont-break-my-heart"],
	"I Heard You're Married": ["i-heard-youre-married"],
	"Phantom Regret by Jim": ["phantom-regret-by-jim"],
	"A Tale by Quincy": ["a-tale-by-quincy"],
	"São Paulo": ["sao-paulo"],
	"I Can't Fucking Sing": ["i-cant-fucking-sing"],
	"Until We're Skin & Bones": ["until-were-skin-and-bones", "until-were-skin-bones"],
	"Repeat After Me (Interlude)": ["repeat-after-me-interlude", "repeat-after-me"],
	"Stargirl Interlude": ["stargirl-interlude"],
	"D.D.": ["dd", "d-d"],
	"Popular": ["popular", "popular-1"],
	"Die For You": ["die-for-you", "die-for-you-1"]
};
function candidateUrls(title) {
	return [.../* @__PURE__ */ new Set([slugify(title), ...SLUG_OVERRIDES[title] ?? []])].map((s) => `https://soundcloud.com/theweeknd/${s}`);
}
var cachedId = null;
async function scrapeClientId() {
	if (cachedId && Date.now() - cachedId.at < 216e5) return cachedId.id;
	const scripts = [...(await fetch("https://soundcloud.com", { headers: {
		"User-Agent": "Mozilla/5.0",
		Accept: "text/html"
	} }).then((r) => r.text())).matchAll(/src="(https:\/\/a-v2\.sndcdn\.com\/assets\/[^"]+\.js)"/g)].map((m) => m[1]);
	for (const src of scripts.slice().reverse()) {
		const m = (await fetch(src, { headers: { "User-Agent": "Mozilla/5.0" } }).then((r) => r.text())).match(/client_id:"([A-Za-z0-9]{16,})"/);
		if (m) {
			cachedId = {
				id: m[1],
				at: Date.now()
			};
			return m[1];
		}
	}
	if (cachedId) return cachedId.id;
	cachedId = {
		id: "Pb72ranhoyt6gw7hM7TkzUItXlMWSNSo",
		at: Date.now()
	};
	return cachedId.id;
}
async function scGet(url) {
	const res = await fetch(url, { headers: {
		Accept: "application/json",
		"User-Agent": "Mozilla/5.0"
	} });
	if (!res.ok) throw new Error(`sc ${res.status}`);
	return res.json();
}
async function searchTracks(q, limit = 40) {
	const id = await scrapeClientId();
	return (await scGet(`https://api-v2.soundcloud.com/search/tracks?q=${encodeURIComponent(q)}&client_id=${id}&limit=${limit}&app_locale=en`)).collection ?? [];
}
async function resolveUrl(url) {
	try {
		const id = await scrapeClientId();
		const data = await scGet(`https://api-v2.soundcloud.com/resolve?url=${encodeURIComponent(url)}&client_id=${id}`);
		if (data?.permalink_url && (data.kind === "track" || data.title)) return data;
		return null;
	} catch {
		return null;
	}
}
function isJunk(title) {
	return /remix|bootleg|karaoke|cover|sped up|slowed|nightcore|8d|mashup|prod\.|edit zyzz|\s[x×]\s|tribute|instrumental/i.test(title);
}
function isOfficial(h) {
	const user = (h.user?.permalink ?? "").toLowerCase();
	const name = (h.user?.username ?? "").toLowerCase();
	return user === "theweeknd" || name === "the weeknd";
}
function pick(hits, title) {
	let best = null;
	let bestScore = 1.15;
	for (const h of hits) {
		if (!h.permalink_url || !h.title) continue;
		const official = isOfficial(h);
		if (isJunk(h.title) && !isJunk(title) && !official) continue;
		let s = scoreTitle(title, h.title);
		if (official) s += 2.4;
		else if ((h.user?.username ?? "").toLowerCase().includes("weeknd")) s += .45;
		else s -= .4;
		const dur = h.duration ?? 0;
		if (dur >= 9e4) s += .35;
		else if (dur > 0 && dur < 42e3) s -= .55;
		if (h.streamable === false) s -= .55;
		if ((h.policy ?? "").toUpperCase() === "BLOCK") s -= 1.2;
		if ((h.policy ?? "").toUpperCase() === "SNIP") s -= .12;
		if (s > bestScore) {
			bestScore = s;
			best = h;
		}
	}
	return best;
}
function toHit(h, verified = true) {
	const policyRaw = (h.policy ?? "UNKNOWN").toUpperCase();
	const policy = policyRaw === "ALLOW" || policyRaw === "SNIP" || policyRaw === "BLOCK" ? policyRaw : "UNKNOWN";
	return {
		permalink: h.permalink_url,
		artwork: h.artwork_url ? h.artwork_url.replace("-large", "-t500x500") : null,
		duration: h.duration ?? 0,
		title: h.title ?? "",
		streamable: h.streamable !== false && policy !== "BLOCK",
		policy,
		verified
	};
}
async function mapLimit(items, limit, fn) {
	const out = [];
	let i = 0;
	async function worker() {
		while (i < items.length) {
			const idx = i++;
			out[idx] = await fn(items[idx]);
		}
	}
	await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
	return out;
}
var Route = createFileRoute("/api/soundcloud")({ server: { handlers: { POST: async ({ request }) => {
	const body = await request.json();
	const album = body.album?.trim() || "The Weeknd";
	const titles = Array.isArray(body.tracks) ? body.tracks.slice(0, 40) : [];
	if (!titles.length) return Response.json({ tracks: {} });
	const map = {};
	for (const title of titles) map[title] = null;
	try {
		const albumHits = await searchTracks(album, 50);
		for (const title of titles) {
			const hit = pick(albumHits, title);
			if (hit) map[title] = toHit(hit);
		}
		await mapLimit(titles.filter((t) => !map[t]), 6, async (title) => {
			for (const url of candidateUrls(title)) {
				const resolved = await resolveUrl(url);
				if (resolved && (isOfficial(resolved) || scoreTitle(title, resolved.title ?? "") >= 3)) {
					map[title] = toHit(resolved);
					return null;
				}
			}
			try {
				const hit = pick(await searchTracks(`The Weeknd ${title}`, 12), title);
				map[title] = hit ? toHit(hit) : map[title];
			} catch {}
			return null;
		});
		await mapLimit(titles.filter((t) => !map[t]).slice(0, 10), 4, async (title) => {
			try {
				const hit = pick(await searchTracks(`"${title}" The Weeknd`, 8), title);
				if (hit) map[title] = toHit(hit);
			} catch {}
			return null;
		});
	} catch {
		for (const title of titles) if (!(title in map)) map[title] = null;
	}
	return Response.json({ tracks: map });
} } } });
var rootRouteChildren = {
	IndexRoute: Route$3.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$4
	}),
	ApiAudioRoute: Route$2.update({
		id: "/api/audio",
		path: "/api/audio",
		getParentRoute: () => Route$4
	}),
	ApiLyricsRoute: Route$1.update({
		id: "/api/lyrics",
		path: "/api/lyrics",
		getParentRoute: () => Route$4
	}),
	ApiSoundcloudRoute: Route.update({
		id: "/api/soundcloud",
		path: "/api/soundcloud",
		getParentRoute: () => Route$4
	})
};
var routeTree = Route$4._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { BODIES as a, SUN as c, soundcloudUrl as d, __exportAll as i, albumQuery as l, EXAMPLE_QUERIES as n, CAROUSEL as o, searchLyrics as r, PLANETS as s, router_exports as t, bodyById as u };
