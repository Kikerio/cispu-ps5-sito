// Scansione prezzi PS5 — eseguita da GitHub Actions ogni mattina (e ogni 30 min nella Black Friday Week).
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
  for (const b of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
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
    const p = Number(pick(html, /<meta[^>]+(?:property|itemprop)=["'](?:product:price:amount|price)["'][^>]+content=["']([\d.]+)["']/i));
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
console.log(`Fatto: ${changes.length} prezzi cambiati.`);

// ---- Alert Telegram
const { TELEGRAM_BOT_TOKEN: T, TELEGRAM_CHAT_ID: C } = process.env;
if (T && C) {
  for (const { o, before, after } of changes) {
    const net = after - (o.extras || []).reduce((s, e) => s + (EXTRA[e.type] || 0), 0);
    const hit = (o.extras || []).length ? net <= ALERTS.bundle : after <= ALERTS[o.model];
    if (!hit || before - after < ALERTS.minDropCHF) continue;
    await fetch(`https://api.telegram.org/bot${T}/sendMessage`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: C, parse_mode: "HTML", text: `🔔 <b>${o.title}</b>\nCHF ${after} da ${o.store} (prima CHF ${before})\n<a href="${o.buyUrl}">Acquista ora</a>` }),
    });
  }
}
