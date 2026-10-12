import { i as __toESM } from "../_runtime.mjs";
import { G as require_jsx_runtime, K as require_react, V as Vector3 } from "../_libs/@react-three/drei+[...].mjs";
import { a as Tag, c as RotateCcw, d as Pause, f as Orbit, g as AudioLines, h as ImagePlus, l as Repeat, m as LoaderCircle, n as VolumeX, o as SkipForward, p as MessageSquareQuote, r as Volume2, s as SkipBack, t as X, u as Play } from "../_libs/lucide-react.mjs";
import { a as BODIES, d as soundcloudUrl, i as __exportAll, l as albumQuery, n as EXAMPLE_QUERIES, o as CAROUSEL, r as searchLyrics, u as bodyById } from "./router-CGpSkYs9.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-ToyWMQR-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function clamp01$1(n) {
	return Math.max(0, Math.min(1, n));
}
var Sfx = class {
	ctx = null;
	master = null;
	gain = .4;
	unlock() {
		if (typeof window === "undefined") return;
		const AC = window.AudioContext || window.webkitAudioContext;
		if (!this.ctx) {
			this.ctx = new AC({ latencyHint: "interactive" });
			this.master = this.ctx.createGain();
			this.master.gain.value = this.gain;
			this.master.connect(this.ctx.destination);
		}
		if (this.ctx.state === "suspended") this.ctx.resume();
	}
	setGain(v) {
		this.gain = clamp01$1(v);
		if (this.master && this.ctx) this.master.gain.setTargetAtTime(this.gain, this.ctx.currentTime, .03);
	}
	whoosh() {
		this.unlock();
		const ctx = this.ctx;
		const master = this.master;
		if (!ctx || !master) return;
		const t = ctx.currentTime;
		const dur = .32;
		const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
		const data = buffer.getChannelData(0);
		for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
		const src = ctx.createBufferSource();
		src.buffer = buffer;
		const filter = ctx.createBiquadFilter();
		filter.type = "bandpass";
		filter.frequency.setValueAtTime(420, t);
		filter.frequency.exponentialRampToValueAtTime(1680, t + dur);
		filter.Q.value = .85;
		const g = ctx.createGain();
		g.gain.setValueAtTime(1e-4, t);
		g.gain.exponentialRampToValueAtTime(.7, t + .04);
		g.gain.exponentialRampToValueAtTime(1e-4, t + dur);
		src.connect(filter);
		filter.connect(g);
		g.connect(master);
		src.start(t);
		src.stop(t + dur);
		src.onended = () => {
			src.disconnect();
			filter.disconnect();
			g.disconnect();
		};
	}
	playHit() {
		this.unlock();
		const ctx = this.ctx;
		const master = this.master;
		if (!ctx || !master) return;
		const t = ctx.currentTime;
		const beep = (freq, at, len, vol) => {
			const o = ctx.createOscillator();
			o.type = "triangle";
			o.frequency.setValueAtTime(freq, at);
			const g = ctx.createGain();
			g.gain.setValueAtTime(1e-4, at);
			g.gain.exponentialRampToValueAtTime(vol, at + .012);
			g.gain.exponentialRampToValueAtTime(1e-4, at + len);
			o.connect(g);
			g.connect(master);
			o.start(at);
			o.stop(at + len);
			o.onended = () => {
				o.disconnect();
				g.disconnect();
			};
		};
		beep(660, t, .09, .22);
		beep(990, t + .07, .11, .16);
	}
};
var sfx = new Sfx();
var PERSIST_KEY = "xo-universe-v1";
function readPersist() {
	if (typeof window === "undefined") return null;
	try {
		const raw = localStorage.getItem(PERSIST_KEY);
		if (!raw) return null;
		const d = JSON.parse(raw);
		if (d?.v !== 1) return null;
		return d;
	} catch {
		return null;
	}
}
function writePersist(s) {
	if (typeof window === "undefined") return;
	try {
		const payload = {
			v: 1,
			selectedId: s.selectedId,
			volume: s.volume,
			muted: s.muted,
			loop: s.loop,
			lastTrack: s.nowPlaying ? {
				bodyId: s.nowPlaying.bodyId,
				title: s.nowPlaying.track.title,
				permalink: s.nowPlaying.permalink,
				artwork: s.nowPlaying.artwork
			} : null
		};
		localStorage.setItem(PERSIST_KEY, JSON.stringify(payload));
	} catch {}
}
var persisted = readPersist();
var useUniverse = create((set) => ({
	entered: false,
	selectedId: null,
	creditsOpen: false,
	lyricsOpen: false,
	speed: 1,
	showOrbits: true,
	showLabels: true,
	orbitsPaused: false,
	nowPlaying: null,
	isPlaying: false,
	playbackStatus: "idle",
	playSource: null,
	progress: 0,
	duration: 0,
	volume: persisted?.volume ?? .85,
	muted: persisted?.muted ?? false,
	loop: persisted?.loop ?? false,
	panelMode: "tracks",
	libraryStatus: "idle",
	scByTitle: {},
	itunesByTitle: {},
	bootProgress: 0,
	bootLabel: "Opening the night",
	bootReady: false,
	customCovers: {},
	enter: () => {
		const p = readPersist();
		const last = p?.lastTrack;
		const body = last ? bodyById(last.bodyId) : null;
		const track = body?.tracks.find((t) => t.title === last?.title);
		set({
			entered: true,
			selectedId: p?.selectedId ?? null,
			volume: p?.volume ?? .85,
			muted: p?.muted ?? false,
			loop: p?.loop ?? false,
			nowPlaying: body && track && last ? {
				bodyId: last.bodyId,
				track,
				permalink: last.permalink,
				artwork: last.artwork
			} : null,
			isPlaying: false,
			playbackStatus: "idle"
		});
	},
	select: (id) => {
		if (id) sfx.whoosh();
		set({
			selectedId: id,
			creditsOpen: false,
			panelMode: "tracks"
		});
	},
	toggleCredits: (open) => set((s) => {
		const creditsOpen = open ?? !s.creditsOpen;
		return {
			creditsOpen,
			lyricsOpen: creditsOpen ? false : s.lyricsOpen
		};
	}),
	toggleLyrics: (open) => set((s) => {
		const lyricsOpen = open ?? !s.lyricsOpen;
		return {
			lyricsOpen,
			creditsOpen: lyricsOpen ? false : s.creditsOpen
		};
	}),
	setSpeed: (speed) => set({ speed }),
	setShowOrbits: (showOrbits) => set({ showOrbits }),
	setShowLabels: (showLabels) => set({ showLabels }),
	setOrbitsPaused: (orbitsPaused) => set({ orbitsPaused }),
	setNowPlaying: (nowPlaying) => set({ nowPlaying }),
	setIsPlaying: (isPlaying) => set({ isPlaying }),
	setPlaybackStatus: (playbackStatus) => set({ playbackStatus }),
	setPlaySource: (playSource) => set({ playSource }),
	setProgress: (progress, duration) => set({
		progress,
		duration
	}),
	setVolume: (volume) => set({
		volume,
		muted: volume === 0
	}),
	setMuted: (muted) => set({ muted }),
	setLoop: (loop) => set({ loop }),
	setPanelMode: (panelMode) => set({ panelMode }),
	setLibraryStatus: (libraryStatus) => set({ libraryStatus }),
	setScByTitle: (scByTitle) => set((s) => ({ scByTitle: {
		...s.scByTitle,
		...scByTitle
	} })),
	setItunesByTitle: (itunesByTitle) => set((s) => ({ itunesByTitle: {
		...s.itunesByTitle,
		...itunesByTitle
	} })),
	setBoot: (bootProgress, bootLabel, bootReady) => set((s) => ({
		bootProgress,
		bootLabel,
		bootReady: bootReady ?? s.bootReady
	})),
	hydrateCovers: (customCovers) => set({ customCovers }),
	setCustomCover: (id, url) => set((s) => {
		const prev = s.customCovers[id];
		if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
		return { customCovers: {
			...s.customCovers,
			[id]: url
		} };
	}),
	clearCustomCover: (id) => set((s) => {
		const prev = s.customCovers[id];
		if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
		const next = { ...s.customCovers };
		delete next[id];
		return { customCovers: next };
	})
}));
if (typeof window !== "undefined") {
	let timer = 0;
	useUniverse.subscribe((s) => {
		if (!s.entered) return;
		window.clearTimeout(timer);
		timer = window.setTimeout(() => {
			writePersist(s);
		}, 280);
	});
}
var bodyPositions = /* @__PURE__ */ new Map();
var audioEnergy = {
	level: 0,
	bass: 0,
	mid: 0,
	playingBodyId: null
};
var view = {
	camera: null,
	size: {
		w: 1,
		h: 1
	}
};
function framingDistance(radius) {
	return Math.max(10, radius * 6.8);
}
function minZoomDistance(radius) {
	return Math.max(6.4, radius * 4.2);
}
function norm(s) {
	return s.toLowerCase().replace(/&/g, "and").replace(/são/g, "sao").replace(/…/g, " ").replace(/[^a-z0-9]+/g, " ").trim();
}
function score(a, b) {
	const na = norm(a);
	const nb = norm(b);
	if (!na || !nb) return 0;
	if (na === nb) return 4;
	if (na.includes(nb) || nb.includes(na)) return 3;
	const wa = new Set(na.split(" ").filter(Boolean));
	const wb = nb.split(" ").filter(Boolean);
	let hit = 0;
	for (const w of wb) if (wa.has(w)) hit++;
	return hit / Math.max(wb.length, 1);
}
async function search(term, limit = 40) {
	const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=${limit}`;
	const res = await fetch(url);
	if (!res.ok) throw new Error("itunes");
	return ((await res.json()).results ?? []).filter((r) => (r.artistName ?? "").toLowerCase().includes("weeknd"));
}
async function fetchPreviews(albumQuery, tracks) {
	const results = await search(albumQuery, 50);
	const map = {};
	for (const track of tracks) {
		let best = null;
		let bestScore = .55;
		for (const r of results) {
			const s = score(track.title, r.trackName ?? "");
			if (s > bestScore) {
				bestScore = s;
				best = r;
			}
		}
		map[track.title] = best?.previewUrl ?? null;
	}
	const missing = tracks.filter((t) => !map[t.title]);
	await Promise.all(missing.slice(0, 12).map(async (t) => {
		try {
			const hits = await search(t.search, 8);
			let best = null;
			let bestScore = .4;
			for (const r of hits) {
				const s = score(t.title, r.trackName ?? "");
				if (s > bestScore) {
					bestScore = s;
					best = r;
				}
			}
			map[t.title] = best?.previewUrl ?? null;
		} catch {
			map[t.title] = null;
		}
	}));
	return map;
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
	"Every Angel Is Terrifying": ["every-angel-is-terrifying"],
	"Popular": ["popular", "popular-1"],
	"Die For You": ["die-for-you", "die-for-you-1"],
	"Save Your Tears": ["save-your-tears"],
	"Blinding Lights": ["blinding-lights"],
	"The Hills": ["the-hills"],
	"Starboy": ["starboy"],
	"Call Out My Name": ["call-out-my-name"],
	"Wicked Games": ["wicked-games"],
	"High for This": ["high-for-this"],
	"Take My Breath": ["take-my-breath"],
	"Out of Time": ["out-of-time"],
	"Less Than Zero": ["less-than-zero"],
	"One of the Girls": ["one-of-the-girls"],
	"Double Fantasy": ["double-fantasy"],
	"Timeless": ["timeless"],
	"Wake Me Up": ["wake-me-up"]
};
function titleSlugs(title) {
	const base = slugify(title);
	const extras = SLUG_OVERRIDES[title] ?? [];
	const slim = base.replace(/-pt-/g, "-pt-").replace(/-part-/g, "-pt-");
	return [...new Set([
		base,
		slim,
		`${base}-1`,
		...extras
	].filter(Boolean))];
}
function candidatePermalinks(title) {
	return titleSlugs(title).flatMap((slug) => [`https://soundcloud.com/theweeknd/${slug}`]);
}
function isPreviewDuration(ms) {
	return ms > 8e3 && ms < 42e3;
}
function formatTrackTime(ms) {
	if (!ms || ms < 1e3) return "";
	if (isPreviewDuration(ms)) return "Preview";
	const t = Math.floor(ms / 1e3);
	return `${Math.floor(t / 60)}:${(t % 60).toString().padStart(2, "0")}`;
}
function hitUsable(hit) {
	return Boolean(hit?.permalink && hit.verified !== false && hit.policy !== "BLOCK");
}
async function fetchAlbumTracks(albumQuery, tracks) {
	const res = await fetch("/api/soundcloud", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			album: albumQuery,
			tracks: tracks.map((t) => t.title)
		})
	});
	if (!res.ok) throw new Error("soundcloud");
	const map = { ...(await res.json()).tracks ?? {} };
	for (const t of tracks) {
		if (map[t.title]?.permalink) continue;
		map[t.title] = {
			permalink: candidatePermalinks(t.title)[0],
			artwork: null,
			duration: 0,
			title: t.title,
			streamable: true,
			policy: "UNKNOWN",
			verified: false
		};
	}
	return map;
}
function key(title) {
	return title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/['’.]/g, "").replace(/&/g, "and").replace(/…/g, " ").replace(/[^a-z0-9]+/g, " ").replace(/\bpt\b/g, "part").replace(/\s+/g, " ").trim();
}
/** Official @TheWeeknd / VEVO / UMG uploads. Prefer music video, else official audio. */
var IDS = {
	"high for this": "sX9DgavXiN4",
	"wicked games": "O1OTWCd40bc",
	"the hills": "yzTuBuRdAyA",
	"cant feel my face": "KEI4qSrkPAs",
	starboy: "34Na4j8AVgA",
	"die for you": "uPD0QOGTmMI",
	"call out my name": "M4ZoCHID9GI",
	"blinding lights": "4NRXx6U8ABQ",
	"save your tears": "XXYlFuWEuKI",
	"take my breath": "rhTl_OyehF8",
	popular: "vt0i6nuqNEo",
	timeless: "5EpyN_6dqyk",
	"try me": "y08R20KflNM",
	"wasted times": "R0rKB_bsUNg",
	"i was never there": "OlStmta0Vh4",
	"hurt you": "wKDU5pXhf5o",
	privilege: "JcVDXHeD59c",
	"double fantasy": "dMoFcvfd5t4",
	family: "1ztt-NkU7GE",
	"false idols": "_JZW2ET4zQs",
	"take me back": "cSPE7lNR73o",
	"a lesser man": "bBqrgxAr_sk",
	"like a god": "Zf9dUVTa93s",
	"fill the void": "2QMyW1LZBBM",
	"one of the girls": "Mx92lTYxrJQ",
	"wake me up": "QNGCMgvcbpA",
	"cry for me": "bn8gP5N8hqM",
	"i cant fucking sing": "0yiDQS3vH7I",
	"sao paulo": "2kjolTLZ_Mg",
	"until were skin and bones": "qIX_3h3wBsg",
	"baptized in fear": "8zHWTsdnC7A",
	"open hearts": "Bn-3ICGjz0U",
	"opening night": "MYZAi6GLXyM",
	"reflections laughing": "e_zUE17NodI",
	"enjoy the show": "b9jHP7XhMDg",
	"given up on me": "dEWCJZQjjhI",
	"i cant wait to get there": "90af1O3UvF4",
	"niagara falls": "HxWx5UuznGI",
	"take me back to la": "tYvKLO0wOcU",
	"big sleep": "-wTr3bTbVO8",
	"give me mercy": "cVoO8ZYXkrQ",
	drive: "Fv2Y1odMjvE",
	"the abyss": "S3ncfrQPpjs",
	"red terror": "UxzKSHLqdfo",
	"without a warning": "qgjRtdfj1e0",
	"hurry up tomorrow": "GT8ornYrDEs",
	"alone again": "JH398xAYpZA",
	"too late": "Wh8DT09QCHI",
	"hardest to love": "pM3nIOYF2W8",
	"scared to live": "MzsU_sn2aIE",
	snowchild: "G0JKdFjWkLA",
	"escape from la": "vsARlcGW0jE",
	heartless: "1DpH-icPpl0",
	faith: "RcS_8-a-sMg",
	"in your eyes": "dqRZDebPIGs",
	"repeat after me interlude": "CE-Iy24NOTY",
	"after hours": "ygTZZpVkmKg",
	"until i bleed out": "i58MNnk6BhY",
	"nothing compares": "T5hHpqWNyv0",
	"missed you": "N0vp5IjGRB4",
	"final lullaby": "RWiAiNVQq-g",
	"real life": "EjlLdjzE7dg",
	losers: "xNKOrBA9Sp0",
	"tell your friends": "j1ngEIxopUU",
	often: "JPIhUaONiLU",
	acquainted: "-OMptcPcw0Y",
	shameless: "polycpBREYA",
	"earned it": "waU75jdUnYw",
	"in the night": "2iFa5We6zqw",
	"as you are": "8CWy_-afIpY",
	"dark times": "pkAAIGFNYw4",
	prisoner: "x0bRHmTQEsE",
	angel: "QAAOynFujNw",
	"party monster": "diW6jXhLE0E",
	"false alarm": "CW5oGRx9CLM",
	reminder: "JZjAg6fK-BQ",
	rockin: "Nox2RGWOOdE",
	secrets: "eXDU9um19HM",
	"true colors": "VQ5XQYpx2mg",
	"stargirl interlude": "TkxVOa6u59M",
	sidewalks: "sK-T-cmznY8",
	"six feet under": "Yu7kHJqKRW8",
	"love to lay": "dB4YSEHG3ac",
	"a lonely night": "iBnLoAE9kUE",
	attention: "3tHuJAZpYNw",
	"ordinary life": "PlJV9IesfIk",
	"nothing without you": "WFO7r3g-JBc",
	"all i know": "4iSEJB1KJ0w",
	"i feel it coming": "qFLhGq0060w",
	professional: "tcLr-GIJQfI",
	"the town": "c7GkZd7T3tk",
	adaptation: "pfnnmwLR8vY",
	"love in the sky": "AU3D8Yfzlxs",
	"belong to the world": "lYO77zNhWl4",
	"live for": "IqLlfuLrhxM",
	wanderlust: "kygPUxOs03c",
	"kiss land": "Wq6V9YpE1aE",
	pretty: "HxilwT1sKSo",
	"tears in the rain": "XpR58x0yBl4",
	"odd look": "9EYRa_z93_w",
	"dawn fm": "w8eFZoOcYKc",
	gasoline: "iOa7uE23qc4",
	"how do i make you love me": "VLMo0rthnoo",
	sacrifice: "VafTMsrnSTU",
	"a tale by quincy": "ioL_Ozo_6iI",
	"out of time": "2fDzCWNS3ig",
	"here we go again": "rhVqSATlmQs",
	"best friends": "hpNBXbJ7rzs",
	"is there someone else": "1XqIWr_WqM4",
	"starry eyes": "_GA3dj_HxO4",
	"every angel is terrifying": "kMXs99tPkcg",
	"dont break my heart": "OeqV6oyNHc0",
	"i heard youre married": "86kEbw4pvxU",
	"less than zero": "UKunvvN2iCk",
	"phantom regret by jim": "vCOXTEzfoJ4",
	"what you need": "PGCVhhUxnp8",
	"house of balloons glass table girls": "8ex38L8xtNI",
	"the morning": "5TAko3RH0bk",
	"the party and the after party": "yI-zb_aP0So",
	"coming down": "WVg1mbxTkFo",
	"loft music": "HOdNMwTNNhA",
	"the knowing": "vPp5Ty9EE6k",
	"twenty eight": "2_ScGcuXZqc",
	"lonely star": "pdH1kXzquQo",
	"life of the party": "_bSXY75R3Wc",
	thursday: "0Suprl56Owg",
	"the zone": "tfrWuiQ4QNc",
	"the birds part 1": "t2_YyRBYZjM",
	"the birds part 2": "9FE-Pwm2cyc",
	gone: "CqHKfscXS64",
	"rolling stone": "ORVz_qeKgvg",
	"heaven or las vegas": "Kh3_Mn1wncE",
	valerie: "47WlgETfamE",
	dd: "FXT1oKrgq0o",
	montreal: "TV1r4m8c9SI",
	outside: "umvomiY7804",
	"xo the host": "6FFSCF0gXt0",
	initiation: "EDFEQyx7o4k",
	"same old song": "NID-2orTN8U",
	"the fall": "YK9N-Xh32eE",
	next: "-iW1-BuJ_Hc",
	"echoes of silence": "bHFc5ZfEdBQ",
	"till dawn here comes the sun": "xSSzZ6HgkFQ"
};
function youtubeIdFor(title) {
	const k = key(title);
	if (IDS[k]) return IDS[k];
	return IDS[k.replace(/\b(feat|ft|with)\b.*$/, "").trim()] ?? null;
}
function clamp01(n) {
	return Math.max(0, Math.min(1, n));
}
var AudioEngine = class {
	widget = null;
	events = null;
	ready = false;
	waiters = [];
	playWaiters = [];
	bpm = 120;
	durationMs = 0;
	loadGen = 0;
	raf = 0;
	lastPos = 0;
	meterOn = false;
	currentUrl = null;
	poll = 0;
	finishGuard = 0;
	el = null;
	ctx = null;
	analyser = null;
	freq = null;
	hooked = false;
	using = null;
	yt = null;
	ytReady = false;
	ytWaiters = [];
	ytId = null;
	ensureEl() {
		if (this.el) return this.el;
		if (typeof window === "undefined") throw new Error("ssr");
		const el = new Audio();
		el.preload = "auto";
		el.crossOrigin = "anonymous";
		el.addEventListener("timeupdate", () => {
			if (this.using !== "itunes") return;
			const d = el.duration;
			if (Number.isFinite(d) && d > 0) {
				this.lastPos = el.currentTime * 1e3;
				this.durationMs = d * 1e3;
				useUniverse.getState().setProgress(el.currentTime, d);
			}
		});
		el.addEventListener("playing", () => {
			if (this.using !== "itunes") return;
			useUniverse.getState().setIsPlaying(true);
			useUniverse.getState().setPlaybackStatus("playing");
			this.startMeter();
		});
		el.addEventListener("pause", () => {
			if (this.using !== "itunes") return;
			const st = useUniverse.getState();
			if (st.playbackStatus === "loading" || st.playbackStatus === "buffering") return;
			st.setIsPlaying(false);
			if (st.playbackStatus === "playing") st.setPlaybackStatus("paused");
		});
		el.addEventListener("ended", () => {
			if (this.using !== "itunes") return;
			if (useUniverse.getState().loop) {
				el.currentTime = 0;
				el.play();
				return;
			}
			this.skip(1);
		});
		el.addEventListener("error", () => {
			if (this.using !== "itunes") return;
			useUniverse.getState().setIsPlaying(false);
			useUniverse.getState().setPlaybackStatus("error");
		});
		this.el = el;
		return el;
	}
	attach(widget, events) {
		this.widget = widget;
		this.events = events;
		widget.bind(events.READY, () => {
			this.ready = true;
			this.waiters.splice(0).forEach((fn) => fn());
			const { volume, muted } = useUniverse.getState();
			widget.setVolume(muted ? 0 : Math.round(volume * 100));
		});
		widget.bind(events.PLAY, () => {
			if (this.using !== "soundcloud") return;
			this.playWaiters.splice(0).forEach((fn) => fn(true));
			useUniverse.getState().setIsPlaying(true);
			useUniverse.getState().setPlaybackStatus("playing");
			this.startMeter();
			this.startPoll();
		});
		widget.bind(events.PAUSE, () => {
			if (this.using !== "soundcloud") return;
			const st = useUniverse.getState();
			if (st.playbackStatus === "loading" || st.playbackStatus === "buffering") return;
			st.setIsPlaying(false);
			if (st.playbackStatus === "playing") st.setPlaybackStatus("paused");
		});
		widget.bind(events.PLAY_PROGRESS, (progress) => {
			if (this.using !== "soundcloud") return;
			const ms = progress?.currentPosition ?? 0;
			this.applyProgress(ms);
		});
		widget.bind(events.FINISH, () => {
			if (this.using !== "soundcloud") return;
			const gen = this.loadGen;
			window.setTimeout(() => {
				if (gen !== this.loadGen) return;
				if (useUniverse.getState().loop) {
					widget.seekTo(0);
					widget.play();
					return;
				}
				this.skip(1);
			}, 40);
		});
		if (events.ERROR) widget.bind(events.ERROR, () => {
			this.playWaiters.splice(0).forEach((fn) => fn(false));
			if (this.using !== "soundcloud") return;
			const st = useUniverse.getState();
			st.setIsPlaying(false);
			st.setPlaybackStatus("error");
		});
	}
	applyProgress(ms) {
		this.lastPos = ms;
		const dur = this.durationMs > 0 ? this.durationMs : 0;
		useUniverse.getState().setProgress(ms / 1e3, dur / 1e3);
		if (dur > 4e3 && ms >= dur - 350 && useUniverse.getState().isPlaying) {
			if (this.finishGuard === this.loadGen) return;
			this.finishGuard = this.loadGen;
			if (useUniverse.getState().loop) {
				this.widget?.seekTo(0);
				this.widget?.play();
				return;
			}
			this.skip(1);
		}
	}
	whenReady() {
		if (this.ready) return Promise.resolve();
		return new Promise((resolve, reject) => {
			const t = window.setTimeout(() => reject(/* @__PURE__ */ new Error("widget")), 1e4);
			this.waiters.push(() => {
				window.clearTimeout(t);
				resolve();
			});
		});
	}
	attachYoutube(player) {
		this.yt = player;
		this.ytReady = true;
		this.ytWaiters.splice(0).forEach((fn) => fn());
		const { volume, muted } = useUniverse.getState();
		try {
			player.setVolume(muted ? 0 : Math.round(volume * 100));
			if (muted) player.mute();
			else player.unMute();
		} catch {}
	}
	whenYtReady() {
		if (this.ytReady && this.yt) return Promise.resolve();
		return new Promise((resolve, reject) => {
			const t = window.setTimeout(() => reject(/* @__PURE__ */ new Error("yt-widget")), 12e3);
			this.ytWaiters.push(() => {
				window.clearTimeout(t);
				resolve();
			});
		});
	}
	onYoutubeState(data) {
		if (this.using !== "youtube") return;
		const st = useUniverse.getState();
		if (data === 1) {
			this.playWaiters.splice(0).forEach((fn) => fn(true));
			st.setIsPlaying(true);
			st.setPlaybackStatus("playing");
			st.setPlaySource("youtube");
			this.startMeter();
			this.startYtPoll();
			try {
				const d = this.yt?.getDuration() ?? 0;
				if (d > 0) {
					this.durationMs = d * 1e3;
					st.setProgress(this.lastPos / 1e3, d);
				}
			} catch {}
		} else if (data === 2) {
			if (st.playbackStatus === "loading" || st.playbackStatus === "buffering") return;
			st.setIsPlaying(false);
			if (st.playbackStatus === "playing") st.setPlaybackStatus("paused");
		} else if (data === 3) st.setPlaybackStatus("buffering");
		else if (data === 0) {
			if (st.loop) {
				this.yt?.seekTo(0, true);
				this.yt?.playVideo();
				return;
			}
			this.skip(1);
		}
	}
	onYoutubeError(code) {
		if (this.using !== "youtube") return;
		if (code !== 100 && code !== 101 && code !== 150 && code !== 153) return;
		this.playWaiters.splice(0).forEach((fn) => fn(false));
	}
	startYtPoll() {
		this.startPoll();
	}
	async playYoutube(id, bpm, bodyId) {
		if (!this.yt || !this.ytReady) await this.whenYtReady();
		if (!this.yt) throw new Error("no-yt");
		this.using = "youtube";
		this.el?.pause();
		try {
			this.widget?.pause();
		} catch {}
		this.bpm = bpm;
		this.loadGen += 1;
		const gen = this.loadGen;
		this.ytId = id;
		this.lastPos = 0;
		this.durationMs = 0;
		audioEnergy.playingBodyId = bodyId;
		useUniverse.getState().setPlaySource("youtube");
		useUniverse.getState().setPlaybackStatus("loading");
		useUniverse.getState().setProgress(0, 0);
		const { volume, muted } = useUniverse.getState();
		this.yt.setVolume(muted ? 0 : Math.round(volume * 100));
		if (muted) this.yt.mute();
		else this.yt.unMute();
		this.yt.loadVideoById(id, 0);
		this.yt.playVideo();
		const ok = await this.waitForPlay(5e3);
		if (gen !== this.loadGen) return;
		if (!ok) {
			try {
				this.yt.pauseVideo();
			} catch {}
			this.using = null;
			throw new Error("yt-fail");
		}
	}
	unlock() {
		const el = this.ensureEl();
		const AC = window.AudioContext || window.webkitAudioContext;
		if (!this.ctx) this.ctx = new AC({ latencyHint: "playback" });
		if (this.ctx.state === "suspended") this.ctx.resume();
		if (!this.hooked && this.ctx) try {
			const src = this.ctx.createMediaElementSource(el);
			this.analyser = this.ctx.createAnalyser();
			this.analyser.fftSize = 256;
			this.analyser.smoothingTimeConstant = .72;
			src.connect(this.analyser);
			this.analyser.connect(this.ctx.destination);
			this.freq = new Uint8Array(new ArrayBuffer(this.analyser.frequencyBinCount));
			this.hooked = true;
		} catch {}
		this.startMeter();
	}
	startMeter() {
		if (this.meterOn) return;
		this.meterOn = true;
		const tick = () => {
			const playing = useUniverse.getState().isPlaying;
			if (playing && this.analyser && this.freq) {
				this.analyser.getByteFrequencyData(this.freq);
				let bass = 0;
				let mid = 0;
				const n = this.freq.length;
				const bN = Math.max(4, Math.floor(n * .12));
				for (let i = 0; i < bN; i++) bass += this.freq[i] ?? 0;
				for (let i = bN; i < bN * 3; i++) mid += this.freq[i] ?? 0;
				audioEnergy.bass = clamp01(bass / (bN * 220));
				audioEnergy.mid = clamp01(mid / (bN * 2 * 210));
				audioEnergy.level = clamp01(audioEnergy.bass * .7 + audioEnergy.mid * .35);
			} else if (playing && this.using === "youtube") {
				const pulse = .22 + Math.abs(Math.sin(Date.now() / 280)) * .28;
				audioEnergy.level = pulse;
				audioEnergy.bass = pulse * .85;
				audioEnergy.mid = pulse * .55;
			} else if (!playing) {
				audioEnergy.level *= .9;
				audioEnergy.bass *= .9;
				audioEnergy.mid *= .9;
			}
			this.raf = requestAnimationFrame(tick);
		};
		this.raf = requestAnimationFrame(tick);
	}
	startPoll() {
		if (this.poll) return;
		this.poll = window.setInterval(() => {
			const st = useUniverse.getState();
			if (!st.isPlaying && st.playbackStatus !== "loading" && st.playbackStatus !== "buffering") return;
			if (this.using === "youtube" && this.yt) {
				try {
					const t = this.yt.getCurrentTime();
					const d = this.yt.getDuration();
					if (Number.isFinite(t)) this.lastPos = t * 1e3;
					if (Number.isFinite(d) && d > 0) this.durationMs = d * 1e3;
					st.setProgress(t || 0, d || 0);
				} catch {}
				return;
			}
			if (!this.widget || this.using !== "soundcloud") return;
			this.widget.getPosition((ms) => {
				if (typeof ms === "number" && ms >= 0) this.applyProgress(ms);
			});
			this.widget.getDuration((d) => {
				if (d && d !== this.durationMs) {
					this.durationMs = d;
					useUniverse.getState().setProgress(this.lastPos / 1e3, d / 1e3);
				}
			});
		}, 450);
	}
	setVolume(v, muted) {
		const gain = muted ? 0 : Math.min(1, Math.max(0, v));
		if (this.el) this.el.volume = gain;
		try {
			this.widget?.setVolume(Math.round(gain * 100));
		} catch {}
		try {
			if (this.yt) {
				this.yt.setVolume(Math.round(gain * 100));
				if (muted) this.yt.mute();
				else this.yt.unMute();
			}
		} catch {}
	}
	waitForPlay(ms) {
		return new Promise((resolve) => {
			const t = window.setTimeout(() => {
				this.playWaiters = this.playWaiters.filter((fn) => fn !== sink);
				resolve(false);
			}, ms);
			const sink = (ok) => {
				window.clearTimeout(t);
				resolve(ok);
			};
			this.playWaiters.push(sink);
		});
	}
	async playItunes(url, bpm, bodyId) {
		this.unlock();
		this.using = "itunes";
		this.bpm = bpm;
		this.loadGen += 1;
		this.currentUrl = url;
		audioEnergy.playingBodyId = bodyId;
		this.widget?.pause();
		this.yt?.pauseVideo();
		const el = this.ensureEl();
		const { volume, muted } = useUniverse.getState();
		el.volume = muted ? 0 : volume;
		useUniverse.getState().setPlaybackStatus("loading");
		useUniverse.getState().setProgress(0, 30);
		el.src = `/api/audio?src=${encodeURIComponent(url)}`;
		el.currentTime = 0;
		await el.play();
	}
	async playSoundCloud(url, bpm, bodyId) {
		await this.whenReady();
		if (!this.widget) throw new Error("no-widget");
		this.using = "soundcloud";
		this.el?.pause();
		this.yt?.pauseVideo();
		if (this.currentUrl === url && this.durationMs > 0) {
			this.bpm = bpm;
			audioEnergy.playingBodyId = bodyId;
			useUniverse.getState().setPlaybackStatus("buffering");
			this.widget.play();
			if (!await this.waitForPlay(3500)) this.widget.play();
			return;
		}
		this.bpm = bpm;
		this.loadGen += 1;
		const gen = this.loadGen;
		this.finishGuard = 0;
		this.lastPos = 0;
		this.durationMs = 0;
		this.currentUrl = url;
		const { volume, muted } = useUniverse.getState();
		this.widget.setVolume(muted ? 0 : Math.round(volume * 100));
		useUniverse.getState().setProgress(0, 0);
		useUniverse.getState().setPlaybackStatus("loading");
		audioEnergy.playingBodyId = bodyId;
		this.startPoll();
		const playGate = this.waitForPlay(14e3);
		await new Promise((resolve, reject) => {
			const timeout = window.setTimeout(() => reject(/* @__PURE__ */ new Error("timeout")), 14e3);
			this.widget.load(url, {
				auto_play: true,
				show_artwork: false,
				buying: false,
				sharing: false,
				download: false,
				show_user: false,
				hide_related: true,
				visual: false,
				callback: () => {
					if (gen !== this.loadGen) return;
					window.clearTimeout(timeout);
					this.widget.getDuration((d) => {
						this.durationMs = d || 0;
						useUniverse.getState().setProgress(this.lastPos / 1e3, (d || 0) / 1e3);
					});
					this.widget.setVolume(muted ? 0 : Math.round(volume * 100));
					resolve();
				}
			});
		});
		if (gen !== this.loadGen) return;
		if (useUniverse.getState().isPlaying) {
			useUniverse.getState().setPlaybackStatus("playing");
			return;
		}
		useUniverse.getState().setPlaybackStatus("buffering");
		this.widget.play();
		let started = await Promise.race([playGate, this.waitForPlay(2800)]);
		if (gen !== this.loadGen) return;
		if (useUniverse.getState().isPlaying) return;
		if (!started) {
			this.widget.play();
			started = await this.waitForPlay(3200);
		}
		if (gen !== this.loadGen) return;
		if (!started) {
			if (await new Promise((resolve) => {
				window.setTimeout(() => {
					this.widget.isPaused((p) => resolve(p));
				}, 200);
			})) {
				useUniverse.getState().setIsPlaying(false);
				useUniverse.getState().setPlaybackStatus("restricted");
				throw new Error("restricted");
			}
		}
	}
	async play(opts) {
		if (opts.youtubeId) try {
			await this.playYoutube(opts.youtubeId, opts.bpm, opts.bodyId);
			return;
		} catch {}
		if (opts.previewUrl) {
			useUniverse.getState().setPlaySource("itunes");
			await this.playItunes(opts.previewUrl, opts.bpm, opts.bodyId);
			return;
		}
		if (opts.scUrl) {
			useUniverse.getState().setPlaySource("soundcloud");
			await this.playSoundCloud(opts.scUrl, opts.bpm, opts.bodyId);
			return;
		}
		throw new Error("no-source");
	}
	pause() {
		if (this.using === "itunes") {
			this.el?.pause();
			useUniverse.getState().setIsPlaying(false);
			useUniverse.getState().setPlaybackStatus("paused");
			return;
		}
		if (this.using === "youtube") {
			this.yt?.pauseVideo();
			useUniverse.getState().setIsPlaying(false);
			useUniverse.getState().setPlaybackStatus("paused");
			return;
		}
		this.widget?.pause();
		useUniverse.getState().setIsPlaying(false);
		useUniverse.getState().setPlaybackStatus("paused");
	}
	toggle() {
		const st = useUniverse.getState();
		if (st.isPlaying) {
			this.pause();
			return;
		}
		if (this.using === "youtube" && this.ytId) {
			this.yt?.playVideo();
			return;
		}
		if (this.using === "itunes" && this.el?.src) {
			this.unlock();
			st.setPlaybackStatus("buffering");
			this.el.play();
			return;
		}
		if (!st.nowPlaying) return;
		playCatalogTrack(st.nowPlaying.bodyId, st.nowPlaying.track.title);
	}
	seek(t) {
		if (!Number.isFinite(t)) return;
		if (this.using === "youtube" && this.yt) {
			this.yt.seekTo(t, true);
			this.lastPos = t * 1e3;
			useUniverse.getState().setProgress(t, this.durationMs / 1e3);
			return;
		}
		if (this.using === "itunes" && this.el) {
			this.el.currentTime = t;
			this.lastPos = t * 1e3;
			useUniverse.getState().setProgress(t, this.durationMs / 1e3);
			return;
		}
		if (!this.widget) return;
		this.widget.seekTo(t * 1e3);
		this.lastPos = t * 1e3;
		useUniverse.getState().setProgress(t, this.durationMs / 1e3);
	}
	async skip(dir) {
		const st = useUniverse.getState();
		const np = st.nowPlaying;
		if (!np) return;
		const body = bodyById(np.bodyId);
		if (!body) return;
		const idx = body.tracks.findIndex((t) => t.title === np.track.title);
		if (idx < 0) return;
		for (let step = 1; step <= body.tracks.length; step++) {
			const next = body.tracks[(idx + dir * step + body.tracks.length * 8) % body.tracks.length];
			if (!next) continue;
			const yt = youtubeIdFor(next.title);
			const preview = st.itunesByTitle[next.title];
			const hit = st.scByTitle[next.title];
			if (!yt && !preview && !hit?.permalink) continue;
			if (!yt && hit?.policy === "BLOCK" && !preview) continue;
			st.setNowPlaying({
				bodyId: body.id,
				track: next,
				permalink: hit?.permalink ?? null,
				artwork: hit?.artwork ?? null
			});
			st.setPlaybackStatus("loading");
			try {
				await playCatalogTrack(body.id, next.title);
			} catch (err) {
				if ((err instanceof Error ? err.message : "") === "restricted") {
					st.setPlaybackStatus("restricted");
					st.setIsPlaying(false);
					continue;
				}
				st.setIsPlaying(false);
				st.setPlaybackStatus("error");
				continue;
			}
			return;
		}
		st.setIsPlaying(false);
		st.setPlaybackStatus("paused");
		st.setProgress(0, this.durationMs / 1e3);
		audioEnergy.level = 0;
		audioEnergy.bass = 0;
		audioEnergy.playingBodyId = null;
	}
};
var audioEngine = new AudioEngine();
async function playCatalogTrack(bodyId, title) {
	const body = bodyById(bodyId);
	if (!body) return;
	const track = body.tracks.find((t) => t.title === title);
	if (!track) return;
	const st = useUniverse.getState();
	const yt = youtubeIdFor(title);
	let preview = st.itunesByTitle[title] ?? null;
	let hit = st.scByTitle[title] ?? null;
	const pending = preview && hit?.permalink ? null : Promise.all([fetchAlbumTracks(albumQuery(body.name, body.id), body.tracks).catch(() => ({})), fetchPreviews(albumQuery(body.name, body.id), body.tracks).catch(() => ({}))]).then(([sc, itunes]) => {
		useUniverse.getState().setScByTitle(sc);
		useUniverse.getState().setItunesByTitle(itunes);
		return {
			preview: itunes[title] ?? preview,
			hit: sc[title] ?? hit
		};
	});
	st.setNowPlaying({
		bodyId: body.id,
		track,
		permalink: hit?.permalink ?? null,
		artwork: hit?.artwork ?? null
	});
	try {
		await audioEngine.play({
			youtubeId: yt,
			previewUrl: preview,
			scUrl: hit?.permalink ?? null,
			bpm: body.bpm,
			bodyId: body.id
		});
	} catch (err) {
		const fb = pending ? await pending : null;
		const nextPreview = fb?.preview ?? preview;
		const nextHit = fb?.hit ?? hit;
		if (!nextPreview && !nextHit?.permalink) throw err;
		useUniverse.getState().setNowPlaying({
			bodyId: body.id,
			track,
			permalink: nextHit?.permalink ?? null,
			artwork: nextHit?.artwork ?? null
		});
		await audioEngine.play({
			previewUrl: nextPreview,
			scUrl: nextHit?.permalink ?? null,
			bpm: body.bpm,
			bodyId: body.id
		});
	}
}
var DB_NAME = "xo-universe-covers";
var STORE = "covers";
var MAX_EDGE = 1024;
var ACCEPT = /^image\/(jpeg|jpg|png|webp|gif|bmp|avif)$/i;
function openDb() {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open(DB_NAME, 1);
		req.onupgradeneeded = () => {
			if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
		};
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}
function txDone(tx) {
	return new Promise((resolve, reject) => {
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
		tx.onabort = () => reject(tx.error);
	});
}
function isImageFile(file) {
	if (ACCEPT.test(file.type)) return true;
	return /\.(jpe?g|png|webp|gif|bmp|avif)$/i.test(file.name);
}
async function readAllCovers() {
	try {
		const db = await openDb();
		return await new Promise((resolve, reject) => {
			const tx = db.transaction(STORE, "readonly");
			const req = tx.objectStore(STORE).getAllKeys();
			req.onsuccess = () => {
				const keys = req.result;
				if (!keys.length) {
					resolve({});
					return;
				}
				const out = {};
				let left = keys.length;
				keys.forEach((key) => {
					const get = tx.objectStore(STORE).get(key);
					get.onsuccess = () => {
						const val = get.result;
						if (val instanceof Blob) out[String(key)] = val;
						left -= 1;
						if (left === 0) resolve(out);
					};
					get.onerror = () => {
						left -= 1;
						if (left === 0) resolve(out);
					};
				});
			};
			req.onerror = () => reject(req.error);
		});
	} catch {
		return {};
	}
}
async function writeCover(id, blob) {
	const tx = (await openDb()).transaction(STORE, "readwrite");
	tx.objectStore(STORE).put(blob, id);
	await txDone(tx);
}
async function deleteCover(id) {
	const tx = (await openDb()).transaction(STORE, "readwrite");
	tx.objectStore(STORE).delete(id);
	await txDone(tx);
}
async function fileToCoverBlob(file) {
	if (!isImageFile(file)) throw new Error("pictures-only");
	const bitmap = await createImageBitmap(file);
	const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
	const w = Math.max(1, Math.round(bitmap.width * scale));
	const h = Math.max(1, Math.round(bitmap.height * scale));
	const canvas = document.createElement("canvas");
	canvas.width = w;
	canvas.height = h;
	const ctx = canvas.getContext("2d");
	if (!ctx) {
		bitmap.close();
		throw new Error("canvas");
	}
	ctx.drawImage(bitmap, 0, 0, w, h);
	bitmap.close();
	const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", .88));
	if (!blob) throw new Error("encode");
	return blob;
}
var BOOT_LYRICS = [
	{
		line: "I can't feel my face when I'm with you",
		song: "Can't Feel My Face"
	},
	{
		line: "Tell them that it's after hours",
		song: "After Hours"
	},
	{
		line: "I was never there",
		song: "I Was Never There"
	},
	{
		line: "Save your tears for another day",
		song: "Save Your Tears"
	},
	{
		line: "Look what you've done",
		song: "Starboy"
	},
	{
		line: "You've been in the dark for way too long",
		song: "Dawn FM"
	},
	{
		line: "I just want to tell you I come from a city",
		song: "House of Balloons / Glass Table Girls"
	},
	{
		line: "In your eyes I see there's something burning inside you",
		song: "In Your Eyes"
	},
	{
		line: "Heaven or Las Vegas",
		song: "Heaven or Las Vegas"
	},
	{
		line: "I can't wait to get there",
		song: "I Can't Wait To Get There"
	},
	{
		line: "I'm the drone, I'm the drone",
		song: "The Hills"
	},
	{
		line: "I got you, I got you",
		song: "Wicked Games"
	}
];
function XoMark({ size = 40, className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `xo-mark ${className}`,
		style: {
			width: size,
			height: Math.round(size * 1.05)
		},
		"aria-hidden": true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: "/xo-logo.png",
			alt: "",
			draggable: false
		})
	});
}
function XoHero({ className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `xo-hero ${className}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: "/xo-logo.png",
			alt: "XO",
			draggable: false
		})
	});
}
var stars = Array.from({ length: 56 }, (_, i) => ({
	left: i * 47 % 100 + i % 7,
	top: i * 29 % 100 + i % 5,
	delay: i % 9 * .12
}));
function BootScreen() {
	const enter = useUniverse((s) => s.enter);
	const progress = useUniverse((s) => s.bootProgress);
	const label = useUniverse((s) => s.bootLabel);
	const ready = useUniverse((s) => s.bootReady);
	const [lyric, setLyric] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		const id = window.setInterval(() => {
			setLyric((n) => (n + 1) % BOOT_LYRICS.length);
		}, 4800);
		return () => window.clearInterval(id);
	}, []);
	const verse = BOOT_LYRICS[lyric] ?? BOOT_LYRICS[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "absolute inset-0 z-30 flex flex-col items-center justify-center bg-bg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "boot-stars pointer-events-none absolute inset-0",
				children: stars.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: {
					left: `${s.left % 100}%`,
					top: `${s.top % 100}%`,
					animationDelay: `${s.delay}s`
				} }, i))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-[11px] tracking-[0.42em] text-muted",
				children: "Nine eras · one orbit"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XoHero, { className: "mt-5" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display mt-3 text-lg tracking-[0.42em] text-muted",
				children: "Universe"
			}),
			!ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "boot-load",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "boot-meter",
						"aria-hidden": true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { width: `${Math.min(100, progress)}%` } })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "boot-pct",
						children: [Math.min(100, Math.round(progress)), "%"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "boot-label",
						children: label
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "hud-hot enter-btn",
				onClick: () => {
					audioEngine.unlock();
					sfx.unlock();
					enter();
				},
				children: "Enter the night"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("blockquote", {
				className: "boot-lyric",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: verse.line }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("cite", { children: verse.song })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "absolute bottom-6 px-6 text-center text-[10px] tracking-[0.16em] text-subtle",
				children: "Fan project. Not affiliated with The Weeknd or XO."
			})
		]
	});
}
function CoverUpload({ id, compact }) {
	const input = (0, import_react.useRef)(null);
	const custom = useUniverse((s) => s.customCovers[id]);
	const setCustomCover = useUniverse((s) => s.setCustomCover);
	const clearCustomCover = useUniverse((s) => s.clearCustomCover);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const onFile = async (file) => {
		if (!file || busy) return;
		setBusy(true);
		try {
			const blob = await fileToCoverBlob(file);
			await writeCover(id, blob);
			setCustomCover(id, URL.createObjectURL(blob));
		} catch {} finally {
			setBusy(false);
			if (input.current) input.current.value = "";
		}
	};
	const reset = async (e) => {
		e.preventDefault();
		e.stopPropagation();
		await deleteCover(id);
		clearCustomCover(id);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `cover-upload ${compact ? "is-compact" : ""} ${busy ? "is-busy" : ""}`,
		onClick: (e) => e.stopPropagation(),
		onPointerDown: (e) => e.stopPropagation(),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: input,
				type: "file",
				accept: "image/jpeg,image/png,image/webp,image/gif,image/avif,.jpg,.jpeg,.png,.webp,.gif",
				className: "sr-only",
				tabIndex: -1,
				"aria-hidden": true,
				onChange: (e) => void onFile(e.target.files?.[0])
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "cover-upload-btn",
				"aria-label": "Upload cover picture",
				disabled: busy,
				onClick: () => input.current?.click(),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, { className: compact ? "size-3.5" : "size-4" })
			}),
			custom ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "cover-upload-btn",
				"aria-label": "Reset cover",
				onClick: (e) => void reset(e),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: compact ? "size-3.5" : "size-4" })
			}) : null
		]
	});
}
function CreditsCarousel() {
	const open = useUniverse((s) => s.creditsOpen);
	const toggle = useUniverse((s) => s.toggleCredits);
	const select = useUniverse((s) => s.select);
	const customCovers = useUniverse((s) => s.customCovers);
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "credits-scrim",
		role: "dialog",
		"aria-label": "D4DVSN times XO",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": "Close",
				className: "icon-btn absolute right-4 top-4 size-11",
				onClick: () => toggle(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute left-1/2 top-8 z-10 -translate-x-1/2 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-[11px] tracking-[0.4em] text-muted",
						children: "Created by"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex items-center justify-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-display text-2xl tracking-[0.22em]",
								children: "D4DVSN"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted",
								children: "×"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex items-center gap-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(XoMark, { size: 36 })
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-subtle",
						children: "Upload a picture to custom any cover"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-[10px] tracking-wide text-subtle",
						children: "Fan project. Not affiliated with The Weeknd or XO."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "xo-wrapper",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "xo-inner",
					style: { ["--quantity"]: CAROUSEL.length },
					children: CAROUSEL.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						role: "button",
						tabIndex: 0,
						className: "xo-card",
						style: {
							["--index"]: i,
							["--color-card"]: c.rgb
						},
						onClick: () => {
							select(c.id);
							toggle(false);
						},
						onKeyDown: (e) => {
							if (e.key !== "Enter" && e.key !== " ") return;
							e.preventDefault();
							select(c.id);
							toggle(false);
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: customCovers[c.id] ?? c.cover,
								alt: c.label,
								className: "img",
								draggable: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoverUpload, { id: c.id }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "caption",
								children: c.label
							})
						]
					}, c.id))
				})
			})
		]
	});
}
function Header() {
	const showOrbits = useUniverse((s) => s.showOrbits);
	const showLabels = useUniverse((s) => s.showLabels);
	const paused = useUniverse((s) => s.orbitsPaused);
	const speed = useUniverse((s) => s.speed);
	const lyricsOpen = useUniverse((s) => s.lyricsOpen);
	const setShowOrbits = useUniverse((s) => s.setShowOrbits);
	const setShowLabels = useUniverse((s) => s.setShowLabels);
	const setOrbitsPaused = useUniverse((s) => s.setOrbitsPaused);
	const setSpeed = useUniverse((s) => s.setSpeed);
	const toggleCredits = useUniverse((s) => s.toggleCredits);
	const toggleLyrics = useUniverse((s) => s.toggleLyrics);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "hud-header pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 px-3 md:px-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => toggleLyrics(),
				className: `hud-hot icon-btn glass ${lyricsOpen ? "is-on" : ""}`,
				"aria-label": "Search songs by remembered lyrics",
				"aria-pressed": lyricsOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquareQuote, { className: "size-4" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => toggleCredits(true),
				className: "hud-hot glass flex items-center gap-2.5 rounded-[22px] py-1.5 pl-2 pr-3.5",
				"aria-label": "XO Universe — open credits",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XoMark, { size: 34 }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-left",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block font-display text-[10px] tracking-[0.32em] text-muted",
						children: "The Weeknd"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display block text-lg tracking-[0.18em] text-fg md:text-xl",
						children: "Universe"
					})]
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "hud-hot glass flex items-center gap-0.5 rounded-[22px] p-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": paused ? "Resume orbits" : "Pause orbits",
					className: "icon-btn",
					onClick: () => setOrbitsPaused(!paused),
					children: paused ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4 translate-x-px" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-pressed": showOrbits,
					"aria-label": "Toggle orbits",
					className: `icon-btn ${showOrbits ? "is-on" : "is-off"}`,
					onClick: () => setShowOrbits(!showOrbits),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Orbit, { className: "size-4" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-pressed": showLabels,
					"aria-label": "Toggle names",
					className: `icon-btn ${showLabels ? "is-on" : "is-off"}`,
					onClick: () => setShowLabels(!showLabels),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "size-4" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "hidden items-center gap-2 px-2 sm:flex",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[10px] uppercase tracking-[0.18em] text-subtle",
						children: "Time"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "range",
						min: .2,
						max: 4,
						step: .1,
						value: speed,
						onChange: (e) => setSpeed(Number(e.target.value)),
						className: "xo-range w-20",
						style: { background: `linear-gradient(to right, rgb(225 6 0) ${(speed - .2) / 3.8 * 100}%, rgba(255,255,255,0.12) ${(speed - .2) / 3.8 * 100}%)` }
					})]
				})
			]
		})]
	});
}
function LyricsSearch() {
	const open = useUniverse((s) => s.lyricsOpen);
	const toggle = useUniverse((s) => s.toggleLyrics);
	const select = useUniverse((s) => s.select);
	const customCovers = useUniverse((s) => s.customCovers);
	const [q, setQ] = (0, import_react.useState)("");
	const [hits, setHits] = (0, import_react.useState)([]);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [hint, setHint] = (0, import_react.useState)("");
	const input = (0, import_react.useRef)(null);
	const gen = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const t = window.setTimeout(() => input.current?.focus(), 80);
		return () => window.clearTimeout(t);
	}, [open]);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const query = q.trim();
		if (query.length < 2) {
			setHits([]);
			setBusy(false);
			setHint("");
			return;
		}
		const local = searchLyrics(query, 5);
		setHits(local);
		setHint(local.length ? "" : "Searching the nights…");
		const id = ++gen.current;
		setBusy(!local.length);
		const timer = window.setTimeout(() => {
			(async () => {
				try {
					const res = await fetch("/api/lyrics", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ q: query })
					});
					if (id !== gen.current) return;
					if (res.ok) {
						const data = await res.json();
						if (data.hits?.length) {
							setHits(data.hits);
							setHint("");
						} else if (!local.length) setHint("Nothing in orbit for that line.");
					} else if (!local.length) setHint("Couldn't reach the archive.");
				} catch {
					if (id !== gen.current) return;
					if (!local.length) setHint("Couldn't reach the archive.");
				} finally {
					if (id === gen.current) setBusy(false);
				}
			})();
		}, 380);
		return () => window.clearTimeout(timer);
	}, [q, open]);
	const pick = (h) => {
		sfx.playHit();
		select(h.bodyId);
		toggle(false);
		playCatalogTrack(h.bodyId, h.title);
	};
	const apply = (line) => {
		setQ(line);
		input.current?.focus();
	};
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "lyrics-scrim",
		role: "dialog",
		"aria-label": "Search by remembered lyrics",
		onClick: () => toggle(false),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "hud-hot lyrics-panel glass-strong",
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "music-head",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "music-kicker",
						children: "Remember a line"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "lyrics-sub",
						children: "Find the song from a half-remembered lyric."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "Close",
						className: "icon-btn size-9",
						onClick: () => toggle(false),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "lyrics-form",
					onSubmit: (e) => {
						e.preventDefault();
						if (hits[0]) pick(hits[0]);
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquareQuote, { className: "size-4 shrink-0 text-muted" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							ref: input,
							value: q,
							onChange: (e) => setQ(e.target.value),
							placeholder: "I can't feel my face when I'm with you",
							"aria-label": "Remembered lyrics",
							autoComplete: "off",
							spellCheck: false
						}),
						q ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "lyrics-clear",
							"aria-label": "Clear",
							onClick: () => setQ(""),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "lyrics-status",
							"aria-hidden": true,
							children: busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : null
						})
					]
				}),
				!q.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "lyrics-chips",
					children: EXAMPLE_QUERIES.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "lyrics-chip",
						onClick: () => apply(line),
						children: line
					}, line))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "lyrics-hint",
					children: hint || (hits.length ? `${hits.length} match${hits.length === 1 ? "" : "es"}` : "")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "lyrics-hits",
					children: hits.map((h, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: `lyrics-hit ${i === 0 ? "is-top" : ""}`,
						onClick: () => pick(h),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: customCovers[h.bodyId] ?? bodyById(h.bodyId)?.cover ?? "",
								alt: "",
								draggable: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0 flex-1 text-left",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block truncate text-sm font-medium",
										children: h.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "mt-0.5 block truncate text-[11px] uppercase tracking-wider text-muted",
										children: [
											h.planet,
											" · ",
											h.album
										]
									}),
									h.line ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "lyrics-line",
										children: [
											"“",
											h.line,
											"”"
										]
									}) : null
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "lyrics-play size-4" })
						]
					}, `${h.bodyId}-${h.title}`))
				})
			]
		})
	});
}
var SIDE_KEY = "xo-mini-player-side";
function readSide() {
	if (typeof window === "undefined") return "left";
	try {
		return localStorage.getItem(SIDE_KEY) === "right" ? "right" : "left";
	} catch {
		return "left";
	}
}
function writeSide(side) {
	try {
		localStorage.setItem(SIDE_KEY, side);
	} catch {}
}
function MiniPlayer() {
	const nowPlaying = useUniverse((s) => s.nowPlaying);
	const isPlaying = useUniverse((s) => s.isPlaying);
	const playbackStatus = useUniverse((s) => s.playbackStatus);
	const selectedId = useUniverse((s) => s.selectedId);
	const select = useUniverse((s) => s.select);
	const progress = useUniverse((s) => s.progress);
	const duration = useUniverse((s) => s.duration);
	const volume = useUniverse((s) => s.volume);
	const muted = useUniverse((s) => s.muted);
	const playSource = useUniverse((s) => s.playSource);
	const setVolume = useUniverse((s) => s.setVolume);
	const setMuted = useUniverse((s) => s.setMuted);
	const customCovers = useUniverse((s) => s.customCovers);
	const [side, setSide] = (0, import_react.useState)("left");
	const [volOpen, setVolOpen] = (0, import_react.useState)(false);
	const wrap = (0, import_react.useRef)(null);
	const drag = (0, import_react.useRef)(null);
	const visible = Boolean(nowPlaying && !selectedId);
	(0, import_react.useEffect)(() => {
		setSide(readSide());
	}, []);
	(0, import_react.useEffect)(() => {
		const root = wrap.current?.parentElement;
		if (!root?.classList.contains("bottom-chrome")) return;
		root.classList.toggle("is-player-end", side === "right");
		return () => root.classList.remove("is-player-end");
	}, [side, visible]);
	(0, import_react.useEffect)(() => {
		if (!volOpen) return;
		const close = (e) => {
			const t = e.target;
			if (wrap.current && t && wrap.current.contains(t)) return;
			setVolOpen(false);
		};
		window.addEventListener("pointerdown", close);
		return () => window.removeEventListener("pointerdown", close);
	}, [volOpen]);
	(0, import_react.useEffect)(() => {
		if (!visible) return;
		const el = wrap.current;
		if (!el) return;
		const down = (e) => {
			if (e.target.closest("button, a, input, .mini-vol")) return;
			drag.current = {
				x: e.clientX,
				moved: false
			};
		};
		const move = (e) => {
			if (!drag.current) return;
			if (Math.abs(e.clientX - drag.current.x) > 12) drag.current.moved = true;
		};
		const up = (e) => {
			if (!drag.current) return;
			if (drag.current.moved) {
				const next = e.clientX > window.innerWidth * .5 ? "right" : "left";
				setSide(next);
				writeSide(next);
			}
			drag.current = null;
		};
		el.addEventListener("pointerdown", down);
		window.addEventListener("pointermove", move);
		window.addEventListener("pointerup", up);
		return () => {
			el.removeEventListener("pointerdown", down);
			window.removeEventListener("pointermove", move);
			window.removeEventListener("pointerup", up);
		};
	}, [visible]);
	if (!nowPlaying || selectedId) return null;
	const body = bodyById(nowPlaying.bodyId);
	if (!body) return null;
	const pct = duration > 0 ? Math.min(100, progress / duration * 100) : 0;
	const waiting = playbackStatus === "loading" || playbackStatus === "buffering";
	const cover = customCovers[body.id] || nowPlaying.artwork || body.cover;
	const album = body.id === "sun" ? "XO" : body.name;
	const sub = playbackStatus === "restricted" ? "Restricted · try another track" : waiting ? "Buffering…" : playSource === "youtube" ? `${body.planet} · video` : `${body.planet} · ${album}`;
	const setGain = (v) => {
		const next = Math.min(1, Math.max(0, v));
		setVolume(next);
		setMuted(next === 0);
		audioEngine.setVolume(next, next === 0);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: wrap,
		className: `hud-hot mini-player glass-strong ${side === "right" ? "is-end" : ""}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "size-11 shrink-0 overflow-hidden rounded-[14px]",
				onClick: () => select(body.id),
				"aria-label": `Open ${body.name}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: cover,
					alt: "",
					className: "size-full object-cover",
					draggable: false
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "min-w-0 flex-1 text-left",
				onClick: () => select(body.id),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-sm font-medium",
						children: nowPlaying.track.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-[11px] text-muted",
						children: sub
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mini-progress",
						"aria-hidden": true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { width: `${pct}%` } })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: `mini-vol ${volOpen ? "is-open" : ""}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "icon-btn size-9",
					"aria-label": muted || volume === 0 ? "Unmute" : "Volume",
					"aria-expanded": volOpen,
					onClick: () => {
						if (volOpen) {
							if (!(muted || volume === 0)) {
								setMuted(true);
								audioEngine.setVolume(volume, true);
							} else {
								const v = volume > 0 ? volume : .7;
								setVolume(v);
								setMuted(false);
								audioEngine.setVolume(v, false);
							}
						} else setVolOpen(true);
					},
					children: muted || volume === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-3.5" })
				}), volOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mini-vol-pop glass-strong",
					onPointerDown: (e) => e.stopPropagation(),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "range",
						min: 0,
						max: 1,
						step: .01,
						value: muted ? 0 : volume,
						"aria-label": "Volume",
						className: "xo-range mini-vol-range",
						style: { background: `linear-gradient(to right, rgb(225 6 0) ${(muted ? 0 : volume) * 100}%, rgba(255,255,255,0.12) ${(muted ? 0 : volume) * 100}%)` },
						onChange: (e) => setGain(Number(e.target.value))
					})
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "icon-btn size-9",
				"aria-label": "Previous",
				onClick: () => void audioEngine.skip(-1),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipBack, { className: "size-3.5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "play-fab size-10",
				"aria-label": isPlaying ? "Pause" : "Play",
				onClick: () => {
					if (!isPlaying && playbackStatus !== "paused") {
						playCatalogTrack(body.id, nowPlaying.track.title);
						return;
					}
					audioEngine.toggle();
				},
				children: waiting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3.5 animate-spin" }) : isPlaying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-3.5 translate-x-px" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "icon-btn size-9",
				"aria-label": "Next",
				onClick: () => void audioEngine.skip(1),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipForward, { className: "size-3.5" })
			})
		]
	});
}
function fmt(t) {
	if (!Number.isFinite(t) || t < 0) return "0:00";
	return `${Math.floor(t / 60)}:${Math.floor(t % 60).toString().padStart(2, "0")}`;
}
function displayTitle(title) {
	if (title === "I Can't Fucking Sing") return "I Can't F***ing Sing";
	return title;
}
function MusicCard() {
	const selectedId = useUniverse((s) => s.selectedId);
	const select = useUniverse((s) => s.select);
	const body = bodyById(selectedId);
	const nowPlaying = useUniverse((s) => s.nowPlaying);
	const isPlaying = useUniverse((s) => s.isPlaying);
	const playbackStatus = useUniverse((s) => s.playbackStatus);
	const progress = useUniverse((s) => s.progress);
	const duration = useUniverse((s) => s.duration);
	const volume = useUniverse((s) => s.volume);
	const muted = useUniverse((s) => s.muted);
	const loop = useUniverse((s) => s.loop);
	const playSource = useUniverse((s) => s.playSource);
	const setVolume = useUniverse((s) => s.setVolume);
	const setMuted = useUniverse((s) => s.setMuted);
	const setLoop = useUniverse((s) => s.setLoop);
	const scByTitle = useUniverse((s) => s.scByTitle);
	const setScByTitle = useUniverse((s) => s.setScByTitle);
	const setItunesByTitle = useUniverse((s) => s.setItunesByTitle);
	const itunesByTitle = useUniverse((s) => s.itunesByTitle);
	const libraryStatus = useUniverse((s) => s.libraryStatus);
	const setLibraryStatus = useUniverse((s) => s.setLibraryStatus);
	const customCover = useUniverse((s) => selectedId ? s.customCovers[selectedId] : void 0);
	const [err, setErr] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!body) return;
		let cancelled = false;
		setLibraryStatus("loading");
		setErr(null);
		Promise.all([fetchAlbumTracks(albumQuery(body.name, body.id), body.tracks).catch(() => ({})), fetchPreviews(albumQuery(body.name, body.id), body.tracks).catch(() => ({}))]).then(([sc, itunes]) => {
			if (cancelled) return;
			setScByTitle(sc);
			setItunesByTitle(itunes);
			setLibraryStatus("ready");
		}).catch(() => {
			if (cancelled) return;
			setLibraryStatus("error");
		});
		return () => {
			cancelled = true;
		};
	}, [
		body,
		setLibraryStatus,
		setScByTitle,
		setItunesByTitle
	]);
	const activeTitle = nowPlaying?.track.title;
	const onThisBody = nowPlaying?.bodyId === body?.id;
	const playingHere = onThisBody && isPlaying;
	const waiting = onThisBody && (playbackStatus === "loading" || playbackStatus === "buffering");
	const found = (0, import_react.useMemo)(() => {
		if (!body) return 0;
		return body.tracks.filter((t) => hitUsable(scByTitle[t.title]) || itunesByTitle[t.title]).length;
	}, [
		body,
		scByTitle,
		itunesByTitle
	]);
	const coverSrc = customCover || (onThisBody && nowPlaying?.artwork ? nowPlaying.artwork : body?.cover ?? "");
	const currentPermalink = onThisBody && nowPlaying?.permalink ? nowPlaying.permalink : body ? scByTitle[body.tracks[0]?.title ?? ""]?.permalink : null;
	const scCurrent = body ? soundcloudUrl(onThisBody && nowPlaying ? nowPlaying.track.title : body.tracks[0]?.title ?? body.name, currentPermalink) : "#";
	const ytId = onThisBody && nowPlaying ? youtubeIdFor(nowPlaying.track.title) : null;
	const statusLine = () => {
		if (waiting) return playbackStatus === "loading" ? "Loading…" : "Buffering…";
		if (onThisBody && playbackStatus === "restricted") return "Restricted — try another track";
		if (onThisBody && playbackStatus === "error") return "Couldn't stream this one";
		if (onThisBody && isPlaying) return playSource === "youtube" ? "Playing · video" : playSource === "itunes" ? "Preview" : "Playing";
		return `${body?.tracks.length ?? 0} tracks`;
	};
	const play = async (title) => {
		if (!body) return;
		setErr(null);
		sfx.playHit();
		try {
			await playCatalogTrack(body.id, title);
		} catch (e) {
			if ((e instanceof Error ? e.message : "") === "restricted") {
				setErr("Restricted in-app — open it on SoundCloud.");
				return;
			}
			setErr("Couldn't load this one — open it on SoundCloud.");
		}
	};
	const toggle = () => {
		if (!nowPlaying && body?.tracks[0]) {
			play(body.tracks[0].title);
			return;
		}
		if (nowPlaying && !isPlaying && playbackStatus === "restricted") {
			play(nowPlaying.track.title);
			return;
		}
		audioEngine.toggle();
	};
	const pct = duration > 0 ? Math.min(100, progress / duration * 100) : 0;
	if (!body) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "hud-hot music-card glass-strong card-enter",
		style: { ["--era"]: body.eraRgb },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "music-head",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "music-kicker",
					children: [body.planet, playingHere ? " · Live" : ""]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "Close",
					className: "icon-btn size-9",
					onClick: () => select(null),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "music-album",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `cover-stack ${playingHere ? "is-on" : ""}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "vinyl" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: coverSrc,
							alt: "",
							className: "cover-art",
							draggable: false
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoverUpload, {
							id: body.id,
							compact: true
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "music-title",
							children: body.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "music-artist",
							children: "The Weeknd"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "music-meta",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "music-planet",
									children: body.id === "sun" ? "Center" : body.planet
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [" · ", body.year] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									" · ",
									body.tracks.length,
									" tracks"
								] })
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "player-well mt-3 rounded-[20px] px-3 py-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "wave-strip",
						"aria-hidden": true,
						children: Array.from({ length: 36 }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {
							className: playingHere ? "is-live" : "",
							style: {
								animationDelay: `${i % 9 * 70}ms`,
								height: `${28 + i * 37 % 72}%`
							}
						}, i))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "now-copy min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-sm font-medium",
							children: onThisBody ? displayTitle(nowPlaying?.track.title ?? "") : "Pick a track"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-muted",
							children: err ?? statusLine()
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "player-row flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "icon-btn size-9",
								"aria-label": "Previous",
								onClick: () => void audioEngine.skip(-1),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipBack, { className: "size-3.5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: `play-fab ${waiting ? "is-wait" : ""}`,
								onClick: toggle,
								"aria-label": isPlaying ? "Pause" : "Play",
								children: waiting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : isPlaying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4 translate-x-px" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "icon-btn size-9",
								"aria-label": "Next",
								onClick: () => void audioEngine.skip(1),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipForward, { className: "size-3.5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "ml-auto flex items-center gap-1",
								children: [
									!ytId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										className: "icon-btn size-9",
										href: scCurrent,
										target: "_blank",
										rel: "noreferrer",
										"aria-label": "Open on SoundCloud",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AudioLines, { className: "size-3.5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: `icon-btn size-9 ${loop ? "is-on" : "is-off"}`,
										"aria-pressed": loop,
										"aria-label": "Loop",
										onClick: () => setLoop(!loop),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Repeat, { className: "size-3.5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "icon-btn size-9",
										onClick: () => {
											const shouldMute = !muted;
											setMuted(shouldMute);
											audioEngine.setVolume(volume > 0 ? volume : .7, shouldMute);
											if (!shouldMute && volume === 0) setVolume(.7);
										},
										"aria-label": muted ? "Unmute" : "Mute",
										children: muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" })
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2.5 flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-8 text-[10px] tabular-nums text-subtle",
								children: fmt(progress)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "range",
								min: 0,
								max: 100,
								value: pct,
								className: "xo-range flex-1",
								style: { background: `linear-gradient(to right, rgb(225 6 0) ${pct}%, rgba(255,255,255,0.12) ${pct}%)` },
								onChange: (e) => {
									if (!duration) return;
									audioEngine.seek(Number(e.target.value) / 100 * duration);
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-8 text-right text-[10px] tabular-nums text-subtle",
								children: duration ? fmt(duration) : "—"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "mt-1.5 flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-subtle",
						children: ["Vol", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "range",
							min: 0,
							max: 1,
							step: .01,
							value: muted ? 0 : volume,
							className: "xo-range flex-1",
							style: { background: `linear-gradient(to right, rgb(225 6 0) ${(muted ? 0 : volume) * 100}%, rgba(255,255,255,0.12) ${(muted ? 0 : volume) * 100}%)` },
							onChange: (e) => {
								const v = Number(e.target.value);
								setVolume(v);
								setMuted(v === 0);
								audioEngine.setVolume(v, v === 0);
							}
						})]
					}),
					playbackStatus === "restricted" && onThisBody && !ytId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						className: "sc-fallback",
						href: scCurrent,
						target: "_blank",
						rel: "noreferrer",
						children: "Open on SoundCloud"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "sc-chip mt-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AudioLines, { className: "size-3" }), libraryStatus === "loading" ? "Matching tracks…" : libraryStatus === "error" ? "Using cached previews" : playSource === "youtube" ? "Playing in the app" : `${found} ready to play`]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "music-tracks scrollbar-thin",
				children: [
					libraryStatus === "loading" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "lib-status",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "shimmer-text",
							children: "Tuning the album…"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-subtle",
							children: "Finding playable previews."
						})]
					}),
					err && libraryStatus !== "loading" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-3 py-1 text-xs text-accent",
						children: err
					}),
					body.tracks.map((t, i) => {
						const hit = scByTitle[t.title];
						const preview = itunesByTitle[t.title];
						const on = activeTitle === t.title && onThisBody;
						const blocked = hit?.policy === "BLOCK" && !preview;
						const label = on ? waiting ? "Buffering…" : isPlaying ? "Now playing" : playbackStatus === "restricted" ? "Restricted" : "Paused" : blocked ? "Restricted" : preview ? "Play preview" : hitUsable(hit) ? hit?.policy === "SNIP" ? "Preview" : "Play" : libraryStatus === "ready" ? "Search fallback" : "…";
						const durLabel = preview && !hit?.duration ? "0:30" : formatTrackTime(hit?.duration ?? 0) || (on && duration ? fmt(duration) : "—");
						const rowPct = on && duration > 0 ? pct : 0;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `track-row ${on ? "is-on" : ""} ${blocked ? "is-blocked" : ""}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "track-main",
								onClick: () => {
									if (on) {
										audioEngine.toggle();
										return;
									}
									play(t.title);
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "grid size-8 shrink-0 place-items-center rounded-md text-[11px]",
										style: { background: `rgb(${body.eraRgb} / 0.22)` },
										children: on && waiting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3.5 animate-spin" }) : on && isPlaying ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "eq",
											"aria-hidden": true,
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {})
											]
										}) : i + 1
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "min-w-0 flex-1 text-left",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "block truncate text-sm",
												children: displayTitle(t.title)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[11px] text-subtle",
												children: label
											}),
											on ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "track-progress",
												"aria-hidden": true,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { width: `${rowPct}%` } })
											}) : null
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "track-dur",
										children: durLabel
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "play-hint",
										children: on && isPlaying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-3.5 translate-x-px" })
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								className: "yt-link",
								href: soundcloudUrl(t.title, hit?.permalink),
								target: "_blank",
								rel: "noreferrer",
								"aria-label": `Open ${t.title} on SoundCloud`,
								onClick: (e) => e.stopPropagation(),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AudioLines, { className: "size-3.5" })
							})]
						}, t.title);
					})
				]
			})
		]
	});
}
var ndc = new Vector3();
function OrbitLabels() {
	const show = useUniverse((s) => s.showLabels);
	const selectedId = useUniverse((s) => s.selectedId);
	const select = useUniverse((s) => s.select);
	const refs = (0, import_react.useRef)({});
	(0, import_react.useEffect)(() => {
		if (!show || selectedId) return;
		let raf = 0;
		const loop = () => {
			const cam = view.camera;
			const { w, h } = view.size;
			if (cam) {
				const top = 72;
				const bottom = 96;
				const side = 18;
				for (const body of BODIES) {
					const el = refs.current[body.id];
					const pos = bodyPositions.get(body.id);
					if (!el || !pos) continue;
					ndc.copy(pos);
					ndc.y += body.radius + .55;
					ndc.project(cam);
					const x = (ndc.x * .5 + .5) * w;
					const y = (-ndc.y * .5 + .5) * h;
					const vis = ndc.z < 1 && ndc.z > -1 && x > side && x < w - side && y > top && y < h - bottom;
					el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -120%)`;
					el.style.opacity = vis ? "1" : "0";
					el.style.pointerEvents = vis ? "auto" : "none";
				}
			}
			raf = requestAnimationFrame(loop);
		};
		raf = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(raf);
	}, [show, selectedId]);
	if (!show || selectedId) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-none absolute inset-0 z-[5] overflow-hidden",
		children: BODIES.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			ref: (el) => {
				refs.current[b.id] = el;
			},
			className: "orbit-label",
			"aria-label": `${b.planet} — ${b.name}`,
			onClick: (e) => {
				e.stopPropagation();
				select(b.id);
			},
			children: [b.id === "sun" ? "XO" : b.planet, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: b.id === "sun" ? "The Weeknd" : b.name })]
		}, b.id))
	});
}
function PlanetDock() {
	const selectedId = useUniverse((s) => s.selectedId);
	const select = useUniverse((s) => s.select);
	const customCovers = useUniverse((s) => s.customCovers);
	const [live, setLive] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const id = window.setInterval(() => setLive(audioEnergy.playingBodyId), 120);
		return () => window.clearInterval(id);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		"aria-label": "Albums",
		className: "hud-hot planet-dock",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "glass scroller scrollbar-thin",
			children: BODIES.map((b) => {
				const on = selectedId === b.id;
				const playing = live === b.id;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => select(on ? null : b.id),
					className: `dock-item ${on ? "is-on" : ""} ${playing ? "is-live" : ""}`,
					style: { ["--era"]: b.eraRgb },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "dock-orb",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: customCovers[b.id] ?? b.cover,
							alt: "",
							draggable: false
						}), playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "dock-eq",
							"aria-hidden": true,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {})
							]
						}) : null]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "dock-copy",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "dock-planet",
							children: b.id === "sun" ? "XO" : b.planet
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "dock-album",
							children: b.id === "sun" ? "The Weeknd" : b.name
						})]
					})]
				}, b.id);
			})
		})
	});
}
var PRIME = "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/theweeknd/blinding-lights&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&visual=false&show_artwork=false";
function loadApi$1() {
	if (window.SC?.Widget) return Promise.resolve();
	return new Promise((resolve, reject) => {
		const existing = document.querySelector("script[data-sc-widget=\"1\"]");
		if (existing) {
			existing.addEventListener("load", () => resolve());
			existing.addEventListener("error", () => reject(/* @__PURE__ */ new Error("sc-script")));
			return;
		}
		const s = document.createElement("script");
		s.src = "https://w.soundcloud.com/player/api.js";
		s.async = true;
		s.dataset.scWidget = "1";
		s.onload = () => resolve();
		s.onerror = () => reject(/* @__PURE__ */ new Error("sc-script"));
		document.head.appendChild(s);
	});
}
function SoundCloudHost() {
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const iframe = ref.current;
		if (!iframe) return;
		let cancelled = false;
		loadApi$1().then(() => {
			if (cancelled || !window.SC?.Widget) return;
			const widget = window.SC.Widget(iframe);
			audioEngine.attach(widget, window.SC.Widget.Events);
		}).catch(() => void 0);
		return () => {
			cancelled = true;
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "sc-host-wrap",
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
			ref,
			id: "sc-widget",
			title: "SoundCloud player",
			allow: "autoplay",
			src: PRIME,
			className: "sc-host",
			"aria-hidden": "true",
			tabIndex: -1,
			inert: true,
			style: {
				position: "fixed",
				left: -12e3,
				top: 0,
				width: 450,
				height: 166,
				opacity: 0,
				pointerEvents: "none",
				border: 0
			}
		})
	});
}
function loadApi() {
	if (window.YT?.Player) return Promise.resolve();
	return new Promise((resolve) => {
		const prev = window.onYouTubeIframeAPIReady;
		window.onYouTubeIframeAPIReady = () => {
			prev?.();
			resolve();
		};
		if (document.querySelector("script[data-yt-api=\"1\"]")) return;
		const s = document.createElement("script");
		s.src = "https://www.youtube.com/iframe_api";
		s.async = true;
		s.dataset.ytApi = "1";
		document.head.appendChild(s);
	});
}
var MIN_W = 200;
var MIN_H = 228;
function limits() {
	return {
		maxW: Math.max(MIN_W, Math.min(window.innerWidth - 16, Math.round(window.innerWidth * .86))),
		maxH: Math.max(MIN_H, Math.min(window.innerHeight - 16, Math.round(window.innerHeight * .72)))
	};
}
function clampBox(b) {
	const { maxW, maxH } = limits();
	const w = Math.min(maxW, Math.max(MIN_W, b.w));
	const h = Math.min(maxH, Math.max(MIN_H, b.h));
	return {
		x: Math.min(Math.max(8, window.innerWidth - w - 8), Math.max(8, b.x)),
		y: Math.min(Math.max(8, window.innerHeight - h - 8), Math.max(8, b.y)),
		w,
		h
	};
}
function defaultBox() {
	const w = Math.min(360, Math.max(MIN_W, window.innerWidth - 32));
	return clampBox({
		x: 16,
		y: window.innerHeight - MIN_H - 96,
		w,
		h: MIN_H
	});
}
function YouTubeHost() {
	const mount = (0, import_react.useRef)(null);
	const player = (0, import_react.useRef)(null);
	const boxRef = (0, import_react.useRef)({
		x: 16,
		y: 80,
		w: 320,
		h: MIN_H
	});
	const [box, setBox] = (0, import_react.useState)(() => {
		if (typeof window === "undefined") return {
			x: 16,
			y: 80,
			w: 320,
			h: MIN_H
		};
		try {
			const raw = localStorage.getItem("xo-yt-box");
			if (raw) {
				const parsed = JSON.parse(raw);
				if (parsed && typeof parsed.w === "number") return clampBox(parsed);
			}
		} catch {}
		return defaultBox();
	});
	boxRef.current = box;
	const [moving, setMoving] = (0, import_react.useState)(false);
	const source = useUniverse((s) => s.playSource);
	const playing = useUniverse((s) => s.isPlaying);
	const creditsOpen = useUniverse((s) => s.creditsOpen);
	const visible = useUniverse((s) => s.entered) && source === "youtube" && !creditsOpen;
	const live = visible && playing;
	const place = (next) => {
		const clamped = clampBox(next);
		boxRef.current = clamped;
		setBox(clamped);
	};
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem("xo-yt-box", JSON.stringify(box));
		} catch {}
		const videoH = Math.max(200, box.h - 28);
		try {
			player.current?.setSize?.(box.w, videoH);
		} catch {}
	}, [box]);
	(0, import_react.useEffect)(() => {
		const el = mount.current;
		if (!el) return;
		let dead = false;
		loadApi().then(() => {
			if (dead || !window.YT?.Player || player.current) return;
			const iframe = document.createElement("iframe");
			iframe.className = "yt-frame";
			iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
			iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture");
			iframe.style.touchAction = "manipulation";
			iframe.src = `https://www.youtube-nocookie.com/embed/4NRXx6U8ABQ?enablejsapi=1&playsinline=1&rel=0&modestbranding=1&controls=1&fs=0&origin=${encodeURIComponent(window.location.origin)}`;
			el.appendChild(iframe);
			player.current = new window.YT.Player(iframe, {
				height: "200",
				width: "320",
				events: {
					onReady: (e) => {
						try {
							e.target.pauseVideo();
						} catch {}
						const videoH = Math.max(200, boxRef.current.h - 28);
						e.target.setSize?.(boxRef.current.w, videoH);
						audioEngine.attachYoutube(e.target);
					},
					onStateChange: (e) => audioEngine.onYoutubeState(e.data),
					onError: (e) => audioEngine.onYoutubeError(e.data)
				}
			});
		});
		return () => {
			dead = true;
		};
	}, []);
	const drag = (e) => {
		e.preventDefault();
		e.stopPropagation();
		const startX = e.clientX;
		const startY = e.clientY;
		const orig = boxRef.current;
		setMoving(true);
		const move = (ev) => {
			place({
				...orig,
				x: orig.x + ev.clientX - startX,
				y: orig.y + ev.clientY - startY
			});
		};
		const up = () => {
			setMoving(false);
			window.removeEventListener("pointermove", move);
			window.removeEventListener("pointerup", up);
		};
		window.addEventListener("pointermove", move);
		window.addEventListener("pointerup", up);
	};
	const resize = (e) => {
		e.preventDefault();
		e.stopPropagation();
		const startX = e.clientX;
		const startY = e.clientY;
		const orig = boxRef.current;
		setMoving(true);
		const move = (ev) => {
			place({
				...orig,
				w: orig.w + ev.clientX - startX,
				h: orig.h + ev.clientY - startY
			});
		};
		const up = () => {
			setMoving(false);
			window.removeEventListener("pointermove", move);
			window.removeEventListener("pointerup", up);
		};
		window.addEventListener("pointermove", move);
		window.addEventListener("pointerup", up);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `hud-hot yt-dock ${visible ? "is-on" : ""} ${live ? "is-live" : ""} ${moving ? "is-moving" : ""}`,
		style: {
			left: box.x,
			top: box.y,
			width: box.w,
			height: box.h
		},
		"aria-hidden": !visible,
		onPointerDown: (e) => e.stopPropagation(),
		onTouchStart: (e) => e.stopPropagation(),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "yt-grab",
				onPointerDown: drag,
				"aria-label": "Drag video",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "yt-grab-bars" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: mount,
				className: "yt-stage"
			}),
			!live && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "yt-shield",
				"aria-hidden": "true"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "yt-resize",
				onPointerDown: resize,
				role: "separator",
				"aria-orientation": "horizontal",
				"aria-label": "Resize video"
			})
		]
	});
}
function Hud() {
	const entered = useUniverse((s) => s.entered);
	const selectedId = useUniverse((s) => s.selectedId);
	const select = useUniverse((s) => s.select);
	const creditsOpen = useUniverse((s) => s.creditsOpen);
	const lyricsOpen = useUniverse((s) => s.lyricsOpen);
	const toggleCredits = useUniverse((s) => s.toggleCredits);
	const toggleLyrics = useUniverse((s) => s.toggleLyrics);
	const volume = useUniverse((s) => s.volume);
	const muted = useUniverse((s) => s.muted);
	const hydrateCovers = useUniverse((s) => s.hydrateCovers);
	(0, import_react.useEffect)(() => {
		let live = true;
		const urls = [];
		readAllCovers().then((blobs) => {
			if (!live) return;
			const map = {};
			for (const [id, blob] of Object.entries(blobs)) {
				const url = URL.createObjectURL(blob);
				urls.push(url);
				map[id] = url;
			}
			hydrateCovers(map);
		});
		return () => {
			live = false;
			urls.forEach((u) => URL.revokeObjectURL(u));
		};
	}, [hydrateCovers]);
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			if (e.key === "Escape") {
				if (lyricsOpen) toggleLyrics(false);
				else if (creditsOpen) toggleCredits(false);
				else select(null);
				return;
			}
			const t = e.target;
			if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
			if (!entered) return;
			if (e.code === "Space") {
				e.preventDefault();
				audioEngine.toggle();
			}
			if (e.code === "ArrowRight") {
				e.preventDefault();
				audioEngine.skip(1);
			}
			if (e.code === "ArrowLeft") {
				e.preventDefault();
				audioEngine.skip(-1);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [
		creditsOpen,
		entered,
		lyricsOpen,
		select,
		toggleCredits,
		toggleLyrics
	]);
	(0, import_react.useEffect)(() => {
		const vis = () => {
			if (document.visibilityState === "visible") audioEngine.unlock();
		};
		document.addEventListener("visibilitychange", vis);
		return () => document.removeEventListener("visibilitychange", vis);
	}, []);
	(0, import_react.useEffect)(() => {
		if (entered) {
			audioEngine.setVolume(volume, muted);
			sfx.setGain(muted ? 0 : volume * .42);
		}
	}, [
		entered,
		volume,
		muted
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SoundCloudHost, {}), !entered ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BootScreen, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `hud ${selectedId ? "is-selected" : ""} ${creditsOpen ? "is-credits" : ""}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrbitLabels, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LyricsSearch, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YouTubeHost, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MusicCard, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bottom-chrome",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniPlayer, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlanetDock, {})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditsCarousel, {})
		]
	})] });
}
function yieldFrame() {
	return new Promise((resolve) => {
		requestAnimationFrame(() => resolve());
	});
}
function loadImage(src) {
	return new Promise((resolve) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => resolve();
		img.onerror = () => resolve();
		img.src = src;
	});
}
async function preloadAssets() {
	const setBoot = useUniverse.getState().setBoot;
	setBoot(22, "Opening the night", false);
	await yieldFrame();
	setBoot(64, "Cueing the system", false);
	const first = BODIES.slice(0, 3).map((b) => loadImage(b.cover));
	await Promise.race([Promise.all(first), new Promise((r) => window.setTimeout(r, 180))]);
	Promise.all(BODIES.map((b) => loadImage(b.cover)));
	await yieldFrame();
	setBoot(100, "Ready", true);
}
var routes_exports = /* @__PURE__ */ __exportAll({ component: () => Home });
var Universe = (0, import_react.lazy)(() => import("./Universe-B2FWQfPv.mjs"));
function Home() {
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setReady(true), []);
	(0, import_react.useEffect)(() => {
		import("./Universe-B2FWQfPv.mjs");
		preloadAssets();
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "app-shell",
		children: [ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
			fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-full w-full bg-bg" }),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Universe, {})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-full w-full bg-bg" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hud, {})]
	});
}
//#endregion
export { minZoomDistance as a, framingDistance as i, audioEnergy as n, view as o, bodyPositions as r, useUniverse as s, routes_exports as t };
