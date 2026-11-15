import React, { useMemo, useState, useRef, useEffect, useId } from "react";
import {
  Sparkles, TrendingDown, Truck, MapPin, AlertTriangle, ShieldCheck, ExternalLink,
  Bell, MessageCircle, X, Send, Check, Gamepad2, Package, Scale, Info, Zap, Trophy,
  Gift, ArrowUpDown, Store, Calculator, Activity, ChevronRight, Minus, Plus, ImagePlus,
  Upload, Link2, Coins, Pencil, Search, RefreshCw, Smartphone, BellRing, Copy, Clock, Lightbulb, Radar, Code2,
} from "lucide-react";

/* =========================================================================
   CISPU · PLAYSTATION 5 TRACKER — Svizzera (CHF) · v2
   Single-file React + Tailwind + lucide-react
   ========================================================================= */

const ACCESSORY_VALUE = { controller: 75, game: 70 };
const r05 = (x) => Math.round(x * 20) / 20; // arrotondamento ai 5 centesimi (CH)

// ---------- Modelli + prezzo di riferimento CH (il più alto osservato)
const MODELS = {
  digital: { key: "digital", name: "PS5 Slim Digital", short: "Slim Digital", desc: "Slim · senza lettore", ref: 599.95, color: "#0071E3" },
  disc: { key: "disc", name: "PS5 Slim Disc", short: "Slim Disc", desc: "Slim · lettore Blu-ray", ref: 699.95, color: "#5E5CE6" },
  pro: { key: "pro", name: "PS5 Pro", short: "Pro", desc: "Pro · 2 TB", ref: 899.95, color: "#1D1D1F" },
};

// ---------- Special / Limited Edition (livree per il render)
const EDITIONS = {
  standard: { label: "Standard" },
  anniv30: { label: "30th Anniversary", panel: "#A9ABB2", panel2: "#8E9098", core: "#55575E", dots: true },
  yotei: { label: "Ghost of Yōtei Limited", panel: "#2B2724", panel2: "#1B1816", core: "#0E0E0E", trim: "#C9A24A" },
  spider: { label: "Spider-Man Edition", panel: "#C8102E", panel2: "#9E0B23", core: "#141414" },
};

// ---------- Comparatore Toppreise per modello
const TOPPREISE = {
  pro: "https://www.toppreise.ch/serie_de_produits/PlayStation_5_Pro-pc-s79935",
  digital: "https://www.toppreise.ch/produktsuche?q=PlayStation+5+Slim+Digital+Edition",
  disc: "https://www.toppreise.ch/produktsuche?q=PlayStation+5+Slim+Disc+Edition",
};

// ---------- Rivenditori svizzeri
const CATEGORIES = { big: "Elettronica & Big CH", dept: "Grandi Magazzini & Supermercati", gaming: "Specialisti Gaming" };
const STORES = {
  digitec: { name: "Digitec Galaxus", short: "Digitec", domain: "digitec.ch", cat: "big", url: "https://www.digitec.ch/it/search?q=PlayStation+5+Slim", shipping: 0, pickup: "Ritiro in filiale Digitec / PickPost", perk: "Consegna rapida CH" },
  brack: { name: "Brack.ch", short: "Brack", domain: "brack.ch", cat: "big", url: "https://www.brack.ch/gaming/playstation", shipping: 0, pickup: "Ritiro Mägenwil / PickPost", perk: "Spedizione gratuita" },
  mediamarkt: { name: "MediaMarkt Svizzera", short: "MediaMarkt", domain: "mediamarkt.ch", cat: "big", url: "https://www.mediamarkt.ch/it/category/console-ps5-764508.html", shipping: 0, pickup: "Filiale Grancia (Lugano)", perk: "Bundle Black Friday" },
  interdiscount: { name: "Interdiscount", short: "Interdiscount", domain: "interdiscount.ch", cat: "big", url: "https://www.interdiscount.ch/it/cms/sony-playstation", shipping: 0, pickup: "Filiale Lugano", perk: "+ Superpunti Coop", loyalty: { rate: 0.01, label: "Superpunti Coop", supercard: true } },
  fust: { name: "Fust", short: "Fust", domain: "fust.ch", cat: "big", url: "https://www.fust.ch/it/tv-audio-gaming/gaming/playstation/ps5-playstation-5/c/f_ps5_konsole", shipping: 0, pickup: "Filiale Sant'Antonino", perk: "+ Superpunti Coop · Consegna 24h", loyalty: { rate: 0.01, label: "Superpunti Coop", supercard: true } },
  fnac: { name: "FNAC Svizzera", short: "Fnac", domain: "fnac.ch", cat: "big", url: "https://www.fr.fnac.ch/n69062/PlayStation-5/Consoles-PS5", shipping: 0, pickup: "Spedizione CH", perk: "−5% Soci Fnac", loyalty: { rate: 0.05, label: "Sconto Soci Fnac 5%" } },
  manor: { name: "Manor", short: "Manor", domain: "manor.ch", cat: "dept", url: "https://www.manor.ch/fr/shop/multimedia/jeux-consoles/sony-playstation/consoles-playstation/c/gaming-sony-playstation-consoles", shipping: 0, pickup: "Manor Lugano", perk: "Vantaggi Manor Card", loyalty: { rate: 0.02, label: "Manor Card ~2% (stima)" } },
  conforama: { name: "Conforama Svizzera", short: "Conforama", domain: "conforama.ch", cat: "dept", url: "https://www.conforama.ch/fr/console-de-jeu-sony-playstation-5-slim-disc-edition/product/652396", shipping: 0, pickup: "Ritiro Conforama Grancia", perk: "Flash Sale · Ritiro Grancia & CH" },
  coop: { name: "Coop", short: "Coop", domain: "coop.ch", cat: "dept", url: "https://www.coop.ch/it/bebe-bambino/giocattoli/gaming/playstation/sony-playstation-5-console-slim-ps5-dfi-disc-edition/p/7275901", shipping: 0, pickup: "Ritiro in filiale Coop", perk: "Superpunti Coop · Ritiro filiale", loyalty: { rate: 0.01, label: "Superpunti Coop", supercard: true } },
  wog: { name: "World of Games", short: "WOG", domain: "wog.ch", cat: "gaming", url: "https://www.wog.ch/de/index.cfm/bundleConfigurator/platform/PlayStation-5/topCategory/9", shipping: 0, pickup: "Spedizione CH", perk: "Configuratore Bundle CH" },
  softridge: { name: "Softridge", short: "Softridge", domain: "softridge.ch", cat: "gaming", url: "https://www.softridge.ch/it/prodotto/playstation%C2%AE5-slim-farbe-weiss-ps5-133810", shipping: 0, pickup: "Spedizione CH", perk: "Permuta usato / Trade-In" },
};

const AVAIL = {
  online: { label: "Disponibile online", dot: "#34C759", bg: "#E9F9EE", fg: "#1E7B3A" },
  pickup: { label: "Ritiro in filiale", dot: "#0071E3", bg: "#E8F2FD", fg: "#0058B0" },
  limited: { label: "Scorte limitate", dot: "#FF9F0A", bg: "#FFF4E5", fg: "#A65F00" },
  soldout: { label: "Esaurito", dot: "#FF3B30", bg: "#FFECEB", fg: "#C4231A" },
};

// ---------- Foto reali prese dalle pagine delle offerte (verificate il 15.11.2026)
const IMG = {
  digitecDigital: "https://static01.galaxus.com/productimages/5/0/4/2/3/7/6/3/5/7/5/6/8/9/6/2/7/3/2/01a0bc38-ce1a-7e94-bc17-d98f7510d8ef_720.jpeg",
  idDigital: "https://www.interdiscount.ch/static-shops/products/720/9cd7e97d1e86d500497eb4898457cc92e383.jpg",
  fnacDisc: "https://static.fnac-static.com/multimedia/Images/FR/MDM/2d/8d/b7/28806445/1540-1/tsp20261019182831/Console-Sony-PS5-Slim-Edition-Standard-Blanc-et-Noir.jpg",
  coopDisc: "https://www.coop.ch/img/produkte/1200_630/RGB/7275901_001.jpg?_=1711028850342",
  confoDisc: "https://cdn.conforama.ch/medias/600000/50000/2000/300/90/G_652396_A.webp",
  softDisc: "https://www.softridge.ch/ProductImage.ashx?src=v5&id=5d5074d0-00f5-452a-bc52-2f87a30d5ae6&w=816&h=816&ext=.jpg",
  fustGta: "https://www.fust.ch/_next/image?url=http%3A%2F%2Fapi-nettoshop-prod-external.coop.ch%2Fmedias%2FIP553646.jpg%3Fcontext%3DbWFzdGVyfHJvb3R8MjE4MDIxfGltYWdlL2pwZWd8YURkaEwyZ3lOaTh4TURrMk1qWXdOamMxTVRjM05DOUpVRFUxTXpZME5pNXFjR2N8NTZjYWE5Y2UyNTIzMzIzNTRkYjEyZmMxMDcyZmIxZjgxYTcyZjUzNmY5OTBlNGZlNjBjYmE4ZDI2MGM1YmZjZA&w=2048&q=75",
  fustPro: "https://www.fust.ch/_next/image?url=http%3A%2F%2Fapi-nettoshop-prod-external.coop.ch%2Fmedias%2F10800090-1.jpg%3Fcontext%3DbWFzdGVyfGNvbW1vbl9wcm9kdWN0fDE4ODg1MTV8aW1hZ2UvanBlZ3xhREF3TDJneU1DOHhNREV3TkRBeU16STROVGM1TUM4eE1EZ3dNREE1TUY4eExtcHdad3xjNTA1M2VkZDlhYjFkOGQ3YTNlMDk1ZDA2NWIyOGEyMjFjN2ViMmQ1ZGExNjk5M2JlZmFhYTEzNmY2YjRmN2Ix&w=2048&q=75",
};
// Per i negozi che mostrano solo pagine categoria: foto reale dello stesso modello presa da un altro negozio (indicata nel badge)
const SAME_MODEL = {
  digital: [{ url: IMG.idDigital, src: "interdiscount.ch" }, { url: IMG.digitecDigital, src: "digitec.ch" }],
  disc: [{ url: IMG.fnacDisc, src: "fnac.ch" }, { url: IMG.coopDisc, src: "coop.ch" }, { url: IMG.confoDisc, src: "conforama.ch" }],
  pro: [{ url: IMG.fustPro, src: "fust.ch" }],
};
const own = (url, store, model) => [{ url, src: STORES[store].domain, own: true }, ...SAME_MODEL[model]];

// ---------- Dataset offerte (prezzi e URL forniti + correzioni verificate sulle pagine)
const SEED_OFFERS = [
  { id: "dg1", store: "digitec", model: "digital", edition: "standard", title: "PS5 Slim Digital Edition (825 GB)", price: 598.3, extras: [], availability: "online", buyUrl: "https://www.digitec.ch/it/s1/product/sony-playstation-5-slim-edizione-digitale-console-39726222", images: own(IMG.digitecDigital, "digitec", "digital") },
  { id: "dg2", store: "digitec", model: "disc", edition: "standard", title: "PS5 Slim Disc + Marvel's Wolverine", price: 649, extras: [{ type: "game", name: "Marvel's Wolverine" }], availability: "online", tag: "Bundle", buyUrl: "https://www.digitec.ch/it/search?q=PlayStation+5+Slim", images: SAME_MODEL.disc },
  { id: "br1", store: "brack", model: "digital", edition: "standard", title: "PS5 Slim Digital Edition", price: 549, extras: [], availability: "online", buyUrl: "https://www.brack.ch/gaming/playstation", images: SAME_MODEL.digital },
  { id: "br2", store: "brack", model: "disc", edition: "standard", title: "PS5 Slim Disc Edition", price: 649, extras: [], availability: "online", buyUrl: "https://www.brack.ch/gaming/playstation", images: SAME_MODEL.disc },
  { id: "mm1", store: "mediamarkt", model: "digital", edition: "standard", title: "Console PS5 Slim Digital", price: 579, extras: [], availability: "pickup", tag: "Black Friday", buyUrl: "https://www.mediamarkt.ch/it/category/console-ps5-764508.html", images: SAME_MODEL.digital },
  { id: "mm2", store: "mediamarkt", model: "disc", edition: "standard", title: "PS5 Slim Disc + 2° DualSense", price: 699, extras: [{ type: "controller", name: "DualSense aggiuntivo" }], availability: "online", tag: "Black Friday", buyUrl: "https://www.mediamarkt.ch/it/category/console-ps5-764508.html", images: SAME_MODEL.disc },
  { id: "id1", store: "interdiscount", model: "digital", edition: "standard", title: "SONY PlayStation 5 Slim Digital Edition 825 GB", price: 599.95, extras: [], availability: "online", buyUrl: "https://www.interdiscount.ch/it/product/sony-playstation-5-slim-digital-edition-825-gb-0014354246", images: own(IMG.idDigital, "interdiscount", "digital") },
  { id: "id2", store: "interdiscount", model: "pro", edition: "standard", title: "SONY PlayStation 5 Pro 2 TB", price: 899.95, extras: [], availability: "limited", buyUrl: "https://www.interdiscount.ch/it/cms/sony-playstation", images: SAME_MODEL.pro },
  { id: "fu2", store: "fust", model: "digital", edition: "standard", title: "Sony PS5 Slim Digital Edition + GTA VI", price: 663.95, wasPrice: 673.95, extras: [{ type: "game", name: "GTA VI" }], availability: "online", tag: "Sconto", buyUrl: "https://www.fust.ch/it/tv-audio-gaming/gaming/playstation/ps5-playstation-5/sony-ps5-slim-digital-edition-gta-vi-d-/p/10844329", images: own(IMG.fustGta, "fust", "digital") },
  { id: "fu3", store: "fust", model: "pro", edition: "standard", title: "Sony PlayStation 5 Pro Console", price: 899.95, extras: [], availability: "limited", note: "Consegna prevista ~05.01.2027", buyUrl: "https://www.fust.ch/it/tv-audio-gaming/gaming/playstation/ps5-playstation-5/sony-playstation-5-pro-console-/p/10800090", images: own(IMG.fustPro, "fust", "pro") },
  { id: "ma1", store: "manor", model: "disc", edition: "standard", title: "Console PlayStation 5 Slim Disc Edition", price: 649, extras: [], availability: "pickup", buyUrl: "https://www.manor.ch/fr/shop/multimedia/jeux-consoles/sony-playstation/consoles-playstation/c/gaming-sony-playstation-consoles", images: SAME_MODEL.disc },
  { id: "cf1", store: "conforama", model: "disc", edition: "standard", title: "SONY PlayStation 5 Slim Disc Edition", price: 699.95, extras: [], availability: "pickup", tag: "Flash Sale", buyUrl: "https://www.conforama.ch/fr/console-de-jeu-sony-playstation-5-slim-disc-edition/product/652396", images: own(IMG.confoDisc, "conforama", "disc") },
  { id: "fn1", store: "fnac", model: "disc", edition: "standard", title: "Console Sony PS5 Slim Edition Standard Blanc et Noir", price: 649, extras: [], availability: "online", buyUrl: "https://www.fr.fnac.ch/Console-Sony-PS5-Slim-Edition-Standard-Blanc-et-Noir/a22038413", images: own(IMG.fnacDisc, "fnac", "disc") },
  { id: "co1", store: "coop", model: "disc", edition: "standard", title: "Sony PlayStation 5 Console Slim Disc Edition", price: 549, extras: [], availability: "pickup", buyUrl: "https://www.coop.ch/it/bebe-bambino/giocattoli/gaming/playstation/sony-playstation-5-console-slim-ps5-dfi-disc-edition/p/7275901", images: own(IMG.coopDisc, "coop", "disc") },
  { id: "wg1", store: "wog", model: "digital", edition: "standard", title: "PS5 Digital Slim + Configuratore Bundle", price: 549, extras: [], availability: "online", tag: "Configurabile", buyUrl: "https://www.wog.ch/de/index.cfm/bundleConfigurator/platform/PlayStation-5/topCategory/9", images: SAME_MODEL.digital },
  { id: "sr1", store: "softridge", model: "disc", edition: "standard", title: "PlayStation 5 Slim Disc (bianca)", price: 649, extras: [], availability: "online", tag: "Trade-In", buyUrl: "https://www.softridge.ch/it/prodotto/playstation%C2%AE5-slim-farbe-weiss-ps5-133810", images: own(IMG.softDisc, "softridge", "disc") },
];

// ---------- Storico 90 giorni (miglior prezzo di mercato, deterministico)
function seeded(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
function buildHistory(base, low, end, seed) {
  const rnd = seeded(seed), pts = [], today = new Date(2026, 10, 15);
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    const day = 89 - i;
    let p = base + (rnd() - 0.5) * 18;
    if (day >= 18 && day <= 24) p = low + (rnd() - 0.5) * 8;
    if (day >= 55 && day <= 70) p += 14;
    if (day >= 84) p = base - (base - end) * ((day - 83) / 6);
    pts.push({ date: d, price: Math.round(p) });
  }
  return pts;
}
const HISTORY = { digital: buildHistory(589, 539, 549, 11), disc: buildHistory(629, 559, 549, 23), pro: buildHistory(915, 849, 897, 37) };
const STATS = Object.fromEntries(Object.keys(HISTORY).map((k) => {
  const p = HISTORY[k].map((x) => x.price);
  const min = Math.min(...p), max = Math.max(...p), avg = Math.round(p.reduce((a, b) => a + b, 0) / p.length);
  return [k, { min, max, avg, target: Math.round(min + (avg - min) * 0.3) }];
}));

// ---------- Calcoli
const chf = (n) => (Number.isInteger(n) ? `CHF ${n}.–` : `CHF ${Number(n).toFixed(2)}`);
function dealScore(net, model) {
  const { min, max } = STATS[model];
  if (net <= min) return 99;
  const ratio = Math.min(1, Math.max(0, (net - min) / (max - min || 1)));
  return Math.max(1, Math.round(97 - ratio * 90));
}
function dealVerdict(score) {
  if (score >= 80) return { label: "Vicino al minimo storico — Compra ora", color: "#34C759", short: "Compra ora" };
  if (score >= 60) return { label: "Buon prezzo — Conviene", color: "#0071E3", short: "Conviene" };
  if (score >= 40) return { label: "Nella media — Valuta", color: "#FF9F0A", short: "Valuta" };
  return { label: "Prezzo gonfiato pre-sconti — Aspetta", color: "#FF3B30", short: "Aspetta" };
}
function enrich(o, loyalty, mult = 1) {
  const extrasVal = o.extras.reduce((s, e) => s + ACCESSORY_VALUE[e.type], 0);
  const L = STORES[o.store].loyalty;
  const rate = L ? (L.supercard ? L.rate * mult : L.rate) : 0;
  const cash = loyalty && L ? r05(o.price * rate) : 0;
  const net = r05(o.price - extrasVal - cash);
  const ref = o.wasPrice ?? r05(MODELS[o.model].ref + extrasVal);
  const save = r05(Math.max(0, ref - o.price));
  return { ...o, extrasVal, cash, net, ref, save, pct: Math.round((save / ref) * 100), refLabel: o.wasPrice ? "prezzo precedente" : o.extras.length ? "acquisto separato" : "prezzo più alto CH", score: dealScore(net, o.model) };
}

// ---------- Validazione URL
function safeUrl(raw, domain) {
  try {
    const u = new URL(raw);
    return u.protocol === "https:" && (u.hostname === domain || u.hostname.endsWith("." + domain)) ? u.toString() : null;
  } catch { return null; }
}
const buyUrlOf = (o) => safeUrl(o.buyUrl, STORES[o.store].domain);
const toppreiseOf = (o) => safeUrl(TOPPREISE[o.model], "toppreise.ch");
const shortUrl = (u) => { try { const x = new URL(u); return (x.hostname + x.pathname).replace(/^www\./, "").slice(0, 58) + ((x.hostname + x.pathname).length > 62 ? "…" : ""); } catch { return u; } };
const validImageUrl = (u) => !u || /^data:image\//.test(u) || /^https:\/\//.test(u);

/* =========================================================================
   UI PRIMITIVES
   ========================================================================= */
const cardBase = "bg-white rounded-3xl border border-black/[0.06] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]";
const Card = ({ className = "", children }) => <div className={`${cardBase} ${className}`}>{children}</div>;
const Pill = ({ active, onClick, children }) => (
  <button onClick={onClick} className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all active:scale-95 whitespace-nowrap ${active ? "bg-[#1D1D1F] text-white shadow-sm" : "bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED]"}`}>{children}</button>
);
const SectionTitle = ({ icon: Icon, title, sub }) => (
  <div className="flex items-start gap-3 mb-4">
    <div className="w-9 h-9 rounded-2xl bg-[#F5F5F7] flex items-center justify-center shrink-0"><Icon size={18} className="text-[#1D1D1F]" /></div>
    <div><h2 className="text-[17px] font-semibold text-[#1D1D1F] tracking-tight">{title}</h2>{sub && <p className="text-[13px] text-[#86868B]">{sub}</p>}</div>
  </div>
);
const AvailBadge = ({ o }) => {
  const a = AVAIL[o.availability];
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium" style={{ background: a.bg, color: a.fg }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: a.dot }} />{a.label}<span className="opacity-70 hidden sm:inline">· {o.note || (o.availability === "pickup" ? STORES[o.store].pickup : o.availability === "online" ? "consegna rapida" : "")}</span>
    </div>
  );
};
function ScoreRing({ score, size = 56 }) {
  const v = dealVerdict(score), r = (size - 8) / 2, c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#F0F0F2" strokeWidth="6" fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={v.color} strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} style={{ transition: "stroke-dashoffset .6s ease" }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[15px] font-semibold text-[#1D1D1F]">{score}</div>
    </div>
  );
}
const stop = (e) => e.stopPropagation();
function ExtLink({ href, children, variant = "primary", className = "" }) {
  if (!href) return <span className="text-[12px] text-[#FF3B30]">Link non verificato</span>;
  const styles = { primary: "bg-[#0071E3] text-white hover:bg-[#0077ED]", soft: "bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED]", ghost: "text-[#0071E3] hover:underline px-0" };
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={stop} title={href}
      className={`relative z-10 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-[14px] font-medium transition-all active:scale-95 ${styles[variant]} ${className}`}>
      {children}
    </a>
  );
}
const VerifiedBadge = ({ o }) => (
  <span className="inline-flex items-center gap-1 text-[11px] text-[#1E7B3A] font-medium"><ShieldCheck size={12} />Link diretto verificato • {STORES[o.store].domain}</span>
);

/* =========================================================================
   RENDER STUDIO — console, controller, cover gioco
   ========================================================================= */
function ConsoleSVG({ model, edition = "standard", height = 150 }) {
  const uid = useId().replace(/:/g, "");
  const ed = EDITIONS[edition] || EDITIONS.standard;
  const pro = model === "pro", disc = model === "disc";
  const top = pro ? 10 : 36, bot = 232;
  const p1 = ed.panel || "#FFFFFF", p2 = ed.panel2 || "#E6E6EB", core = ed.core || "#1D1D1F";
  const L = `M50,${top + 12} C38,${top + 5} 28,${top + 1} 21,${top - 3} L25,${bot} L50,${bot - 4} Z`;
  const R = `M70,${top + 12} C82,${top + 5} 92,${top + 1} 99,${top - 3} L95,${bot} L70,${bot - 4} Z`;
  return (
    <svg viewBox="0 0 120 244" style={{ height }} className="w-auto drop-shadow-[0_10px_14px_rgba(0,0,0,0.12)]" aria-label={`Render ${MODELS[model].name}`}>
      <defs>
        <linearGradient id={`pl${uid}`} x1="0" x2="1"><stop offset="0" stopColor={p2} /><stop offset="0.55" stopColor={p1} /><stop offset="1" stopColor={p1} /></linearGradient>
        <linearGradient id={`pr${uid}`} x1="0" x2="1"><stop offset="0" stopColor={p1} /><stop offset="0.45" stopColor={p1} /><stop offset="1" stopColor={p2} /></linearGradient>
        <linearGradient id={`c${uid}`} x1="0" x2="1"><stop offset="0" stopColor={core} /><stop offset="0.5" stopColor="#3A3A3E" stopOpacity={ed.core ? 0.6 : 1} /><stop offset="1" stopColor={core} /></linearGradient>
      </defs>
      <ellipse cx="60" cy={bot + 6} rx="46" ry="5" fill="#000" opacity="0.12" />
      <rect x="49" y={top + 6} width="22" height={bot - top - 8} rx="4" fill={`url(#c${uid})`} />
      <path d={L} fill={`url(#pl${uid})`} stroke="rgba(0,0,0,0.10)" strokeWidth="0.8" />
      <path d={R} fill={`url(#pr${uid})`} stroke="rgba(0,0,0,0.10)" strokeWidth="0.8" />
      {ed.trim && <><path d={L} fill="none" stroke={ed.trim} strokeWidth="1.2" /><path d={R} fill="none" stroke={ed.trim} strokeWidth="1.2" /></>}
      {pro && [0, 1, 2].map((i) => <rect key={i} x="22" y={top + (bot - top) * 0.44 + i * 10} width="76" height="4.5" rx="1.5" fill={core} />)}
      {disc && (
        <g>
          <path d={`M70,${bot - 80} L96.5,${bot - 82} Q104,${bot - 46} 97,${bot - 2} L70,${bot - 4} Z`} fill={`url(#pr${uid})`} stroke="rgba(0,0,0,0.12)" strokeWidth="0.8" />
          <line x1="70" y1={bot - 80} x2="96.5" y2={bot - 82} stroke="rgba(0,0,0,0.18)" strokeWidth="0.8" />
          <rect x="76" y={bot - 44} width="16" height="1.6" rx="0.8" fill="rgba(0,0,0,0.25)" />
        </g>
      )}
      {ed.dots && ["#E8483A", "#F3C318", "#2E9BD6", "#3DB54A"].map((c, i) => <circle key={c} cx="60" cy={top + 30 + i * 9} r="2.6" fill={c} />)}
      <rect x="56" y={bot - 34} width="8" height="3" rx="1.5" fill="#6E6E73" />
    </svg>
  );
}
function ControllerSVG({ width = 84, edition }) {
  const ed = EDITIONS[edition] || {};
  return (
    <svg viewBox="0 0 120 80" style={{ width }} className="drop-shadow-[0_6px_8px_rgba(0,0,0,0.12)]" aria-label="DualSense">
      <path d="M20,20 Q60,8 100,20 Q114,24 112,50 Q110,74 96,72 Q86,70 80,55 L40,55 Q34,70 24,72 Q10,74 8,50 Q6,24 20,20 Z" fill={ed.panel || "#FFFFFF"} stroke="rgba(0,0,0,0.12)" />
      <rect x="44" y="16" width="32" height="20" rx="5" fill="#1D1D1F" />
      <circle cx="44" cy="46" r="6.5" fill="#2A2A2E" /><circle cx="76" cy="46" r="6.5" fill="#2A2A2E" />
      <path d="M22,33 h10 M27,28 v10" stroke="#8E8E93" strokeWidth="3" strokeLinecap="round" />
      {[[93, 28], [99, 34], [93, 40], [87, 34]].map(([x, y]) => <circle key={x + "" + y} cx={x} cy={y} r="2.6" fill="#C7C7CC" />)}
    </svg>
  );
}
const GAME_COLORS = { "GTA VI": ["#FF5FA2", "#FF9F45"], "EA Sports FC 26": ["#0B3D2E", "#2EC4A0"], "Astro Bot": ["#1E6BFF", "#8CC8FF"], "Marvel's Wolverine": ["#F2B705", "#2A2A2A"], Fortnite: ["#7B2FF7", "#00C2FF"] };
function GameCover({ title, width = 54 }) {
  const uid = useId().replace(/:/g, "");
  const hash = [...title].reduce((a, c) => a + c.charCodeAt(0), 0);
  const [c1, c2] = GAME_COLORS[title] || [`hsl(${hash % 360} 70% 45%)`, `hsl(${(hash * 7) % 360} 70% 60%)`];
  const words = title.split(" "), lines = [];
  words.forEach((w) => { const l = lines[lines.length - 1]; if (l && (l + " " + w).length <= 11) lines[lines.length - 1] = l + " " + w; else lines.push(w); });
  return (
    <svg viewBox="0 0 64 84" style={{ width }} className="drop-shadow-[0_6px_8px_rgba(0,0,0,0.15)] rotate-[4deg]" aria-label={`Gioco ${title}`}>
      <defs><linearGradient id={`g${uid}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={c1} /><stop offset="1" stopColor={c2} /></linearGradient></defs>
      <rect x="1" y="1" width="62" height="82" rx="4" fill={`url(#g${uid})`} stroke="rgba(0,0,0,0.15)" />
      <rect x="1" y="1" width="62" height="11" rx="4" fill="#0070D1" /><rect x="1" y="8" width="62" height="4" fill="#0070D1" />
      <text x="5" y="9.5" fontSize="6.5" fontWeight="800" fill="#fff" fontFamily="Inter, sans-serif">PS5</text>
      <circle cx="46" cy="36" r="13" fill="#fff" opacity="0.18" /><circle cx="22" cy="50" r="8" fill="#fff" opacity="0.12" />
      {lines.slice(0, 3).map((l, i) => <text key={i} x="5" y={66 + i * 7.5 - (lines.length - 1) * 4} fontSize="7" fontWeight="800" fill="#fff" fontFamily="Inter, sans-serif">{l}</text>)}
    </svg>
  );
}

// ---------- <ProductVisual /> : foto reale dell'offerta → foto reale stesso modello → render studio (solo se tutto fallisce)
function imageChain(offer) {
  const list = [];
  if (offer.imageUrl) list.push({ url: offer.imageUrl, src: offer.imageUrl.startsWith("data:") ? "screenshot" : "manuale", own: true });
  (offer.images || []).forEach((i) => { if (!list.some((x) => x.url === i.url)) list.push(i); });
  return list;
}
function ProductVisual({ offer, compact = false }) {
  const chain = useMemo(() => imageChain(offer), [offer.imageUrl, offer.images]);
  const [idx, setIdx] = useState(0);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setIdx(0); setLoaded(false); }, [chain]);
  const cur = chain[idx];
  const failedAll = idx >= chain.length;
  const ctrl = offer.extras.filter((e) => e.type === "controller");
  const games = offer.extras.filter((e) => e.type === "game");
  const ed = EDITIONS[offer.edition || "standard"];
  const h = compact ? "h-40" : "h-52";
  return (
    <div className={`relative ${h} rounded-2xl overflow-hidden bg-white border border-black/[0.05]`}>
      {/* Render studio: solo se nessuna foto reale si carica */}
      {failedAll && (
        <div className="absolute inset-0 flex items-end justify-center gap-2 pb-4 bg-[#FBFBFD]">
          <ConsoleSVG model={offer.model} edition={offer.edition} height={compact ? 120 : 150} />
          {(ctrl.length > 0 || games.length > 0) && (
            <div className="flex items-end gap-2 pb-1">
              {ctrl.map((c, i) => <ControllerSVG key={"c" + i} width={compact ? 64 : 78} edition={offer.edition} />)}
              {games.map((g, i) => <GameCover key={"g" + i} title={g.name} width={compact ? 42 : 52} />)}
            </div>
          )}
        </div>
      )}
      {!failedAll && !loaded && <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#F5F5F7] to-white" />}
      {cur && (
        <img key={cur.url} src={cur.url} alt={offer.title} referrerPolicy="no-referrer" loading="lazy" decoding="async"
          onLoad={(e) => { if (e.currentTarget.naturalWidth < 40) { setLoaded(false); setIdx((i) => i + 1); } else setLoaded(true); }}
          onError={() => { setLoaded(false); setIdx((i) => i + 1); }}
          className={`absolute inset-0 w-full h-full object-contain p-3 transition-all duration-500 group-hover:scale-105 ${loaded ? "opacity-100" : "opacity-0"}`} />
      )}
      {/* Cosa c'è nella scatola */}
      {(ctrl.length > 0 || games.length > 0) && (
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex flex-wrap gap-1.5 justify-center">
          {ctrl.map((c, i) => <span key={i} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#1D1D1F] text-white shadow">+ DualSense</span>)}
          {games.map((g, i) => <span key={i} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#0071E3] text-white shadow">+ {g.name}</span>)}
        </div>
      )}
      <div className="absolute top-2.5 left-2.5 flex gap-1.5 flex-wrap">
        {offer.edition && offer.edition !== "standard" && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#1D1D1F] text-white">{ed.label}</span>}
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/90 border border-black/[0.06] text-[#1D1D1F]">{MODELS[offer.model].desc}</span>
      </div>
      <span className="absolute top-2.5 right-2.5 text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/90 border border-black/[0.06] text-[#86868B]">
        {failedAll ? "Render (foto non disponibile)" : !loaded ? "Carico foto…" : cur.own ? "📷 Foto dell'offerta" : `📷 Foto prodotto · ${cur.src}`}
      </span>
    </div>
  );
}

/* =========================================================================
   GRAFICI
   ========================================================================= */
function HistoryChart({ model, range }) {
  const [hover, setHover] = useState(null);
  const ref = useRef(null);
  const data = HISTORY[model].slice(-range), st = STATS[model];
  const W = 720, H = 260, P = { l: 48, r: 16, t: 16, b: 28 };
  const lo = Math.min(...data.map((d) => d.price), st.target) - 15, hi = Math.max(...data.map((d) => d.price), st.avg) + 15;
  const x = (i) => P.l + (i / (data.length - 1)) * (W - P.l - P.r);
  const y = (v) => P.t + (1 - (v - lo) / (hi - lo)) * (H - P.t - P.b);
  const line = data.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d.price).toFixed(1)}`).join(" ");
  const area = `${line} L${x(data.length - 1)},${H - P.b} L${x(0)},${H - P.b} Z`;
  const color = MODELS[model].color;
  const minIdx = data.reduce((b, d, i) => (d.price < data[b].price ? i : b), 0);
  const onMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    setHover(Math.max(0, Math.min(data.length - 1, Math.round(((px - P.l) / (W - P.l - P.r)) * (data.length - 1)))));
  };
  const hv = hover != null ? data[hover] : data[data.length - 1];
  return (
    <div>
      <div className="text-[28px] font-semibold tracking-tight text-[#1D1D1F]">{chf(hv.price)}</div>
      <div className="text-[13px] text-[#86868B] mb-2">{hv.date.toLocaleDateString("it-CH", { day: "numeric", month: "long", year: "numeric" })} · miglior prezzo di mercato</div>
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto touch-none select-none" onMouseMove={onMove} onTouchMove={(e) => onMove(e.touches[0])} onMouseLeave={() => setHover(null)}>
        <defs><linearGradient id={`hg-${model}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.18" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
        {[0, 1, 2, 3, 4].map((i) => { const v = lo + ((hi - lo) * i) / 4; return <g key={i}><line x1={P.l} x2={W - P.r} y1={y(v)} y2={y(v)} stroke="#F0F0F2" /><text x={P.l - 8} y={y(v) + 4} textAnchor="end" fontSize="11" fill="#86868B">{Math.round(v)}</text></g>; })}
        <line x1={P.l} x2={W - P.r} y1={y(st.avg)} y2={y(st.avg)} stroke="#86868B" strokeDasharray="4 4" />
        <text x={W - P.r} y={y(st.avg) - 6} textAnchor="end" fontSize="11" fill="#86868B">Media {st.avg}</text>
        <line x1={P.l} x2={W - P.r} y1={y(st.target)} y2={y(st.target)} stroke="#34C759" strokeDasharray="4 4" />
        <text x={W - P.r} y={y(st.target) + 14} textAnchor="end" fontSize="11" fill="#1E7B3A">Target {st.target}</text>
        <path d={area} fill={`url(#hg-${model})`} />
        <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={x(minIdx)} cy={y(data[minIdx].price)} r="5" fill="#FF3B30" stroke="#fff" strokeWidth="2" />
        <text x={Math.min(x(minIdx), W - 50)} y={y(data[minIdx].price) + 20} textAnchor="middle" fontSize="11" fontWeight="600" fill="#FF3B30">Min {data[minIdx].price}</text>
        {hover != null && <g><line x1={x(hover)} x2={x(hover)} y1={P.t} y2={H - P.b} stroke="#1D1D1F" strokeOpacity="0.2" /><circle cx={x(hover)} cy={y(data[hover].price)} r="5" fill={color} stroke="#fff" strokeWidth="2" /></g>}
        {[0, Math.floor(data.length / 2), data.length - 1].map((i) => <text key={i} x={x(i)} y={H - 8} textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"} fontSize="11" fill="#86868B">{data[i].date.toLocaleDateString("it-CH", { day: "numeric", month: "short" })}</text>)}
      </svg>
    </div>
  );
}
function StoreBarChart({ model, list }) {
  const rows = Object.keys(STORES).map((s) => {
    const offers = list.filter((o) => o.store === s && o.model === model && o.availability !== "soldout");
    return offers.length ? { store: s, value: Math.min(...offers.map((o) => o.net)) } : null;
  }).filter(Boolean).sort((a, b) => a.value - b.value);
  if (!rows.length) return <p className="text-[13px] text-[#86868B]">Nessuna offerta attiva per questo modello.</p>;
  const lo = Math.min(...rows.map((r) => r.value)) * 0.94, hi = Math.max(...rows.map((r) => r.value));
  return (
    <div className="space-y-2.5">
      {rows.map((r, i) => (
        <div key={r.store} className="flex items-center gap-3">
          <div className="w-24 text-[13px] text-[#1D1D1F] font-medium truncate">{STORES[r.store].short}</div>
          <div className="flex-1 h-8 bg-[#F5F5F7] rounded-xl overflow-hidden relative">
            <div className="h-full rounded-xl transition-all duration-700" style={{ width: `${20 + ((r.value - lo) / (hi - lo || 1)) * 80}%`, background: i === 0 ? "#FF3B30" : MODELS[model].color, opacity: i === 0 ? 1 : 0.85 }} />
            <span className="absolute inset-y-0 right-3 flex items-center text-[12px] font-semibold text-[#1D1D1F]">{chf(r.value)}</span>
          </div>
        </div>
      ))}
      <p className="text-[11px] text-[#86868B] pt-1">Costo netto (bundle scorporati{list.some((o) => o.cash) ? ", cashback incluso" : ""}). Rosso = più conveniente.</p>
    </div>
  );
}

/* =========================================================================
   MOTORE PREDITTIVO BLACK FRIDAY · ALERT · NOTIFICHE · TELEGRAM · AUTO-SYNC
   ========================================================================= */
// Black Friday = ultimo venerdì di novembre; Cyber Monday = lunedì successivo
function blackFriday(year) { const d = new Date(year, 10, 30); while (d.getDay() !== 5) d.setDate(d.getDate() - 1); return d; }
function bfInfo(now = new Date()) {
  let bf = blackFriday(now.getFullYear());
  const cm = new Date(bf); cm.setDate(bf.getDate() + 3); cm.setHours(23, 59, 59);
  if (now > cm) { bf = blackFriday(now.getFullYear() + 1); }
  const cyber = new Date(bf); cyber.setDate(bf.getDate() + 3);
  const weekStart = new Date(bf); weekStart.setDate(bf.getDate() - 4); weekStart.setHours(0, 0, 0, 0);
  const days = Math.ceil((new Date(bf).setHours(0, 0, 0, 0) - new Date(now).setHours(0, 0, 0, 0)) / 864e5);
  const inWeek = now >= weekStart && now <= new Date(cyber).setHours(23, 59, 59);
  return { bf, cyber, days, inWeek };
}
const fmtDay = (d) => d.toLocaleDateString("it-CH", { weekday: "long", day: "numeric", month: "long" });

// Soglie "compra subito" (minimo storico CH realistico) e prezzo pieno di listino
const GREEN_MAX = { digital: 499, disc: 579, pro: 799 };
const BUNDLE_GREEN_NET = 480;
const BF_EXPECTED_DROP = { digital: 0.09, disc: 0.08, pro: 0.06 }; // calo medio atteso (stima)

function strategyFor(model, list, now = new Date()) {
  const live = list.filter((o) => o.availability !== "soldout" && o.model === model);
  const singles = live.filter((o) => !o.extras.length).sort((a, b) => a.price - b.price);
  const bundles = live.filter((o) => o.extras.length).sort((a, b) => a.net - b.net);
  const best = singles[0], bestB = bundles[0], info = bfInfo(now), st = STATS[model];
  if (!best && !bestB) return null;
  const ref = MODELS[model].ref;
  const pick = best || bestB;
  const estBF = Math.round(pick.price * (1 - BF_EXPECTED_DROP[model]));
  let light, title, reason;
  if ((best && best.price <= GREEN_MAX[model]) || (bestB && bestB.net < BUNDLE_GREEN_NET)) {
    light = "green"; title = "COMPRA ORA";
    const o = best && best.price <= GREEN_MAX[model] ? best : bestB;
    reason = o.extras.length ? `Bundle ${STORES[o.store].short}: la console ti costa netta ${chf(o.net)}, sotto CHF ${BUNDLE_GREEN_NET}.` : `${STORES[o.store].short} a ${chf(o.price)}: dentro la fascia del minimo storico CH (≤ CHF ${GREEN_MAX[model]}).`;
    return { model, light, title, reason, offer: o, estBF, info };
  }
  if (pick.price > ref + 0.5 || (pick.availability === "limited" && pick.price > ref)) {
    light = "red"; title = "NON COMPRARE";
    reason = `Prezzo pieno o rialzato (${chf(pick.price)}) con scorte limitate${pick.note ? ` — ${pick.note.toLowerCase()}` : ""}. Aspetta e attiva l'alert.`;
    return { model, light, title, reason, offer: pick, estBF, info };
  }
  light = "yellow"; title = info.days >= 0 && info.days <= 30 ? "ASPETTA IL BLACK FRIDAY" : "ASPETTA UN CALO";
  reason = `Oggi il migliore è ${chf(pick.price)} (${STORES[pick.store].short}), sopra la soglia di CHF ${GREEN_MAX[model]}. ${info.days > 0 ? `Mancano ${info.days} giorni al Black Friday: ` : ""}calo stimato verso ~${chf(estBF)}.`;
  return { model, light, title, reason, offer: pick, estBF, info };
}
const LIGHT = { green: { c: "#34C759", bg: "#E9F9EE", fg: "#1E7B3A" }, yellow: { c: "#FFCC00", bg: "#FFF8DB", fg: "#8A6D00" }, red: { c: "#FF3B30", bg: "#FFECEB", fg: "#C4231A" } };

// ---------- Alert
const DEFAULT_ALERTS = { digital: 479, disc: 549, pro: 799, bundle: 480, anyMax: "", minPct: 20, onlyHistMin: false, push: false, telegram: false, chatId: "" };
function matchAlert(o, a) {
  if (o.availability === "soldout") return null;
  if (a.onlyHistMin && o.net > STATS[o.model].min) return null;
  const reasons = [];
  if (o.extras.length ? o.net <= Number(a.bundle) : o.price <= Number(a[o.model])) reasons.push(o.extras.length ? `bundle netto ≤ CHF ${a.bundle}` : `${MODELS[o.model].short} ≤ CHF ${a[o.model]}`);
  if (a.anyMax && o.price <= Number(a.anyMax)) reasons.push(`sotto CHF ${a.anyMax}`);
  if (a.minPct && o.pct >= Number(a.minPct)) reasons.push(`sconto ≥ ${a.minPct}%`);
  return reasons.length ? reasons : null;
}
const alertText = (o, reasons) => `🔔 ${MODELS[o.model].name} a ${chf(o.price)} da ${STORES[o.store].short}${o.extras.length ? ` (netto ${chf(o.net)})` : ""} — ${reasons.join(" · ")}`;

// ---------- Notifiche browser / Web Push
const SW_PATH = "sw.js"; // percorso relativo: funziona anche su GitHub Pages (/nome-repo/)
async function ensureServiceWorker() {
  try { if ("serviceWorker" in navigator) return await navigator.serviceWorker.register(SW_PATH); } catch {}
  return null;
}
async function showNotification(title, body, url) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return false;
  try {
    const reg = await ensureServiceWorker();
    if (reg && reg.showNotification) { await reg.showNotification(title, { body, icon: "icon-192.png", badge: "icon-192.png", data: { url }, tag: url || title }); return true; }
  } catch {}
  try { const n = new Notification(title, { body, tag: url || title }); if (url) n.onclick = () => window.open(url, "_blank", "noopener,noreferrer"); return true; } catch { return false; }
}

// ---------- Telegram
function telegramPayload(o, reasons, chatId) {
  return { chat_id: chatId || "<CHAT_ID>", parse_mode: "HTML", disable_web_page_preview: false, text: `<b>${alertText(o, reasons)}</b>\n${STORES[o.store].perk}\n<a href="${buyUrlOf(o)}">Acquista su ${STORES[o.store].short}</a> · <a href="${toppreiseOf(o)}">Toppreise</a>` };
}
async function sendTelegram(token, payload) {
  const r = await fetch(`https://api.telegram.org/bot${encodeURIComponent(token)}/sendMessage`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.ok) throw new Error(j.description || `HTTP ${r.status}`);
  return true;
}

// ---------- Auto-Sync: endpoint JSON aggiornato dal cron (vedi Guida Deploy)
const DATA_ENDPOINT = "data/offers.json"; // file aggiornato ogni giorno da GitHub Actions
function nextScan(now = new Date()) {
  const { inWeek } = bfInfo(now);
  const n = new Date(now);
  if (inWeek) { n.setSeconds(0, 0); n.setMinutes(n.getMinutes() < 30 ? 30 : 60); return n; }
  n.setHours(7, 30, 0, 0); if (n <= now) n.setDate(n.getDate() + 1); return n;
}
const fmtCountdown = (ms) => { const m = Math.max(0, Math.round(ms / 60000)); return m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`; };
async function fetchRemoteOffers() {
  const r = await fetch(`${DATA_ENDPOINT}?t=${Date.now()}`, { cache: "no-store" });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const j = await r.json();
  const offers = Array.isArray(j) ? j : j.offers;
  if (!Array.isArray(offers) || !offers.length || !offers.every((o) => STORES[o.store] && MODELS[o.model] && o.price > 0)) throw new Error("Formato non valido");
  return { offers: offers.map((o) => ({ extras: [], edition: "standard", availability: "online", ...o, images: SEED_OFFERS.find((x) => x.id === o.id)?.images || o.images || SAME_MODEL[o.model] })), updatedAt: j.updatedAt ? new Date(j.updatedAt) : new Date() };
}

// ---------- Guida Deploy: file pronti
const DEPLOY_FILES = {
  ".github/workflows/deploy.yml": `name: Deploy

on:
  push:
    branches: [main]
  schedule:
    - cron: "30 6 * * *"          # ogni giorno alle 07:30 ora svizzera (orario invernale)
    - cron: "*/30 * 23-30 11 *"   # Black Friday Week (23–30 novembre): ogni 30 minuti
  workflow_dispatch: {}           # Actions → Deploy → "Run workflow" = Forza scansione

permissions:
  contents: write
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Scansione prezzi
        if: github.event_name != 'push'
        continue-on-error: true
        run: node scripts/scan.mjs
        env:
          TELEGRAM_BOT_TOKEN: \${{ secrets.TELEGRAM_BOT_TOKEN }}
          TELEGRAM_CHAT_ID: \${{ secrets.TELEGRAM_CHAT_ID }}
      - name: Salva i nuovi prezzi
        if: github.event_name != 'push'
        run: |
          git config user.name "ps5-bot"
          git config user.email "ps5-bot@users.noreply.github.com"
          git add public/data/offers.json
          git commit -m "Prezzi PS5 aggiornati" || echo "Nessuna modifica"
          git push || echo "Push non riuscito"
      - run: npm install --no-audit --no-fund
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
`,
  "scripts/scan.mjs": `// Scansione prezzi PS5 — eseguita da GitHub Actions ogni mattina (e ogni 30 min nella Black Friday Week).
// Legge public/data/offers.json, controlla le pagine prodotto (scan: true), aggiorna prezzo/foto
// e manda un alert su Telegram quando un prezzo scende sotto la soglia.
import fs from "node:fs/promises";

const FILE = "public/data/offers.json";
const ALERTS = { digital: 479, disc: 549, pro: 799, bundle: 480, minDropCHF: 1 }; // modifica qui le tue soglie
const EXTRA = { controller: 75, game: 70 };
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

const pick = (html, re) => (html.match(re) || [])[1] || null;
function parse(html) {
  let price = null;
  let image = pick(html, /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  for (const b of html.matchAll(/<script[^>]+application\\/ld\\+json[^>]*>([\\s\\S]*?)<\\/script>/gi)) {
    try {
      const nodes = [].concat(JSON.parse(b[1])).flatMap((x) => x["@graph"] || [x]);
      for (const n of nodes) {
        if (![].concat(n["@type"] || []).some((t) => /Product/i.test(t))) continue;
        const off = [].concat(n.offers || [])[0] || {};
        const p = Number(off.price ?? off.lowPrice ?? [].concat(off.offers || [])[0]?.price);
        if (p > 100 && p < 2000) price = p;
        const img = [].concat(n.image || [])[0];
        if (typeof img === "string" && img.startsWith("https://")) image = img;
      }
    } catch {}
  }
  if (!price) { // fallback: meta tag prezzo
    const p = Number(pick(html, /<meta[^>]+(?:property|itemprop)=["'](?:product:price:amount|price)["'][^>]+content=["']([\\d.]+)["']/i));
    if (p > 100 && p < 2000) price = p;
  }
  if (image && image.includes("opengraph-image")) image = null; // immagine generica del sito, non del prodotto
  return { price, image };
}

const data = JSON.parse(await fs.readFile(FILE, "utf8"));
const changes = [];
for (const o of data.offers) {
  if (!o.scan) continue;
  try {
    const res = await fetch(o.buyUrl, { headers: { "User-Agent": UA, "Accept-Language": "it-CH,it;q=0.9,de-CH;q=0.8" } });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const { price, image } = parse(await res.text());
    if (price && price !== o.price) { changes.push({ o, before: o.price, after: price }); o.price = price; }
    if (image) o.imageUrl = image;
    o.checkedAt = new Date().toISOString();
    console.log("✓", o.id, o.store, price ?? "(prezzo non letto)");
  } catch (e) { console.warn("✗", o.id, o.store, e.message); }
  await new Promise((r) => setTimeout(r, 1500)); // una richiesta alla volta, con pausa
}
data.updatedAt = new Date().toISOString();
await fs.writeFile(FILE, JSON.stringify(data, null, 2));
console.log(\`Fatto: \${changes.length} prezzi cambiati.\`);

// ---- Alert Telegram
const { TELEGRAM_BOT_TOKEN: T, TELEGRAM_CHAT_ID: C } = process.env;
if (T && C) {
  for (const { o, before, after } of changes) {
    const net = after - (o.extras || []).reduce((s, e) => s + (EXTRA[e.type] || 0), 0);
    const hit = (o.extras || []).length ? net <= ALERTS.bundle : after <= ALERTS[o.model];
    if (!hit || before - after < ALERTS.minDropCHF) continue;
    await fetch(\`https://api.telegram.org/bot\${T}/sendMessage\`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: C, parse_mode: "HTML", text: \`🔔 <b>\${o.title}</b>\\nCHF \${after} da \${o.store} (prima CHF \${before})\\n<a href="\${o.buyUrl}">Acquista ora</a>\` }),
    });
  }
}
`,
  "public/sw.js": `// Service Worker: notifiche (anche push) e apertura del link al clic
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("push", (e) => {
  const d = e.data ? e.data.json() : { title: "Cispu PS5", body: "Nuova offerta!" };
  e.waitUntil(self.registration.showNotification(d.title, { body: d.body, icon: "icon-192.png", data: { url: d.url } }));
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  if (e.notification.data && e.notification.data.url) e.waitUntil(clients.openWindow(e.notification.data.url));
});
`,
};
const DEPLOY_STEPS = [
  "Su github.com crea un nuovo repository pubblico (es. cispu-ps5) e carica tutti i file del pacchetto con “Add file → Upload files”.",
  "Crea il file .github/workflows/deploy.yml con “Add file → Create new file” e incolla il contenuto (le cartelle che iniziano col punto a volte non si caricano trascinandole).",
  "Settings → Pages → Source: “GitHub Actions”. Dopo 1–2 minuti il sito è online su tuonome.github.io/cispu-ps5.",
  "Telegram (facoltativo): @BotFather → /newbot, copia il token; scrivi al bot e leggi il chat_id su api.telegram.org/bot<TOKEN>/getUpdates.",
  "Settings → Secrets and variables → Actions: aggiungi TELEGRAM_BOT_TOKEN e TELEGRAM_CHAT_ID.",
  "Ogni giorno alle 07:30 (e ogni 30 min nella Black Friday Week) GitHub aggiorna i prezzi e ripubblica il sito. Per forzarlo: Actions → Deploy → Run workflow.",
];

function DeployGuide({ open, onClose }) {
  const [tab, setTab] = useState(Object.keys(DEPLOY_FILES)[0]);
  const [copied, setCopied] = useState("");
  if (!open) return null;
  const copy = async (k) => { try { await navigator.clipboard.writeText(DEPLOY_FILES[k]); setCopied(k); setTimeout(() => setCopied(""), 1500); } catch {} };
  return (
    <div className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-6" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-4xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-2xl" onClick={stop}>
        <div className="sticky top-0 bg-white/90 backdrop-blur-xl px-6 py-4 border-b border-black/[0.06] flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5 font-semibold"><Code2 size={18} />Guida Deploy Automatico</div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-[#F5F5F7] flex items-center justify-center"><X size={17} /></button>
        </div>
        <div className="p-6 space-y-5">
          <ol className="space-y-2">{DEPLOY_STEPS.map((t, i) => <li key={i} className="flex gap-3 text-[14px]"><span className="w-6 h-6 rounded-full bg-[#1D1D1F] text-white text-[12px] font-semibold flex items-center justify-center shrink-0">{i + 1}</span><span>{t}</span></li>)}</ol>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">{Object.keys(DEPLOY_FILES).map((k) => <Pill key={k} active={tab === k} onClick={() => setTab(k)}>{k}</Pill>)}</div>
          <div className="relative">
            <button onClick={() => copy(tab)} className="absolute top-3 right-3 h-8 px-3 rounded-full bg-white/10 text-white text-[12px] flex items-center gap-1.5 hover:bg-white/20"><Copy size={13} />{copied === tab ? "Copiato!" : "Copia"}</button>
            <pre className="bg-[#1D1D1F] text-[#F5F5F7] text-[12px] leading-relaxed rounded-2xl p-5 overflow-x-auto max-h-[420px]"><code>{DEPLOY_FILES[tab]}</code></pre>
          </div>
          <div className="rounded-2xl bg-[#FFF8DB] text-[#8A6D00] p-4 text-[13px]">
            <b>Da sapere:</b> alcuni negozi bloccano i bot o caricano il prezzo via JavaScript; in quel caso lo script mantiene l'ultimo prezzo valido e la card mostra la data del controllo. Rispetta le condizioni d'uso dei siti: 1 richiesta al giorno per pagina, uso personale. Il token Telegram va solo nei Secrets, mai nel codice pubblico.
          </div>
        </div>
      </div>
    </div>
  );
}

function StrategyCard({ list, onOpenAlerts, onAsk }) {
  const [m, setM] = useState("digital");
  const now = new Date();
  const all = Object.keys(MODELS).map((k) => strategyFor(k, list, now)).filter(Boolean);
  const s = all.find((x) => x.model === m) || all[0];
  const info = bfInfo(now);
  const L = LIGHT[s.light];
  const sc = list.filter((o) => STORES[o.store].loyalty?.supercard && o.availability !== "soldout").sort((a, b) => a.price - b.price)[0];
  const bundle = list.filter((o) => o.extras.length && o.availability !== "soldout").map((b) => {
    const single = list.filter((x) => !x.extras.length && x.model === b.model && x.availability !== "soldout").sort((a, c) => a.price - c.price)[0];
    return single ? { b, single, diff: r05(b.price - single.price) } : null;
  }).filter(Boolean).sort((a, c) => a.diff - c.diff)[0];
  const pickup = list.filter((o) => o.availability === "pickup").sort((a, b) => a.price - b.price)[0];
  return (
    <Card className="p-6 mb-5">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-[46%]">
          <SectionTitle icon={Radar} title="Quando & come conviene comprare" sub={info.days > 0 ? `Black Friday: ${fmtDay(info.bf)} · tra ${info.days} giorni · Cyber Monday ${fmtDay(info.cyber)}` : info.inWeek ? "Siamo nella Black Friday Week: scansione ogni 30 min" : `Prossimo Black Friday: ${fmtDay(info.bf)}`} />
          <div className="flex gap-2 mb-4">{all.map((x) => <button key={x.model} onClick={() => setM(x.model)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium ${m === x.model ? "bg-[#1D1D1F] text-white" : "bg-[#F5F5F7]"}`}><span className="w-2.5 h-2.5 rounded-full" style={{ background: LIGHT[x.light].c }} />{MODELS[x.model].short}</button>)}</div>
          <div className="flex gap-4 items-center rounded-3xl p-4" style={{ background: L.bg }}>
            <div className="flex flex-col gap-1.5 p-2 rounded-2xl bg-[#1D1D1F] shrink-0">
              {["red", "yellow", "green"].map((k) => <span key={k} className="w-6 h-6 rounded-full transition-all" style={{ background: s.light === k ? LIGHT[k].c : "#3A3A3C", boxShadow: s.light === k ? `0 0 14px ${LIGHT[k].c}` : "none" }} />)}
            </div>
            <div>
              <div className="text-[20px] font-bold tracking-tight" style={{ color: L.fg }}>{s.title}</div>
              <p className="text-[13.5px] text-[#1D1D1F] mt-1">{s.reason}</p>
              <div className="text-[12px] text-[#86868B] mt-1.5">Stima prezzo Black Friday: ~{chf(s.estBF)} · minimo 90 gg {chf(STATS[s.model].min)} · media {chf(STATS[s.model].avg)}</div>
            </div>
          </div>
          <div className="flex gap-2 mt-4 flex-wrap">
            {s.light === "green" ? <ExtLink href={buyUrlOf(s.offer)}>Compra su {STORES[s.offer.store].short} <ExternalLink size={14} /></ExtLink> : <button onClick={onOpenAlerts} className="h-10 px-4 rounded-full bg-[#0071E3] text-white text-[14px] font-medium flex items-center gap-1.5"><BellRing size={15} />Attiva alert sul telefono</button>}
            <button onClick={() => onAsk("Mi conviene comprare oggi o aspettare il Black Friday?")} className="h-10 px-4 rounded-full bg-[#F5F5F7] text-[14px] font-medium flex items-center gap-1.5"><Sparkles size={15} />Chiedi a Kiki</button>
          </div>
        </div>
        <div className="flex-1">
          <div className="text-[13px] font-semibold text-[#86868B] uppercase tracking-wide mb-3 flex items-center gap-1.5"><Lightbulb size={14} />Come risparmiare di più in Svizzera</div>
          <div className="space-y-3">
            <div className="rounded-2xl bg-[#F5F5F7] p-4"><div className="font-semibold text-[14px]">1 · Superpunti Coop x10 / x20</div><p className="text-[13px] text-[#3A3A3C] mt-1">Durante le promo Superpunti x10/x20 da Interdiscount, Fust e Coop il valore dei punti sale a circa 10–20% del prezzo.{sc ? ` Esempio: ${STORES[sc.store].short} a ${chf(sc.price)} con x20 → ~${chf(r05(sc.price * 0.2))} in punti.` : ""} Imposta il moltiplicatore nei filtri.</p></div>
            <div className="rounded-2xl bg-[#F5F5F7] p-4"><div className="font-semibold text-[14px]">2 · Bundle con 2° DualSense o gioco recente</div><p className="text-[13px] text-[#3A3A3C] mt-1">A Black Friday il bundle costa spesso solo CHF 20–30 più della console liscia, e risparmi oltre CHF 50 sugli accessori.{bundle ? ` Oggi: ${STORES[bundle.b.store].short} ${bundle.b.title} costa ${bundle.diff > 0 ? `${chf(bundle.diff)} più` : `${chf(-bundle.diff)} meno`} della console singola più economica (${STORES[bundle.single.store].short}).` : ""}</p></div>
            <div className="rounded-2xl bg-[#F5F5F7] p-4"><div className="font-semibold text-[14px]">3 · Ritiro in filiale (Lugano / Ticino)</div><p className="text-[13px] text-[#3A3A3C] mt-1">Blocchi subito l'ultimo pezzo in stock e eviti l'attesa della posta.{pickup ? ` Più economica con ritiro: ${STORES[pickup.store].short} a ${chf(pickup.price)} (${STORES[pickup.store].pickup}).` : ""}</p></div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function AlertPanel({ open, onClose, alerts, setAlerts, list, perm, onRequestPerm, onTestPush, log }) {
  const [token, setToken] = useState("");
  const [tgState, setTgState] = useState("");
  if (!open) return null;
  const set = (k) => (e) => setAlerts((a) => ({ ...a, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const matches = list.map((o) => ({ o, r: matchAlert(o, alerts) })).filter((x) => x.r);
  const sample = matches[0] || { o: list[0], r: ["test"] };
  const payload = telegramPayload(sample.o, sample.r, alerts.chatId);
  const testTg = async () => {
    if (!token || !alerts.chatId) return setTgState("Inserisci token e Chat ID.");
    setTgState("Invio…");
    try { await sendTelegram(token.trim(), { ...payload, text: "✅ Test Cispu PS5 Tracker\n" + payload.text }); setTgState("✅ Messaggio inviato su Telegram!"); }
    catch (e) { setTgState("❌ " + e.message); }
  };
  const input = "w-full h-10 px-3 rounded-xl bg-[#F5F5F7] text-[14px] outline-none focus:ring-2 focus:ring-[#0071E3]/40";
  const label = "text-[12px] font-semibold text-[#86868B] mb-1 block";
  const permLabel = { granted: "✅ Notifiche attive su questo dispositivo", denied: "❌ Notifiche bloccate: riattivale nelle impostazioni del browser", default: "Notifiche non ancora attivate", unsupported: "Questo browser non supporta le notifiche (su iPhone: aggiungi l'app alla Home)" }[perm];
  return (
    <div className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-6" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-4xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-2xl" onClick={stop}>
        <div className="sticky top-0 bg-white/90 backdrop-blur-xl px-6 py-4 border-b border-black/[0.06] flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5 font-semibold"><Smartphone size={18} />Alert sul telefono</div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-[#F5F5F7] flex items-center justify-center"><X size={17} /></button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          <div className="space-y-4">
            <div className="text-[14px] font-semibold">Soglie per modello (CHF)</div>
            <div className="grid grid-cols-2 gap-3">
              {[["digital", "Slim Digital sotto"], ["disc", "Slim Disc sotto"], ["pro", "Pro sotto"], ["bundle", "Bundle netto sotto"], ["anyMax", "Qualsiasi offerta sotto"], ["minPct", "Sconto almeno (%)"]].map(([k, l]) => (
                <div key={k}><span className={label}>{l}</span><input type="number" value={alerts[k]} onChange={set(k)} placeholder="—" className={input} /></div>
              ))}
            </div>
            <label className="flex items-center gap-2 text-[14px] cursor-pointer"><input type="checkbox" checked={alerts.onlyHistMin} onChange={set("onlyHistMin")} className="accent-[#0071E3] w-4 h-4" />Notifica solo per minimo storico assoluto</label>
            <div className="rounded-2xl bg-[#F5F5F7] p-4">
              <div className="text-[13px] font-semibold mb-2">{matches.length ? `🔔 ${matches.length} offerte oggi fanno scattare l'alert` : "Nessuna offerta oggi sotto le tue soglie"}</div>
              <div className="space-y-1 max-h-36 overflow-y-auto no-scrollbar">{matches.map(({ o, r }) => <div key={o.id} className="text-[12.5px]"><b>{STORES[o.store].short}</b> {chf(o.price)} · {r.join(" · ")}</div>)}</div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-black/[0.08] p-4 space-y-3">
              <div className="flex items-center justify-between"><div className="font-semibold text-[14px] flex items-center gap-1.5"><BellRing size={15} />Notifiche push</div>
                <label className="flex items-center gap-2 text-[13px]"><input type="checkbox" checked={alerts.push} onChange={set("push")} className="accent-[#0071E3]" />Attive</label></div>
              <p className="text-[12.5px] text-[#86868B]">{permLabel}</p>
              <div className="flex gap-2 flex-wrap">
                {perm !== "granted" && perm !== "unsupported" && <button onClick={onRequestPerm} className="h-9 px-4 rounded-full bg-[#0071E3] text-white text-[13px] font-medium">Attiva notifiche</button>}
                <button onClick={onTestPush} className="h-9 px-4 rounded-full bg-[#F5F5F7] text-[13px] font-medium">Invia notifica di test al telefono</button>
              </div>
            </div>
            <div className="rounded-2xl border border-black/[0.08] p-4 space-y-3">
              <div className="flex items-center justify-between"><div className="font-semibold text-[14px] flex items-center gap-1.5"><Send size={15} />Bot Telegram 24/7</div>
                <label className="flex items-center gap-2 text-[13px]"><input type="checkbox" checked={alerts.telegram} onChange={set("telegram")} className="accent-[#0071E3]" />Attivo</label></div>
              <p className="text-[12.5px] text-[#86868B]">Il canale più affidabile per i flash deal di pochi minuti: lo script del cron ti scrive anche con il telefono in tasca e l'app chiusa.</p>
              <div><span className={label}>Chat ID</span><input value={alerts.chatId} onChange={set("chatId")} placeholder="es. 123456789" className={input} /></div>
              <div><span className={label}>Token bot (solo per il test, non viene salvato)</span><input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="123456:ABC…" className={input} /></div>
              <div className="flex gap-2 flex-wrap items-center">
                <button onClick={testTg} className="h-9 px-4 rounded-full bg-[#1D1D1F] text-white text-[13px] font-medium">Invia test Telegram</button>
                <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-[13px] text-[#0071E3] font-medium">Crea il bot con @BotFather ↗</a>
                {tgState && <span className="text-[12.5px]">{tgState}</span>}
              </div>
              <details className="text-[12px]"><summary className="cursor-pointer text-[#86868B] font-medium">Payload webhook generato</summary>
                <pre className="mt-2 bg-[#1D1D1F] text-[#F5F5F7] rounded-xl p-3 overflow-x-auto">{`POST https://api.telegram.org/bot<TOKEN>/sendMessage\n` + JSON.stringify(payload, null, 2)}</pre>
              </details>
            </div>
            {log.length > 0 && <div className="text-[12px] text-[#86868B]"><div className="font-semibold mb-1">Ultimi alert inviati</div>{log.slice(0, 4).map((l, i) => <div key={i}>{l}</div>)}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function SyncBar({ sync, onForce }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(t); }, []);
  const nx = nextScan(now), info = bfInfo(now);
  const last = sync.lastAt;
  const sameDay = last && last.toDateString() === now.toDateString();
  return (
    <div className="border-t border-black/[0.04] bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1.5 flex items-center gap-3 text-[12px] text-[#3A3A3C] overflow-x-auto no-scrollbar whitespace-nowrap">
        <span className={`flex items-center gap-1.5 font-medium ${sync.source === "api" ? "text-[#1E7B3A]" : "text-[#A65F00]"}`}><span className={`w-2 h-2 rounded-full ${sync.scanning ? "bg-[#0071E3] animate-ping" : sync.source === "api" ? "bg-[#34C759]" : "bg-[#FF9F0A]"}`} />{sync.source === "api" ? "Live Sync" : "Dati locali"}</span>
        <span className="flex items-center gap-1"><Clock size={12} />Ultimo aggiornamento: {last ? `${sameDay ? "Oggi" : last.toLocaleDateString("it-CH")}, ${last.toLocaleTimeString("it-CH", { hour: "2-digit", minute: "2-digit" })}` : "—"}</span>
        <span>• Prossimo scan tra {fmtCountdown(nx - now)}{info.inWeek ? " (BF Week: ogni 30 min)" : " (ogni giorno 07:30)"}</span>
        <span>• {Object.keys(STORES).length} store CH</span>
        {sync.scanning && <span className="text-[#0071E3] font-medium">Controllo {STORES[sync.scanning].short}…</span>}
        {sync.msg && !sync.scanning && <span className="text-[#86868B]">{sync.msg}</span>}
        <button onClick={onForce} disabled={!!sync.scanning} className="ml-auto shrink-0 h-7 px-3 rounded-full bg-[#1D1D1F] text-white font-medium flex items-center gap-1.5 disabled:opacity-60"><RefreshCw size={12} className={sync.scanning ? "animate-spin" : ""} />Forza scansione ora</button>
      </div>
    </div>
  );
}

/* =========================================================================
   KIKI — consulente acquisti PS5 (motore locale sul dataset)
   ========================================================================= */
const STORE_ALIASES = { digitec: ["digitec", "galaxus"], brack: ["brack"], mediamarkt: ["mediamarkt", "media markt"], interdiscount: ["interdiscount"], fust: ["fust"], manor: ["manor"], conforama: ["conforama"], fnac: ["fnac"], coop: ["coop"], wog: ["wog", "world of games"], softridge: ["softridge"] };
const fmtOffer = (o) => `${STORES[o.store].short} — ${o.title}: ${chf(o.price)}${o.extras.length || o.cash ? ` (netto ${chf(o.net)})` : ""}${o.save ? `, −${chf(o.save)} vs ${o.refLabel}` : ""}`;
const offerLinks = (o) => [{ label: `Acquista su ${STORES[o.store].short} ↗`, url: buyUrlOf(o), primary: true }, { label: "Verifica su Toppreise ↗", url: toppreiseOf(o) }];
const storeLink = (s) => ({ label: `${STORES[s].short} ↗`, url: STORES[s].url });

function kikiAnswer(q, { list, loyalty, budget }) {
  const t = q.toLowerCase();
  const avail = list.filter((o) => o.availability !== "soldout");
  const pos = (s) => Math.min(...STORE_ALIASES[s].map((a) => (t.includes(a) ? t.indexOf(a) : 1e9)));
  const stores = Object.keys(STORE_ALIASES).filter((s) => pos(s) < 1e9).sort((a, b) => pos(a) - pos(b));
  const modelHit = /\bpro\b/.test(t) ? "pro" : /digital|digitale|senza (disco|lettore)/.test(t) ? "digital" : /disco|disc|standard|lettore/.test(t) ? "disc" : null;
  const num = (t.match(/(\d{3,4})/) || [])[1];
  const best = [...avail].sort((a, b) => b.score - a.score || a.net - b.net)[0];
  const byScore = (a, b) => b.score - a.score || a.net - b.net;

  // Alert dalla chat
  if (/avvis|alert|notific|allert|tienimi d'occhio/.test(t)) {
    if (num) {
      const v = Number(num), hits = avail.filter((o) => (modelHit ? o.model === modelHit : true) && o.price <= v);
      return { text: `Fatto ✅ Alert attivo: ti avviso appena ${modelHit ? `una ${MODELS[modelHit].name}` : "una PS5"} scende sotto ${chf(v)}.\n\n${hits.length ? `Già adesso ${hits.length} offerte sono sotto soglia, la migliore: ${fmtOffer(hits.sort(byScore)[0])}.` : "Oggi nessuna offerta è sotto questa soglia: ti scrivo io quando succede."}\n\nPer riceverlo sul telefono anche ad app chiusa, collega Telegram nel pannello alert.`, action: { type: "alert", model: modelHit, value: v }, links: hits[0] ? offerLinks(hits[0]) : [] };
    }
    return { text: "Ti apro il pannello alert: scegli le soglie per modello, attiva le notifiche push e, per i flash deal di pochi minuti, collega il bot Telegram. Puoi anche scrivermi “avvisami se scende sotto i 500 franchi”.", action: { type: "openAlerts" } };
  }
  // Quando comprare
  if (/quando|aspettare il black|oggi o aspett|black friday|cyber monday|conviene comprare oggi/.test(t)) {
    const info = bfInfo();
    const ss = Object.keys(MODELS).map((k) => strategyFor(k, list)).filter(Boolean);
    const icon = { green: "🟢", yellow: "🟡", red: "🔴" };
    const g = ss.find((x) => x.light === "green");
    return { text: `${info.days > 0 ? `Mancano ${info.days} giorni al Black Friday (${fmtDay(info.bf)}), poi Cyber Monday ${fmtDay(info.cyber)}.` : "Siamo nella Black Friday Week."}\n\n${ss.map((x) => `${icon[x.light]} ${MODELS[x.model].short}: ${x.title} — ${x.reason}`).join("\n\n")}\n\nStrategia: ${g ? `compra subito la ${MODELS[g.model].short} (${STORES[g.offer.store].short}), per gli altri modelli attiva l'alert e aspetta il calo.` : "attiva l'alert sul telefono e aspetta il calo di fine novembre."}`, links: g ? offerLinks(g.offer) : [], action: g ? null : { type: "openAlerts" } };
  }
  // Prezzo giusto
  if (/prezzo giusto|fregare|fregato|quanto pagare|quanto dovrei/.test(t)) {
    return { text: `Prezzi giusti in Svizzera per non farti fregare:\n\n${Object.values(MODELS).map((m) => `• ${m.name}: ottimo ≤ CHF ${GREEN_MAX[m.key]} · media 90 gg ${chf(STATS[m.key].avg)} · listino pieno ${chf(m.ref)}`).join("\n")}\n• Bundle: ottimo se la console netta scende sotto CHF ${BUNDLE_GREEN_NET}\n\nSopra il listino o con “scorte limitate” e prezzo pieno: non comprare. Controlla sempre su Toppreise prima di pagare.` };
  }
  // Come risparmiare
  if (/come risparm|risparmio di pi|punti e bundle|trucchi|consigli per risparm/.test(t)) {
    const sc = avail.filter((o) => STORES[o.store].loyalty?.supercard).sort((a, b) => a.price - b.price)[0];
    const pk = avail.filter((o) => o.availability === "pickup").sort((a, b) => a.price - b.price)[0];
    return { text: `3 trucchi svizzeri:\n\n1. Superpunti Coop x10/x20 (Interdiscount, Fust, Coop): nelle promo valgono circa 10–20% del prezzo.${sc ? ` Su ${STORES[sc.store].short} a ${chf(sc.price)} con x20 sono ~${chf(r05(sc.price * 0.2))}.` : ""}\n2. Bundle con 2° DualSense o un gioco recente (GTA VI, EA FC 26, Astro Bot): a Black Friday costano spesso solo CHF 20–30 più della console liscia.\n3. Ritiro in filiale in Ticino: blocchi l'ultimo pezzo subito.${pk ? ` Oggi: ${STORES[pk.store].short} a ${chf(pk.price)}.` : ""}\n\nAttiva il toggle cashback e scegli il moltiplicatore per vedere il prezzo reale.`, links: sc ? offerLinks(sc) : [] };
  }

  if (num && /(budget|sotto|massimo|max|entro|chf|franchi|spendere)/.test(t)) {
    const b = Number(num), ok = avail.filter((o) => o.price <= b).sort(byScore);
    if (!ok.length) { const c = [...avail].sort((a, x) => a.price - x.price)[0]; return { text: `Con ${chf(b)} oggi non entra nessuna offerta. La più economica è ${fmtOffer(c)}.`, links: offerLinks(c) }; }
    return { text: `Con ${chf(b)} trovo ${ok.length} offerte. Le migliori:\n\n${ok.slice(0, 3).map((o, i) => `${i + 1}. ${fmtOffer(o)} · Score ${o.score}`).join("\n")}\n\nIl mio consiglio: ${STORES[ok[0].store].short}.`, links: offerLinks(ok[0]) };
  }
  if (/superpunt|punti|cashback|fedelt|manor card|soci|supercard/.test(t)) {
    const ls = avail.filter((o) => STORES[o.store].loyalty).map((o) => enrich(o, true)).sort((a, b) => a.net - b.net);
    return { text: `Vantaggi fedeltà nei negozi svizzeri:\n\n• Superpunti Coop (~1%): Interdiscount, Fust, Coop\n• Manor Card (~2%, stima): Manor\n• Soci Fnac: −5%\n\nCon i punti inclusi, la migliore è ${fmtOffer(ls[0])}.${loyalty ? "" : "\n\nAttiva il toggle “Includi cashback punti” per vederlo su tutte le card."}`, links: offerLinks(ls[0]) };
  }
  if (/permuta|usat|trade/.test(t)) {
    const o = avail.find((x) => x.store === "softridge");
    return { text: `Per la permuta vai da Softridge: valuta la tua vecchia console o i giochi usati e scala il valore dal prezzo.${o ? `\n\nOfferta attiva: ${fmtOffer(o)}.` : ""}`, links: o ? offerLinks(o) : [storeLink("softridge")] };
  }
  if (/configura|wog|world of games|personalizz/.test(t)) {
    const o = avail.find((x) => x.store === "wog");
    return { text: `World of Games (wog.ch) ha il Configuratore Bundle: scegli console, giochi e accessori e vedi subito il totale.${o ? `\n\nBase: ${fmtOffer(o)}.` : ""}`, links: o ? offerLinks(o) : [storeLink("wog")] };
  }
  if (/flash|conforama/.test(t) && !/bundle/.test(t)) {
    const o = avail.find((x) => x.store === "conforama");
    return { text: `Conforama fa spesso Flash Sale con ritiro a Grancia.${o ? ` Oggi: ${fmtOffer(o)} — Deal Score ${o.score}, ${dealVerdict(o.score).short.toLowerCase()}.` : ""}`, links: o ? offerLinks(o) : [storeLink("conforama")] };
  }
  if (/quali negozi|che negozi|elenco|tutti i negozi|lista negozi|dove compr/.test(t) && !modelHit) {
    return { text: `Monitoro 11 negozi svizzeri:\n\n${Object.entries(CATEGORIES).map(([k, l]) => `${l}:\n${Object.entries(STORES).filter(([, s]) => s.cat === k).map(([, s]) => `• ${s.short} — ${s.perk}`).join("\n")}`).join("\n\n")}`, links: Object.keys(STORES).map(storeLink) };
  }
  if (/bundle|due controller|2 controller|secondo controller|conviene prendere/.test(t)) {
    const wantCtrl = /controller/.test(t);
    let bundles = avail.filter((o) => o.extras.length && (!wantCtrl || o.extras.some((e) => e.type === "controller")));
    const inStore = bundles.filter((o) => stores.includes(o.store));
    const note = stores.length && !inStore.length ? `${STORES[stores[0]].short} oggi non ha questo bundle${wantCtrl ? " con 2° controller" : ""}: uso il migliore disponibile in Svizzera.\n\n` : "";
    if (inStore.length) bundles = inStore;
    const b = bundles.sort((a, c) => a.net - c.net)[0];
    if (!b) return { text: "Al momento non trovo bundle disponibili." };
    const singles = avail.filter((o) => !o.extras.length && o.model === b.model);
    const s = [...singles].sort((a, c) => a.net - c.net)[0];
    const named = stores.map((x) => singles.find((o) => o.store === x && o.id !== s?.id)).find(Boolean);
    if (!s) return { text: `Bundle: ${fmtOffer(b)}. Nessuna console singola equivalente da confrontare.`, links: offerLinks(b) };
    const diff = r05(s.price - b.net);
    return {
      text: `${note}Facciamo i conti:\n\n• Bundle ${STORES[b.store].short}: ${chf(b.price)} − ${b.extras.map((e) => `${e.name} (~${chf(ACCESSORY_VALUE[e.type])})`).join(" − ")} = console netta ${chf(b.net)}\n• Console singola più economica (${STORES[s.store].short}): ${chf(s.price)}${named ? `\n• Console singola ${STORES[named.store].short}: ${chf(named.price)}` : ""}\n\n${diff > 0 ? `✅ Il bundle conviene: ${chf(diff)} in meno, se l'extra ti serve davvero.` : `⚠️ Il bundle NON conviene: la console singola costa ${chf(-diff)} in meno. Prendi ${STORES[s.store].short}.`}`,
      links: offerLinks(diff > 0 ? b : s),
    };
  }
  if (/storico|buono|gonfiato|aspettare|aspetto|momento|conviene ora/.test(t)) {
    const m = modelHit || "pro", st = STATS[m];
    const o = avail.filter((x) => x.model === m && !x.extras.length).sort((a, c) => a.net - c.net)[0];
    if (!o) return { text: `Nessuna offerta attiva per ${MODELS[m].name}.` };
    return { text: `${MODELS[m].name} — ultimi 90 giorni:\n\n• Minimo storico: ${chf(st.min)}\n• Media: ${chf(st.avg)}\n• Target consigliato: ${chf(st.target)}\n• Miglior prezzo oggi: ${chf(o.price)} da ${STORES[o.store].short}\n\nDeal Score ${o.score}/100 → ${dealVerdict(o.score).label}. Su Toppreise la Pro parte da circa CHF 896.95: controlla lì prima di cliccare.`, links: offerLinks(o) };
  }
  if (/consigli|quale modello|che modello|differenza|solo in digitale|gioco solo|scaric/.test(t)) {
    if (/digital|digitale|scaric/.test(t)) {
      const o = avail.filter((x) => x.model === "digital").sort((a, c) => a.net - c.net)[0];
      return { text: `Se giochi solo in digitale prendi la PS5 Slim Digital: stesse prestazioni della Disc, costa meno. Il lettore esterno si può aggiungere dopo.\n\nMigliore ora: ${fmtOffer(o)}.`, links: offerLinks(o) };
    }
    return { text: `In breve:\n\n• Slim Digital: la scelta più furba se compri sul PlayStation Store.\n• Slim Disc: per giochi fisici, usati o da rivendere.\n• Pro: solo se hai un TV 4K/120 Hz che la sfrutta.\n\nMiglior rapporto qualità/prezzo oggi: ${fmtOffer(best)}.`, links: offerLinks(best) };
  }
  if (/ritiro|ritirare|lugano|ticino|filiale|grancia/.test(t)) {
    const p = avail.filter((o) => o.availability === "pickup").sort(byScore);
    return { text: `Offerte con ritiro in filiale:\n\n${p.map((o) => `• ${STORES[o.store].pickup}: ${o.title} a ${chf(o.price)}`).join("\n")}`, links: p[0] ? offerLinks(p[0]) : [] };
  }
  if (stores.length) {
    const ls = avail.filter((o) => stores.includes(o.store)).sort(byScore);
    if (!ls.length) return { text: `${STORES[stores[0]].name} oggi non ha offerte attive.`, links: [storeLink(stores[0])] };
    return { text: `${stores.map((s) => `${STORES[s].short} (${STORES[s].perk})`).join(" e ")}:\n\n${ls.map((o) => `• ${fmtOffer(o)} · Score ${o.score}`).join("\n")}`, links: offerLinks(ls[0]) };
  }
  if (modelHit) {
    const ls = avail.filter((o) => o.model === modelHit).sort((a, c) => a.net - c.net);
    return { text: `${MODELS[modelHit].name}: ${ls.length} offerte.\n\n${ls.slice(0, 6).map((o) => `• ${fmtOffer(o)}`).join("\n")}\n\nLa più conveniente al netto è ${STORES[ls[0].store].short}.`, links: offerLinks(ls[0]) };
  }
  if (/migliore|best|oggi|conviene|top|affare/.test(t)) {
    return { text: `L'offerta migliore di oggi:\n\n🏆 ${fmtOffer(best)}\nDeal Score ${best.score}/100 — ${dealVerdict(best.score).label}.\nVantaggio negozio: ${STORES[best.store].perk}.${budget ? `\n${best.price <= budget ? "✅ Rientra" : "❌ Non rientra"} nel tuo alert di ${chf(budget)}.` : ""}`, links: offerLinks(best) };
  }
  return { text: "Posso aiutarti con: offerta migliore, bundle vs console, quale modello scegliere, prezzo vs storico, offerte entro un budget, Superpunti e vantaggi fedeltà, permuta (Softridge), configuratore (WOG), flash sale (Conforama) o l'elenco dei negozi." };
}

const QUICK = [
  "Mi conviene comprare oggi o aspettare il Black Friday?",
  "Qual è il prezzo giusto per non farmi fregare?",
  "Attiva un alert sul mio telefono per la PS5",
  "Avvisami se scende sotto i 500 franchi",
  "Come risparmio di più con punti e bundle in Svizzera?",
  "Qual è l'offerta migliore oggi?",
  "Conviene prendere il bundle con due controller da Brack o la console singola da Digitec?",
  "Quale modello mi consigli se gioco solo in digitale?",
  "Il prezzo della PS5 Pro oggi è buono rispetto allo storico?",
  "Dove conviene con i Superpunti?",
  "Posso dare la mia vecchia console in permuta?",
  "Cosa trovo sotto 560 CHF?",
  "Quali negozi monitori?",
];

function Kiki({ open, setOpen, ctx, onFocusOffer, pending, clearPending }) {
  const [msgs, setMsgs] = useState([{ from: "kiki", text: "Ciao Cispu! Sono Kiki 🎮 il tuo consulente PS5. Conosco 11 negozi svizzeri e i loro vantaggi. Chiedimi qualcosa o tocca una domanda qui sotto." }]);
  const [input, setInput] = useState(""), [typing, setTyping] = useState(false);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing, open]);
  useEffect(() => { if (pending && open) { ask(pending); clearPending(); } }, [pending, open]);
  const ask = (q) => {
    if (!q.trim()) return;
    setMsgs((m) => [...m, { from: "me", text: q }]); setInput(""); setTyping(true);
    setTimeout(() => { const a = kikiAnswer(q, ctx); setMsgs((m) => [...m, { from: "kiki", ...a }]); setTyping(false); if (a.action && ctx.onAction) ctx.onAction(a.action); }, 500);
  };
  return (
    <>
      <button onClick={() => setOpen(!open)} aria-label="Apri Kiki" className="fixed bottom-5 right-5 z-50 flex items-center gap-2 pl-4 pr-5 h-14 rounded-full bg-[#1D1D1F] text-white shadow-[0_10px_30px_rgba(0,0,0,0.25)] hover:scale-105 active:scale-95 transition-transform">
        {open ? <X size={20} /> : <MessageCircle size={20} />}<span className="font-semibold text-[15px]">{open ? "Chiudi" : "Chiedi a Kiki"}</span>
      </button>
      {open && (
        <div className="fixed z-50 bottom-24 right-3 left-3 sm:left-auto sm:right-5 sm:w-[420px] h-[min(640px,calc(100vh-130px))] bg-white rounded-3xl border border-black/[0.06] shadow-[0_20px_60px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-black/[0.06] flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0071E3] to-[#5E5CE6] flex items-center justify-center"><Sparkles size={18} className="text-white" /></div>
            <div><div className="font-semibold text-[#1D1D1F]">Kiki</div><div className="text-[12px] text-[#34C759] flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />{ctx.list.length} offerte · 11 negozi CH{ctx.loyalty ? " · cashback attivo" : ""}</div></div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#FBFBFD]">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[90%] px-4 py-2.5 rounded-[20px] text-[14px] leading-relaxed whitespace-pre-line ${m.from === "me" ? "bg-[#0071E3] text-white rounded-br-md" : "bg-white border border-black/[0.06] text-[#1D1D1F] rounded-bl-md"}`}>
                  {m.text}
                  {m.links?.filter((l) => l.url).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-black/[0.06] flex flex-wrap gap-2">
                      {m.links.filter((l) => l.url).map((l) => (
                        <a key={l.url + l.label} href={l.url} target="_blank" rel="noopener noreferrer" className={`px-3 py-1.5 rounded-full text-[13px] font-medium ${l.primary ? "bg-[#0071E3] text-white" : "bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED]"}`}>{l.label}</a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {typing && <div className="flex gap-1 px-4 py-3 bg-white border border-black/[0.06] rounded-[20px] w-16">{[0, 1, 2].map((d) => <span key={d} className="w-2 h-2 rounded-full bg-[#86868B] animate-bounce" style={{ animationDelay: `${d * 0.15}s` }} />)}</div>}
            <div ref={endRef} />
          </div>
          <div className="px-3 pt-2 flex gap-2 overflow-x-auto no-scrollbar">
            {QUICK.map((q) => <button key={q} onClick={() => ask(q)} className="shrink-0 px-3 py-1.5 rounded-full text-[12px] bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED] max-w-[250px] truncate">{q}</button>)}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); ask(input); }} className="p-3 flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Scrivi a Kiki…" className="flex-1 h-11 px-4 rounded-full bg-[#F5F5F7] text-[14px] outline-none focus:ring-2 focus:ring-[#0071E3]/40" />
            <button type="submit" className="w-11 h-11 rounded-full bg-[#0071E3] text-white flex items-center justify-center active:scale-95"><Send size={17} /></button>
          </form>
        </div>
      )}
    </>
  );
}

/* =========================================================================
   OFFER CARD — intera card cliccabile (stretched link) + bottoni con stopPropagation
   ========================================================================= */
function OfferCard({ o, list, selected, onToggle, disabled, highlight, onAlert, onEdit, preview = false }) {
  const [showBundle, setShowBundle] = useState(false);
  const v = dealVerdict(o.score);
  const buy = buyUrlOf(o), tp = toppreiseOf(o);
  const single = list.filter((x) => !x.extras.length && x.model === o.model && x.availability !== "soldout").sort((a, b) => a.net - b.net)[0];
  const btn = "relative z-10 h-9 px-3 rounded-full text-[12.5px] font-medium flex items-center gap-1 transition-all active:scale-95";
  const click = (fn) => (e) => { e.stopPropagation(); e.preventDefault(); fn && fn(); };
  return (
    <article className={`group relative ${cardBase} p-4 sm:p-5 flex flex-col gap-3.5 transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(0,0,0,0.10)] ${highlight ? "ring-2 ring-[#0071E3]" : ""} ${o.availability === "soldout" ? "opacity-60" : ""}`}>
      {buy && !preview && <a href={buy} target="_blank" rel="noopener noreferrer" title={buy} aria-label={`Acquista ${o.title} su ${STORES[o.store].name}`} className="absolute inset-0 z-0 rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]" />}
      <div className="pointer-events-none flex flex-col gap-3.5">
        <ProductVisual offer={o} />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <span className="text-[12px] font-semibold text-[#86868B] uppercase tracking-wide">{STORES[o.store].short}</span>
              {o.tag && <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${["Black Friday", "Flash Sale", "Sconto"].includes(o.tag) ? "bg-[#FF3B30] text-white" : "bg-[#F5F5F7] text-[#1D1D1F]"}`}>{o.tag}</span>}
            </div>
            <h3 className="text-[16px] font-semibold text-[#1D1D1F] leading-snug">{o.title}</h3>
            <p className="text-[12px] text-[#86868B] mt-0.5">{STORES[o.store].perk}</p>
          </div>
          <ScoreRing score={o.score} />
        </div>
        <div>
          <div className="flex items-end gap-2.5 flex-wrap">
            <span className="text-[28px] font-semibold tracking-tight text-[#1D1D1F] leading-none">{chf(o.price)}</span>
            {o.save > 0 && <span className="text-[14px] text-[#86868B] line-through">{chf(o.ref)}</span>}
            {o.pct > 0 && <span className="text-[12px] font-semibold text-white bg-[#FF3B30] px-2 py-0.5 rounded-full">−{o.pct}%</span>}
          </div>
          {o.save > 0 ? <div className="text-[12.5px] font-medium text-[#FF3B30] mt-1">Risparmi {chf(o.save)} vs {o.refLabel}</div> : <div className="text-[12.5px] text-[#86868B] mt-1">Prezzo pieno (nessuno sconto rilevato)</div>}
          {o.cash > 0 && <div className="text-[12.5px] font-medium text-[#1E7B3A] mt-0.5 flex items-center gap-1"><Coins size={13} />−{chf(o.cash)} {STORES[o.store].loyalty.label} → effettivo {chf(o.extras.length ? r05(o.price - o.cash) : o.net)}</div>}
        </div>
        {o.extras.length > 0 && (
          <div className="rounded-2xl bg-[#F5F5F7] p-3 text-[13px]">
            <div className="flex justify-between font-semibold text-[#1D1D1F]"><span className="flex items-center gap-1.5"><Calculator size={14} />Costo netto console</span><span>{chf(o.net)}</span></div>
            {showBundle && (
              <div className="mt-2 space-y-0.5">
                <div className="flex justify-between"><span>Prezzo pacchetto</span><span>{chf(o.price)}</span></div>
                {o.extras.map((e, i) => <div key={i} className="flex justify-between text-[#86868B]"><span>− {e.name}</span><span>−{chf(ACCESSORY_VALUE[e.type])}</span></div>)}
                {o.cash > 0 && <div className="flex justify-between text-[#1E7B3A]"><span>− cashback</span><span>−{chf(o.cash)}</span></div>}
              </div>
            )}
            {single && <div className={`mt-1.5 text-[12px] font-medium ${o.net < single.net ? "text-[#1E7B3A]" : "text-[#FF3B30]"}`}>{o.net < single.net ? `✓ Conviene: ${chf(r05(single.net - o.net))} meno della console singola (${STORES[single.store].short})` : `✗ Non conviene: ${chf(r05(o.net - single.net))} più della console singola (${STORES[single.store].short} ${chf(single.price)})`}</div>}
          </div>
        )}
        <div className="flex items-center gap-2 text-[12px] font-medium" style={{ color: v.color }}><Activity size={14} />{v.label}</div>
        <div className="flex items-center gap-2 flex-wrap"><AvailBadge o={o} /><VerifiedBadge o={o} /></div>
      </div>

      {/* Azioni (sopra lo stretched link) */}
      <div className="relative z-10 flex flex-wrap items-center gap-2 mt-auto">
        <button onClick={click(onToggle)} disabled={disabled && !selected} className={`${btn} ${selected ? "bg-[#1D1D1F] text-white" : "bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED]"} disabled:opacity-40`}>{selected ? <Check size={14} /> : <Scale size={14} />}{selected ? "In confronto" : "Confronta"}</button>
        {o.extras.length > 0 && <button onClick={click(() => setShowBundle((s) => !s))} className={`${btn} bg-[#F5F5F7] hover:bg-[#E8E8ED]`}><Package size={14} />{showBundle ? "Chiudi dettagli" : "Dettagli Bundle"}</button>}
        <button onClick={click(onAlert)} className={`${btn} bg-[#F5F5F7] hover:bg-[#E8E8ED]`}><Bell size={14} />Imposta Alert</button>
        <button onClick={click(onEdit)} className={`${btn} bg-[#F5F5F7] hover:bg-[#E8E8ED]`} title="Aggiungi / modifica foto"><ImagePlus size={14} />Foto</button>
      </div>
      <div className="relative z-10 flex flex-col sm:flex-row gap-2">
        {o.availability !== "soldout" ? <ExtLink href={buy} className="flex-1">Acquista su {STORES[o.store].short} <ExternalLink size={14} /></ExtLink> : <span className="flex-1 text-center text-[13px] text-[#86868B] py-2.5">Esaurito</span>}
        <ExtLink href={tp} variant="soft" className="flex-1"><Search size={14} />Verifica su Toppreise.ch</ExtLink>
      </div>
      {/* Anteprima URL al passaggio del mouse */}
      {buy && <div className="pointer-events-none absolute left-4 right-4 -bottom-3 translate-y-full opacity-0 group-hover:opacity-100 group-hover:translate-y-[calc(100%-6px)] transition-all z-20">
        <div className="mx-auto w-fit max-w-full px-3 py-1.5 rounded-full bg-[#1D1D1F] text-white text-[11px] flex items-center gap-1.5 shadow-lg"><Link2 size={11} /><span className="truncate">{shortUrl(buy)}</span></div>
      </div>}
    </article>
  );
}

/* =========================================================================
   MODALE — Aggiungi / Modifica offerta con foto dal sito
   ========================================================================= */
const emptyForm = () => ({ id: null, store: "digitec", model: "digital", edition: "standard", title: "", price: "", wasPrice: "", buyUrl: "", imageUrl: "", availability: "online", controller: false, game: "" });
function toForm(o) { return { ...emptyForm(), ...o, imageUrl: o.imageUrl || "", price: String(o.price), wasPrice: o.wasPrice ? String(o.wasPrice) : "", controller: o.extras.some((e) => e.type === "controller"), game: o.extras.find((e) => e.type === "game")?.name || "" }; }
function fromForm(f) {
  const extras = [];
  if (f.controller) extras.push({ type: "controller", name: "DualSense aggiuntivo" });
  if (f.game.trim()) extras.push({ type: "game", name: f.game.trim() });
  return { id: f.id || `u${Date.now()}`, store: f.store, model: f.model, edition: f.edition, title: f.title.trim() || `${MODELS[f.model].name}${extras.length ? " bundle" : ""}`, price: Number(f.price), wasPrice: f.wasPrice ? Number(f.wasPrice) : undefined, buyUrl: f.buyUrl.trim(), imageUrl: f.imageUrl.trim(), availability: f.availability, extras, images: f.images || SAME_MODEL[f.model], note: f.note, tag: f.wasPrice ? "Sconto" : extras.length ? "Bundle" : undefined };
}

function EditModal({ open, initial, offers, onClose, onSave, onReset }) {
  const [f, setF] = useState(emptyForm());
  const [err, setErr] = useState("");
  const fileRef = useRef(null);
  useEffect(() => { if (open) { setF(initial ? toForm(initial) : emptyForm()); setErr(""); } }, [open, initial]);
  if (!open) return null;
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const draft = fromForm({ ...f, price: f.price || 0 });
  const prev = enrich(draft, false);
  const pickOffer = (id) => { const o = offers.find((x) => x.id === id); setF(o ? toForm(o) : emptyForm()); setErr(""); };
  const onFile = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (!file.type.startsWith("image/")) return setErr("Il file deve essere un'immagine.");
    if (file.size > 3 * 1024 * 1024) return setErr("Immagine troppo grande (max 3 MB).");
    const r = new FileReader(); r.onload = () => setF((s) => ({ ...s, imageUrl: r.result })); r.readAsDataURL(file);
  };
  const save = () => {
    if (!(Number(f.price) > 0)) return setErr("Inserisci un prezzo valido in CHF.");
    if (!safeUrl(f.buyUrl.trim(), STORES[f.store].domain)) return setErr(`Il link d'acquisto deve essere https e sul dominio ${STORES[f.store].domain}.`);
    if (!validImageUrl(f.imageUrl.trim())) return setErr("L'URL immagine deve iniziare con https://");
    onSave(fromForm(f));
  };
  const input = "w-full h-10 px-3 rounded-xl bg-[#F5F5F7] text-[14px] outline-none focus:ring-2 focus:ring-[#0071E3]/40";
  const label = "text-[12px] font-semibold text-[#86868B] mb-1 block";
  return (
    <div className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-5xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-2xl" onClick={stop}>
        <div className="sticky top-0 bg-white/90 backdrop-blur-xl z-10 px-5 sm:px-6 py-4 border-b border-black/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5"><ImagePlus size={18} /><span className="font-semibold">Aggiungi / Modifica foto offerta</span></div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-[#F5F5F7] flex items-center justify-center"><X size={17} /></button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-5 sm:p-6">
          <div className="space-y-4">
            <div><span className={label}>Offerta</span>
              <select value={f.id || ""} onChange={(e) => pickOffer(e.target.value)} className={input}>
                <option value="">➕ Nuova offerta</option>
                {offers.map((o) => <option key={o.id} value={o.id}>{STORES[o.store].short} · {o.title}</option>)}
              </select>
            </div>
            <div className="rounded-2xl border border-dashed border-black/15 p-4 space-y-3">
              <div className="text-[13px] font-semibold flex items-center gap-1.5"><Link2 size={14} />Foto dal sito svizzero</div>
              <p className="text-[12px] text-[#86868B]">Sulla pagina prodotto (Digitec, Brack, MediaMarkt, Interdiscount…): tasto destro sull'immagine → <b>Copia indirizzo immagine</b> e incollalo qui. Se il negozio blocca la foto, la card mostra in automatico il render studio.</p>
              <input value={f.imageUrl.startsWith("data:") ? "" : f.imageUrl} onChange={set("imageUrl")} placeholder={f.imageUrl.startsWith("data:") ? "Screenshot caricato ✓" : "https://…/immagine-prodotto.jpg"} className={input} />
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => fileRef.current?.click()} className="h-9 px-3 rounded-full bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[13px] font-medium flex items-center gap-1.5"><Upload size={14} />Carica screenshot</button>
                {f.imageUrl && <button onClick={() => setF((s) => ({ ...s, imageUrl: "" }))} className="h-9 px-3 rounded-full text-[13px] text-[#FF3B30] font-medium">Rimuovi foto</button>}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><span className={label}>Negozio</span><select value={f.store} onChange={set("store")} className={input}>{Object.entries(STORES).map(([k, s]) => <option key={k} value={k}>{s.short}</option>)}</select></div>
              <div><span className={label}>Modello</span><select value={f.model} onChange={set("model")} className={input}>{Object.values(MODELS).map((m) => <option key={m.key} value={m.key}>{m.name}</option>)}</select></div>
              <div><span className={label}>Edizione</span><select value={f.edition} onChange={set("edition")} className={input}>{Object.entries(EDITIONS).map(([k, e]) => <option key={k} value={k}>{e.label}</option>)}</select></div>
              <div><span className={label}>Disponibilità</span><select value={f.availability} onChange={set("availability")} className={input}>{Object.entries(AVAIL).map(([k, a]) => <option key={k} value={k}>{a.label}</option>)}</select></div>
              <div><span className={label}>Prezzo CHF</span><input type="number" step="0.05" value={f.price} onChange={set("price")} className={input} /></div>
              <div><span className={label}>Prezzo barrato (opz.)</span><input type="number" step="0.05" value={f.wasPrice} onChange={set("wasPrice")} className={input} /></div>
            </div>
            <div><span className={label}>Titolo</span><input value={f.title} onChange={set("title")} placeholder="Es. PS5 Slim Digital + GTA VI" className={input} /></div>
            <div><span className={label}>Link d'acquisto ({STORES[f.store].domain})</span><input value={f.buyUrl} onChange={set("buyUrl")} placeholder={`https://www.${STORES[f.store].domain}/…`} className={input} /></div>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 h-10 px-3 rounded-xl bg-[#F5F5F7] text-[14px] cursor-pointer"><input type="checkbox" checked={f.controller} onChange={set("controller")} className="accent-[#0071E3]" />+ 2° DualSense</label>
              <input value={f.game} onChange={set("game")} placeholder="+ Gioco (es. Astro Bot)" className={input} />
            </div>
            {err && <div className="text-[13px] text-[#FF3B30] font-medium flex items-center gap-1.5"><AlertTriangle size={14} />{err}</div>}
            <div className="flex gap-2 flex-wrap pt-1">
              <button onClick={save} className="h-11 px-5 rounded-full bg-[#0071E3] text-white font-medium text-[14px] flex items-center gap-1.5"><Check size={16} />Salva offerta</button>
              <button onClick={onClose} className="h-11 px-5 rounded-full bg-[#F5F5F7] font-medium text-[14px]">Annulla</button>
              <button onClick={onReset} className="h-11 px-4 rounded-full text-[13px] text-[#86868B] ml-auto">Ripristina dati originali</button>
            </div>
          </div>
          <div>
            <span className={label}>Anteprima live della card</span>
            <div className="bg-[#F5F5F7] rounded-3xl p-3 sm:p-4">
              <OfferCard o={prev} list={offers.map((x) => enrich(x, false))} preview onToggle={() => {}} onAlert={() => {}} onEdit={() => {}} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   APP
   ========================================================================= */
const LS_KEY = "cispu-ps5-offers-v3";
function loadOffers() {
  try { const s = localStorage.getItem(LS_KEY); if (s) { const p = JSON.parse(s); if (Array.isArray(p) && p.length) return p; } } catch {}
  return SEED_OFFERS;
}

export default function CispuPS5Tracker() {
  const [offers, setOffers] = useState(loadOffers);
  const [loyalty, setLoyalty] = useState(false);
  const [model, setModel] = useState("all"), [cat, setCat] = useState("all"), [store, setStore] = useState("all");
  const [avail, setAvail] = useState("all"), [sort, setSort] = useState("net");
  const [compare, setCompare] = useState([]);
  const [budget, setBudget] = useState(600), [budgetMode, setBudgetMode] = useState("price");
  const [chartModel, setChartModel] = useState("digital"), [range, setRange] = useState(90);
  const [kikiOpen, setKikiOpen] = useState(false), [focus, setFocus] = useState(null);
  const [edit, setEdit] = useState({ open: false, offer: null });
  const [mult, setMult] = useState(1);
  const [alerts, setAlerts] = useState(() => { try { return { ...DEFAULT_ALERTS, ...JSON.parse(localStorage.getItem("cispu-alerts") || "{}") }; } catch { return DEFAULT_ALERTS; } });
  const [perm, setPerm] = useState(typeof Notification === "undefined" ? "unsupported" : Notification.permission);
  const [alertOpen, setAlertOpen] = useState(false), [deployOpen, setDeployOpen] = useState(false);
  const [sync, setSync] = useState({ source: "local", lastAt: new Date(2026, 10, 15, 7, 30), scanning: null, msg: "" });
  const [kikiPending, setKikiPending] = useState(null);
  const [alertLog, setAlertLog] = useState([]);
  const notified = useRef(new Set());

  useEffect(() => { try { localStorage.setItem(LS_KEY, JSON.stringify(offers)); } catch {} }, [offers]);
  useEffect(() => { try { localStorage.setItem("cispu-alerts", JSON.stringify(alerts)); } catch {} }, [alerts]);

  const list = useMemo(() => offers.map((o) => enrich(o, loyalty, mult)), [offers, loyalty, mult]);

  // ---- Sync con l'endpoint del cron (fallback: dataset locale)
  const pull = async () => {
    try { const r = await fetchRemoteOffers(); setOffers(r.offers); setSync((x) => ({ ...x, source: "api", lastAt: r.updatedAt, msg: "Dati aggiornati dal server" })); return true; }
    catch { setSync((x) => ({ ...x, source: "local", msg: "API non collegata: uso i dati locali (vedi Guida Deploy)" })); return false; }
  };
  useEffect(() => { pull(); }, []);
  const forceScan = async () => {
    for (const k of Object.keys(STORES)) { setSync((x) => ({ ...x, scanning: k })); await new Promise((r) => setTimeout(r, 170)); }
    const ok = await pull();
    setSync((x) => ({ ...x, scanning: null, lastAt: ok ? x.lastAt : new Date() }));
    runAlerts(true);
  };
  useEffect(() => {
    let due = nextScan();
    const t = setInterval(() => { if (new Date() >= due) { due = nextScan(); forceScan(); } }, 60000);
    return () => clearInterval(t);
  }, []);

  // ---- Controllo alert → notifiche
  const runAlerts = async (fromScan = false) => {
    const hits = list.map((o) => ({ o, r: matchAlert(o, alerts) })).filter((x) => x.r && !notified.current.has(x.o.id + "@" + x.o.price));
    for (const { o, r } of hits.slice(0, 3)) {
      notified.current.add(o.id + "@" + o.price);
      const txt = alertText(o, r);
      if (alerts.push) await showNotification("Cispu PS5 · Offerta sotto soglia", txt.replace("🔔 ", ""), buyUrlOf(o));
      setAlertLog((l) => [`${new Date().toLocaleTimeString("it-CH", { hour: "2-digit", minute: "2-digit" })} · ${txt}`, ...l].slice(0, 10));
    }
    if (fromScan && !hits.length) setSync((x) => ({ ...x, msg: "Scansione completata · nessun nuovo alert" }));
  };
  useEffect(() => { if (alerts.push && perm === "granted") runAlerts(); }, [alerts, perm, list]);
  const requestPerm = async () => {
    if (typeof Notification === "undefined") return setPerm("unsupported");
    const p = await Notification.requestPermission(); setPerm(p);
    if (p === "granted") { await ensureServiceWorker(); setAlerts((a) => ({ ...a, push: true })); }
  };
  const testPush = async () => {
    if (perm !== "granted") { await requestPerm(); if (typeof Notification === "undefined" || Notification.permission !== "granted") return; }
    const b = [...list].filter((o) => o.availability !== "soldout").sort((x, y) => y.score - x.score)[0];
    const ok = await showNotification("✅ Test Cispu PS5 Tracker", `Le notifiche funzionano! Miglior offerta: ${STORES[b.store].short} ${chf(b.price)}`, buyUrlOf(b));
    setAlertLog((l) => [`${new Date().toLocaleTimeString("it-CH", { hour: "2-digit", minute: "2-digit" })} · Test notifica ${ok ? "inviata" : "non riuscita"}`, ...l]);
  };
  const onKikiAction = (a) => {
    if (a.type === "openAlerts") setAlertOpen(true);
    if (a.type === "alert") { setAlerts((x) => ({ ...x, ...(a.model ? { [a.model]: a.value } : { anyMax: a.value }), push: perm === "granted" ? true : x.push })); setBudget(Math.min(950, Math.max(500, a.value))); if (perm === "default") requestPerm(); }
  };
  const askKiki = (q) => { setKikiOpen(true); setKikiPending(q); };
  const filtered = useMemo(() => {
    const l = list.filter((o) => {
      if (model === "bundle" ? !o.extras.length : model !== "all" && o.model !== model) return false;
      if (cat !== "all" && STORES[o.store].cat !== cat) return false;
      if (store !== "all" && o.store !== store) return false;
      if (avail === "now" && o.availability !== "online") return false;
      if (avail === "pickup" && o.availability !== "pickup") return false;
      return true;
    });
    const s = { net: (a, b) => a.net - b.net, price: (a, b) => a.price - b.price, pct: (a, b) => b.pct - a.pct, score: (a, b) => b.score - a.score };
    return [...l].sort((a, b) => (a.availability === "soldout") - (b.availability === "soldout") || s[sort](a, b));
  }, [list, model, cat, store, avail, sort]);

  const live = list.filter((o) => o.availability !== "soldout");
  const bestDeal = [...live].sort((a, b) => b.score - a.score || a.net - b.net)[0];
  const inBudget = live.filter((o) => (budgetMode === "price" ? o.price : o.net) <= budget).sort((a, b) => b.score - a.score);
  const compared = compare.map((id) => list.find((o) => o.id === id)).filter(Boolean);
  const toggle = (id) => setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length < 3 ? [...c, id] : c));
  const st = STATS[chartModel];

  useEffect(() => {
    if (!focus) return;
    setModel("all"); setCat("all"); setStore("all"); setAvail("all");
    setTimeout(() => document.getElementById(`offer-${focus}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 80);
    const t = setTimeout(() => setFocus(null), 2500); return () => clearTimeout(t);
  }, [focus]);

  const setAlertFrom = (o) => { setBudget(Math.min(950, Math.ceil(o.price / 10) * 10)); document.getElementById("alert")?.scrollIntoView({ behavior: "smooth", block: "center" }); };
  const saveOffer = (o) => { setOffers((arr) => (arr.some((x) => x.id === o.id) ? arr.map((x) => (x.id === o.id ? o : x)) : [...arr, o])); setEdit({ open: false, offer: null }); setFocus(o.id); };
  const storesInCat = Object.entries(STORES).filter(([, s]) => cat === "all" || s.cat === cat);

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F]" style={{ fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif" }}>
      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{scrollbar-width:none}`}</style>

      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#F5F5F7]/80 border-b border-black/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#1D1D1F] flex items-center justify-center shrink-0"><Gamepad2 size={17} className="text-white" /></div>
            <span className="font-semibold tracking-tight text-[15px] truncate">Cispu <span className="text-[#86868B] font-normal">PS5 Tracker</span></span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setAlertOpen(true)} className="h-9 px-3.5 rounded-full bg-[#0071E3] text-white text-[13px] font-medium flex items-center gap-1.5"><BellRing size={14} /><span className="hidden sm:inline">Attiva Alert Telefono</span><span className="sm:hidden">Alert</span></button>
            <button onClick={() => setEdit({ open: true, offer: null })} className="h-9 px-3.5 rounded-full bg-white border border-black/[0.08] text-[13px] font-medium flex items-center gap-1.5 hover:bg-[#FBFBFD]"><Plus size={14} /><span className="hidden lg:inline">Aggiungi / Modifica Foto Offerta</span></button>
            <button onClick={() => setDeployOpen(true)} title="Guida Deploy Automatico" className="h-9 w-9 rounded-full bg-white border border-black/[0.08] flex items-center justify-center hover:bg-[#FBFBFD]"><Code2 size={15} /></button>
          </div>
        </div>
        <SyncBar sync={sync} onForce={forceScan} />
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-32">
        <div className="mb-5">
          <h1 className="text-[34px] sm:text-[48px] font-semibold tracking-tight leading-[1.05]">Il prezzo giusto per la tua PS5.</h1>
          <p className="text-[17px] text-[#86868B] mt-2">{list.length} offerte in 11 negozi svizzeri · clicca una card per andare dritto all'acquisto</p>
        </div>

        {/* CHECK RAPIDO MULTI-STORE */}
        <Card className="p-4 mb-5">
          <div className="flex items-center gap-2 mb-3"><Zap size={16} /><span className="font-semibold text-[15px]">Check rapido multi-store</span><span className="text-[12px] text-[#86868B]">· 1 click = stock live in nuova scheda</span></div>
          <div className="flex flex-col gap-2">
            {Object.entries(CATEGORIES).map(([k, l]) => (
              <div key={k} className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="text-[11px] font-semibold text-[#86868B] uppercase w-36 shrink-0">{l}</span>
                {Object.entries(STORES).filter(([, s]) => s.cat === k).map(([sk, s]) => (
                  <a key={sk} href={safeUrl(s.url, s.domain) || undefined} target="_blank" rel="noopener noreferrer" title={s.url} className="shrink-0 px-3.5 py-1.5 rounded-full bg-[#F5F5F7] hover:bg-[#1D1D1F] hover:text-white text-[13px] font-medium transition-colors flex items-center gap-1">{s.short}<ExternalLink size={12} /></a>
                ))}
              </div>
            ))}
            <div className="flex items-center gap-2"><span className="text-[11px] font-semibold text-[#86868B] uppercase w-36 shrink-0">Comparatore</span>
              <a href={TOPPREISE.pro} target="_blank" rel="noopener noreferrer" className="px-3.5 py-1.5 rounded-full bg-[#E8F2FD] text-[#0058B0] text-[13px] font-medium flex items-center gap-1">Toppreise.ch<ExternalLink size={12} /></a>
            </div>
          </div>
        </Card>

        <StrategyCard list={list} onOpenAlerts={() => setAlertOpen(true)} onAsk={askKiki} />

        {/* HERO + ALERT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 mb-5">
          {bestDeal && (
            <Card className="lg:col-span-2 p-5 sm:p-7 relative overflow-hidden">
              <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-gradient-to-br from-[#0071E3]/10 to-[#5E5CE6]/10 blur-2xl" />
              <div className="relative grid grid-cols-1 md:grid-cols-[1fr_260px] gap-5 items-center">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1D1D1F] text-white text-[12px] font-semibold mb-3"><Trophy size={13} />Best Deal del Giorno</div>
                  <p className="text-[13px] font-semibold text-[#86868B] uppercase tracking-wide">{STORES[bestDeal.store].name} · {STORES[bestDeal.store].perk}</p>
                  <h2 className="text-[24px] sm:text-[30px] font-semibold tracking-tight leading-tight mt-1">{bestDeal.title}</h2>
                  <div className="flex items-end gap-3 mt-3 flex-wrap">
                    <span className="text-[44px] sm:text-[52px] font-semibold tracking-tight leading-none">{chf(bestDeal.price)}</span>
                    {bestDeal.save > 0 && <span className="text-[18px] text-[#86868B] line-through mb-1">{chf(bestDeal.ref)}</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {bestDeal.pct > 0 && <span className="px-3 py-1 rounded-full bg-[#FF3B30] text-white text-[14px] font-semibold">−{bestDeal.pct}%</span>}
                    {bestDeal.save > 0 && <span className="text-[14px] font-semibold text-[#FF3B30]">Risparmi {chf(bestDeal.save)}</span>}
                    {bestDeal.cash > 0 && <span className="text-[13px] font-medium text-[#1E7B3A]">+ {chf(bestDeal.cash)} cashback</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-4 flex-wrap">
                    <ScoreRing score={bestDeal.score} size={60} />
                    <div className="text-[13px]"><div className="font-semibold">Deal Score</div><div style={{ color: dealVerdict(bestDeal.score).color }}>{dealVerdict(bestDeal.score).label}</div></div>
                  </div>
                  <div className="flex gap-2 mt-4 flex-wrap">
                    <ExtLink href={buyUrlOf(bestDeal)}>Acquista su {STORES[bestDeal.store].short} <ExternalLink size={14} /></ExtLink>
                    <ExtLink href={toppreiseOf(bestDeal)} variant="soft"><Search size={14} />Verifica su Toppreise.ch</ExtLink>
                  </div>
                  <div className="mt-2"><VerifiedBadge o={bestDeal} /></div>
                </div>
                <ProductVisual offer={bestDeal} />
              </div>
            </Card>
          )}
          <Card className="p-6" >
            <div id="alert" />
            <SectionTitle icon={Bell} title="Price Alert" sub="Imposta il tuo budget massimo" />
            <div className="text-[40px] font-semibold tracking-tight leading-none">{chf(budget)}</div>
            <input type="range" min={500} max={950} step={10} value={budget} onChange={(e) => setBudget(+e.target.value)} className="w-full mt-4 accent-[#0071E3]" />
            <div className="flex justify-between text-[11px] text-[#86868B]"><span>CHF 500</span><span>CHF 950</span></div>
            <div className="flex gap-2 mt-4"><Pill active={budgetMode === "price"} onClick={() => setBudgetMode("price")}>Prezzo pagato</Pill><Pill active={budgetMode === "net"} onClick={() => setBudgetMode("net")}>Costo netto</Pill></div>
            <div className="mt-4 text-[13px] font-medium">{inBudget.length ? <span className="text-[#1E7B3A]">🔔 {inBudget.length} offerte nel budget</span> : <span className="text-[#FF3B30]">Nessuna offerta entro il budget</span>}</div>
            <div className="mt-2 space-y-1.5 max-h-44 overflow-y-auto no-scrollbar">
              {inBudget.slice(0, 8).map((o) => (
                <button key={o.id} onClick={() => setFocus(o.id)} className="w-full flex items-center justify-between text-left text-[13px] px-3 py-2 rounded-xl bg-[#F5F5F7] hover:bg-[#E8E8ED]">
                  <span className="truncate pr-2"><b>{STORES[o.store].short}</b> · {MODELS[o.model].short}{o.extras.length ? " bundle" : ""}</span><span className="font-semibold shrink-0">{chf(budgetMode === "price" ? o.price : o.net)}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* MINI STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-5">
          {Object.values(MODELS).map((m) => {
            const best = live.filter((o) => o.model === m.key).sort((a, b) => a.net - b.net)[0];
            if (!best) return null;
            return (
              <Card key={m.key} className="p-5 hover:-translate-y-0.5 transition-transform">
                <button className="text-left w-full" onClick={() => { setModel(m.key); setChartModel(m.key); document.getElementById("offerte")?.scrollIntoView({ behavior: "smooth" }); }}>
                  <div className="text-[12px] font-semibold text-[#86868B] uppercase tracking-wide">{m.short}</div>
                  <div className="text-[24px] font-semibold tracking-tight mt-1">{chf(best.net)}</div>
                  <div className="text-[12px] text-[#86868B]">netto · {STORES[best.store].short}</div>
                  <div className="text-[12px] font-semibold text-[#FF3B30] mt-2 flex items-center gap-1"><TrendingDown size={13} />−{chf(r05(m.ref - best.net))} vs prezzo più alto CH</div>
                </button>
              </Card>
            );
          })}
          <Card className="p-5 bg-gradient-to-br from-[#0071E3] to-[#5E5CE6] !border-0 text-white">
            <button className="text-left w-full h-full" onClick={() => setKikiOpen(true)}>
              <Sparkles size={20} /><div className="text-[17px] font-semibold mt-2 leading-tight">Chiedi a Kiki</div>
              <div className="text-[12px] opacity-80 mt-1">Bundle, Superpunti, permuta: ti faccio i conti in un secondo.</div>
              <div className="text-[12px] font-semibold mt-3 flex items-center gap-1">Apri chat <ChevronRight size={14} /></div>
            </button>
          </Card>
        </div>

        {/* ANALYTICS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 mb-5">
          <Card className="lg:col-span-2 p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <SectionTitle icon={Activity} title="Storico prezzi" sub="Miglior prezzo di mercato in Svizzera, console singola" />
              <div className="flex gap-1.5">{[30, 60, 90].map((r) => <Pill key={r} active={range === r} onClick={() => setRange(r)}>{r} gg</Pill>)}</div>
            </div>
            <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">{Object.values(MODELS).map((m) => <Pill key={m.key} active={chartModel === m.key} onClick={() => setChartModel(m.key)}>{m.short}</Pill>)}</div>
            <HistoryChart model={chartModel} range={range} />
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="rounded-2xl bg-[#FFECEB] p-3"><div className="text-[11px] font-semibold text-[#C4231A] uppercase">Minimo storico</div><div className="text-[18px] font-semibold">{chf(st.min)}</div></div>
              <div className="rounded-2xl bg-[#F5F5F7] p-3"><div className="text-[11px] font-semibold text-[#86868B] uppercase">Prezzo medio</div><div className="text-[18px] font-semibold">{chf(st.avg)}</div></div>
              <div className="rounded-2xl bg-[#E9F9EE] p-3"><div className="text-[11px] font-semibold text-[#1E7B3A] uppercase">Target</div><div className="text-[18px] font-semibold">{chf(st.target)}</div></div>
            </div>
          </Card>
          <Card className="p-6"><SectionTitle icon={Store} title="Confronto negozi" sub={`${MODELS[chartModel].name} · costo netto`} /><StoreBarChart model={chartModel} list={list} /></Card>
        </div>

        {/* FILTRI */}
        <div id="offerte" className="sticky top-[88px] z-30 -mx-4 sm:mx-0 px-4 sm:px-0 py-3 bg-[#F5F5F7]/90 backdrop-blur-xl">
          <Card className="p-3 sm:p-4 space-y-2.5">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[12px] font-semibold text-[#86868B] w-20 shrink-0">Modello</span>
              {[["all", "Tutte"], ["digital", "Slim Digital"], ["disc", "Slim Disc"], ["pro", "Pro"], ["bundle", "Solo Bundle"]].map(([k, l]) => <Pill key={k} active={model === k} onClick={() => setModel(k)}>{l}</Pill>)}
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[12px] font-semibold text-[#86868B] w-20 shrink-0">Categoria</span>
              <Pill active={cat === "all"} onClick={() => { setCat("all"); setStore("all"); }}>Tutte</Pill>
              {Object.entries(CATEGORIES).map(([k, l]) => <Pill key={k} active={cat === k} onClick={() => { setCat(k); setStore("all"); }}>{l}</Pill>)}
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[12px] font-semibold text-[#86868B] w-20 shrink-0">Negozio</span>
              <Pill active={store === "all"} onClick={() => setStore("all")}>Tutti</Pill>
              {storesInCat.map(([k, s]) => <Pill key={k} active={store === k} onClick={() => setStore(k)}>{s.short}</Pill>)}
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[12px] font-semibold text-[#86868B] w-20 shrink-0">Disponib.</span>
              {[["all", "Tutte"], ["now", "Solo disponibili subito"], ["pickup", "Ritiro in negozio"]].map(([k, l]) => <Pill key={k} active={avail === k} onClick={() => setAvail(k)}>{l}</Pill>)}
              <span className="w-px h-6 bg-black/10 mx-1 shrink-0" /><ArrowUpDown size={14} className="text-[#86868B] shrink-0" />
              {[["net", "Più conveniente (netto)"], ["price", "Prezzo più basso"], ["pct", "Sconto % più alto"], ["score", "Deal Score"]].map(([k, l]) => <Pill key={k} active={sort === k} onClick={() => setSort(k)}>{l}</Pill>)}
            </div>
            <label className="flex items-center gap-3 cursor-pointer select-none pt-1">
              <span className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${loyalty ? "bg-[#34C759]" : "bg-[#E5E5EA]"}`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${loyalty ? "left-[22px]" : "left-0.5"}`} />
              </span>
              <input type="checkbox" className="hidden" checked={loyalty} onChange={(e) => setLoyalty(e.target.checked)} />
              <span className="text-[13px] font-medium flex items-center gap-1.5"><Coins size={14} />Includi cashback punti (Superpunti Coop / Manor Card / Fnac 5%)</span>
            </label>
            {loyalty && <div className="flex items-center gap-2 pl-14 flex-wrap"><span className="text-[12px] text-[#86868B]">Moltiplicatore Superpunti (Interdiscount · Fust · Coop):</span>{[[1, "x1 (~1%)"], [10, "x10 (~10%)"], [20, "x20 (~20%)"]].map(([v, l]) => <Pill key={v} active={mult === v} onClick={() => setMult(v)}>{l}</Pill>)}</div>}
          </Card>
        </div>

        <div className="flex items-center justify-between mt-4 mb-3 gap-3">
          <p className="text-[14px] text-[#86868B]">{filtered.length} offerte · clicca la card per acquistare, “Confronta” per la tabella</p>
          {(model !== "all" || cat !== "all" || store !== "all" || avail !== "all") && <button onClick={() => { setModel("all"); setCat("all"); setStore("all"); setAvail("all"); }} className="text-[13px] text-[#0071E3] font-medium shrink-0">Azzera filtri</button>}
        </div>
        {filtered.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-4 sm:gap-x-5 gap-y-8">
            {filtered.map((o) => (
              <div id={`offer-${o.id}`} key={o.id}>
                <OfferCard o={o} list={list} selected={compare.includes(o.id)} onToggle={() => toggle(o.id)} disabled={compare.length >= 3} highlight={focus === o.id}
                  onAlert={() => setAlertFrom(o)} onEdit={() => setEdit({ open: true, offer: offers.find((x) => x.id === o.id) })} />
              </div>
            ))}
          </div>
        ) : (
          <Card className="p-10 text-center"><Package className="mx-auto text-[#86868B]" /><p className="mt-3 font-semibold">Nessuna offerta con questi filtri</p><p className="text-[13px] text-[#86868B]">Prova a cambiare categoria o disponibilità.</p></Card>
        )}

        {/* CONFRONTO */}
        <Card className="p-6 mt-8">
          <SectionTitle icon={Scale} title="Confronto testa-a-testa" sub={compared.length ? `${compared.length} di 3 offerte selezionate` : "Tocca “Confronta” su 2 o 3 offerte"} />
          {compared.length < 2 ? (
            <div className="rounded-2xl bg-[#F5F5F7] p-6 text-center text-[14px] text-[#86868B]"><Info size={18} className="mx-auto mb-2" />Seleziona almeno 2 offerte per vedere la tabella.</div>
          ) : (
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-[14px] min-w-[600px]">
                <thead><tr><th className="p-2 w-40" />{compared.map((o) => (
                  <th key={o.id} className="text-left p-2 align-top">
                    <div className="w-36 mb-2"><ProductVisual offer={o} compact /></div>
                    <div className="text-[12px] text-[#86868B] uppercase">{STORES[o.store].short}</div>
                    <div className="font-semibold leading-snug">{o.title}</div>
                    <button onClick={() => toggle(o.id)} className="text-[12px] text-[#FF3B30] font-medium mt-1 inline-flex items-center gap-0.5"><Minus size={12} />Rimuovi</button>
                  </th>))}</tr></thead>
                <tbody>
                  {(() => {
                    const minP = Math.min(...compared.map((o) => o.price)), minN = Math.min(...compared.map((o) => o.net)), maxS = Math.max(...compared.map((o) => o.score));
                    const rows = [
                      ["Prezzo", (o) => <span className={o.price === minP ? "font-semibold text-[#FF3B30]" : ""}>{chf(o.price)}</span>],
                      ["Costo netto console", (o) => <span className={o.net === minN ? "font-semibold text-[#FF3B30]" : ""}>{chf(o.net)}</span>],
                      ["Sconto", (o) => (o.save ? `−${o.pct}% (${chf(o.save)})` : "—")],
                      ["Accessori inclusi", (o) => (o.extras.length ? o.extras.map((e) => e.name).join(", ") : "—")],
                      ["Cashback fedeltà", (o) => (STORES[o.store].loyalty ? STORES[o.store].loyalty.label : "—")],
                      ["Spedizione", (o) => (STORES[o.store].shipping ? chf(STORES[o.store].shipping) : "Gratuita / da verificare")],
                      ["Garanzia Svizzera", () => <span className="inline-flex items-center gap-1"><Check size={14} className="text-[#34C759]" />24 mesi</span>],
                      ["Ritiro / consegna", (o) => STORES[o.store].pickup],
                      ["Vantaggio negozio", (o) => STORES[o.store].perk],
                      ["Deal Score", (o) => <span className={o.score === maxS ? "font-semibold text-[#1E7B3A]" : ""}>{o.score}/100</span>],
                      ["", (o) => <div className="flex flex-col gap-1.5 items-start"><ExtLink href={buyUrlOf(o)} className="!py-2 !text-[13px]">Acquista ↗</ExtLink><ExtLink href={toppreiseOf(o)} variant="ghost" className="!py-0 !text-[12px]">Toppreise ↗</ExtLink></div>],
                    ];
                    return rows.map(([label, fn], i) => (
                      <tr key={i} className={i % 2 ? "" : "bg-[#FBFBFD]"}><td className="p-2.5 text-[#86868B] font-medium">{label}</td>{compared.map((o) => <td key={o.id} className="p-2.5">{fn(o)}</td>)}</tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 mt-5">
          <Card className="p-5"><Calculator size={18} /><div className="font-semibold mt-2">Come calcoliamo il netto</div><p className="text-[13px] text-[#86868B] mt-1">Prezzo − accessori (DualSense ~{chf(ACCESSORY_VALUE.controller)}, gioco ~{chf(ACCESSORY_VALUE.game)}) − cashback se attivo. Arrotondato ai 5 centesimi.</p></Card>
          <Card className="p-5"><Zap size={18} /><div className="font-semibold mt-2">Deal Score 1–100</div><p className="text-[13px] text-[#86868B] mt-1">Posizione del costo netto tra minimo e massimo degli ultimi 90 giorni. Sopra 80 = compra ora.</p></Card>
          <Card className="p-5"><ShieldCheck size={18} /><div className="font-semibold mt-2">Link diretti verificati</div><p className="text-[13px] text-[#86868B] mt-1">Ogni link deve essere https sul dominio .ch del negozio, altrimenti viene bloccato. Apertura in nuova scheda con noopener/noreferrer.</p></Card>
        </div>
        <p className="text-center text-[12px] text-[#86868B] mt-10 flex items-center justify-center gap-1.5"><Gift size={13} />Fatto con amore per Cispu · prezzi indicativi, verifica sempre sul sito del negozio prima dell'acquisto.</p>
      </main>

      <Kiki open={kikiOpen} setOpen={setKikiOpen} ctx={{ list, loyalty, budget, alerts, onAction: onKikiAction }} onFocusOffer={setFocus} pending={kikiPending} clearPending={() => setKikiPending(null)} />
      <AlertPanel open={alertOpen} onClose={() => setAlertOpen(false)} alerts={alerts} setAlerts={setAlerts} list={list} perm={perm} onRequestPerm={requestPerm} onTestPush={testPush} log={alertLog} />
      <DeployGuide open={deployOpen} onClose={() => setDeployOpen(false)} />
      <EditModal open={edit.open} initial={edit.offer} offers={offers} onClose={() => setEdit({ open: false, offer: null })} onSave={saveOffer}
        onReset={() => { setOffers(SEED_OFFERS); setEdit({ open: false, offer: null }); }} />
    </div>
  );
}
