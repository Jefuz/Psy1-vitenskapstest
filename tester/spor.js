#!/usr/bin/env node
/* Atferdsspor for øvingstesten. Kjører testen i hodeløs Chromium og sammenligner med
   en tidligere versjon fra git. Kjør fra repo-rota:
     node tester/spor.js                     arbeidskopien mot siste commit (HEAD)
     node tester/spor.js --mot origin/main   mot en annen commit
     node tester/spor.js --bare              bare arbeidskopien, uten sammenligning
     node tester/spor.js --tillat forside    ikke regn endringer i disse scenariene som feil
     node tester/spor.js --lagre spor.json   skriv hele sporet til fil
   Krever Playwright med Chromium (npm i playwright && npx playwright install chromium).

   Hvert scenario besvares likt hver gang: noen spørsmål bevisst feil første gang, noen med
   hint, noen med «Jeg mente det samme», og Math.random er låst til et fast frø. Scenarier
   som finnes i begge versjoner, skal gi identisk spor, med mindre endringen er tilsiktet.
   Nye bolker og temaer meldes som nye scenarier. Sidefeil i nettleseren gir alltid feil. */
const fs = require("fs"), path = require("path"), http = require("http");
const { execFileSync } = require("child_process");
const { chromium } = require("playwright");
const { lastTest } = require("./last");

const rot = path.join(__dirname, "..");
const FIL = "psy1-vitenskap-og-metode.html";
const arg = process.argv.slice(2);
const flagg = n => arg.includes(n);
const verdi = n => { const i = arg.indexOf(n); return i >= 0 ? arg[i + 1] : null; };

/* Deterministisk tall fra en tekst (FNV-1a). Styrer hvilke spørsmål som besvares feil osv. */
function hash(t) { let h = 0x811c9dc5; for (const c of t) { h ^= c.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; } return h; }
const kortHash = t => hash(t || "").toString(16).padStart(8, "0");

/* Låser Math.random til et fast frø (mulberry32), slik at blandede runder blir like hver gang. */
function fro() {
  let a = 20261105;
  Math.random = function () {
    a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function server(html) {
  return new Promise(res => {
    const s = http.createServer((req, r) => {
      r.writeHead(200, { "content-type": "text/html; charset=utf-8" }); r.end(html);
    });
    s.listen(0, "127.0.0.1", () => res({ url: "http://127.0.0.1:" + s.address().port + "/" + FIL, lukk: () => s.close() }));
  });
}

function fasit(B) {
  const m = new Map();
  B.forEach(b => b.q.forEach(q => m.set(b.n + "|" + q[0], { riktig: b.o[q[1]][0], feil: b.o[(q[1] + 1) % 5][0] })));
  return m;
}

async function klikkAlt(page, tekst) {
  const i = await page.$$eval("#qOpts .opt span:nth-child(2)", (els, t) => els.findIndex(e => e.textContent === t), tekst);
  if (i < 0) throw new Error("Fant ikke alternativet " + tekst);
  await page.locator("#qOpts .opt").nth(i).click();
}

/* Besvarer spørsmål til runden er ferdig (eller maks steg). Første gang et spørsmål vises,
   avgjør hashen om det besvares feil, med hint eller med «Jeg mente det samme». */
async function runde(page, F, spor, maks = Infinity) {
  const sett = new Set();
  for (let steg = 0; steg < maks; steg++) {
    if (await page.locator("#result").isVisible()) return;
    const pill = await page.textContent("#qPill"), tekst = await page.textContent("#qText");
    const nokkel = pill.replace(/^Bolk /, "") + "|" + tekst;
    const f = F.get(nokkel);
    if (!f) throw new Error("Ukjent spørsmål: " + nokkel);
    const h = hash(nokkel), forste = !sett.has(nokkel);
    sett.add(nokkel);
    const galt = forste && h % 4 === 0;
    const skriv = await page.locator("#typeIn").count() > 0;
    let handling = "";
    if (skriv && forste && h % 5 === 1) {
      await page.click("#hintBtn");
      handling += "hint1[" + await page.textContent("#hintTxt") + "] ";
    }
    const visAlt = skriv && forste && h % 7 === 2;
    if (visAlt) {
      for (let k = 0; k < 3 && await page.locator("#qOpts .opt").count() === 0; k++) await page.click("#hintBtn");
      handling += "hint2[" + ((await page.locator("#hintTxt").allTextContents()).join("/") || "ingen hinttekst") + "] ";
    }
    const svar = galt ? f.feil : f.riktig;
    if (!skriv || visAlt) await klikkAlt(page, svar);
    else { await page.fill("#typeIn", svar); await page.press("#typeIn", "Enter"); }
    await page.waitForSelector("#fb .fb");
    if (skriv && !visAlt && galt && h % 3 === 0) {
      await page.locator("#fb button", { hasText: "Jeg mente det samme" }).click();
      handling += "mente ";
    }
    spor.push([pill, tekst.slice(0, 50), handling + (galt ? "feil" : "riktig"),
      await page.getAttribute("#fb .fb", "class"), await page.textContent("#fb .fb b"),
      kortHash(await page.textContent("#fb .fb")), await page.textContent("#pTxt")].join(" ¦ "));
    await page.click("#nextBtn");
  }
}

async function resultat(page, spor) {
  spor.push("RESULTAT ¦ " + await page.textContent("#rScore") + " ¦ " + await page.textContent("#rSub") +
    " ¦ svake " + kortHash(await page.textContent("#rWeak")) + " ¦ fasit " + kortHash(await page.textContent("#rTable")));
  spor.push("LAGRET ¦ " + await page.evaluate(() => localStorage.getItem("psy1-vitenskap-bolker")) +
    " ¦ runde " + await page.evaluate(() => localStorage.getItem("psy1-vitenskap-fremdrift")));
}

const modus = (p, m) => p.click('#modeSeg [data-mode="' + m + '"]');

function scenarier(B, F) {
  const S = [];
  const deler = [...new Set(B.map(b => b.del))];
  const hel = (sel, m) => async (p, s) => { await modus(p, m); await p.click(sel); await runde(p, F, s); await resultat(p, s); };

  S.push(["forside", async (p, s) => {
    (await p.$$eval("#bolkGrid .tema", els => els.map(e => e.innerText.replace(/\s+/g, " ").trim()))).forEach(x => s.push(x));
    s.push((await p.textContent("#home .sub")).replace(/\s+/g, " ").trim());
  }]);
  B.forEach((b, i) => ["velg", "skriv"].forEach(m => S.push(["bolk " + b.n + " " + m, hel('.bolk[data-set="' + i + '"]', m)])));
  deler.forEach(d => S.push(["tema " + d, hel('[data-set="t:' + d + '"]', "velg")]));
  S.push(["20 tilfeldige velg", hel('[data-set="random"]', "velg")]);
  S.push(["20 tilfeldige skriv", hel('[data-set="random"]', "skriv")]);
  S.push(["alle velg", hel('[data-set="all"]', "velg")]);
  S.push(["det jeg kan dårligst", async (p, s) => {
    await modus(p, "velg");
    for (const i of [0, 1]) { await p.click('.bolk[data-set="' + i + '"]'); await runde(p, F, []); await p.click("#homeBtn"); }
    await p.click('[data-set="weak"]'); await runde(p, F, s); await resultat(p, s);
  }]);
  S.push(["fortsett senere", async (p, s) => {
    await modus(p, "skriv"); await p.click('.bolk[data-set="2"]'); await runde(p, F, s, 2);
    await p.click("#quitBtn"); s.push("FORTSETT ¦ " + await p.textContent("#resumeTxt"));
    await p.reload(); s.push("ETTER OMLASTING ¦ " + await p.textContent("#resumeTxt"));
    await p.click("#resumeYes"); await runde(p, F, s); await resultat(p, s);
  }]);
  S.push(["tastatur", async (p, s) => {
    await modus(p, "velg"); await p.click('.bolk[data-set="3"]');
    while (!(await p.locator("#result").isVisible())) {
      const pill = await p.textContent("#qPill"), tekst = await p.textContent("#qText");
      const f = F.get(pill.replace(/^Bolk /, "") + "|" + tekst);
      const i = await p.$$eval("#qOpts .opt span:nth-child(2)", (els, t) => els.findIndex(e => e.textContent === t), f.riktig);
      await p.keyboard.press(String(i + 1));
      s.push(pill + " ¦ " + tekst.slice(0, 40) + " ¦ " + await p.textContent("#fb .fb b"));
      await p.keyboard.press("Enter");
    }
    await resultat(p, s);
  }]);
  S.push(["lenke #tema=Hukommelse", async (p, s, url) => {
    await p.goto("about:blank"); await p.goto(url + "#tema=" + encodeURIComponent("Hukommelse"));
    await runde(p, F, s); await resultat(p, s);
  }]);
  S.push(["nullstill", async (p, s) => {
    await modus(p, "velg"); await p.click('.bolk[data-set="0"]'); await runde(p, F, []); await p.click("#homeBtn");
    s.push("FØR ¦ " + await p.evaluate(() => localStorage.getItem("psy1-vitenskap-bolker")) + " ¦ " + await p.textContent('.bolk[data-set="0"]'));
    await p.click("#resetAll");
    s.push("ETTER ¦ " + await p.evaluate(() => localStorage.getItem("psy1-vitenskap-bolker")) + " ¦ " + await p.textContent('.bolk[data-set="0"]'));
  }]);
  return S;
}

async function kjorAlle(browser, url, B) {
  const liste = scenarier(B, fasit(B)), ut = {};
  let neste = 0;
  async function arbeider() {
    while (neste < liste.length) {
      const [navn, kjor] = liste[neste++];
      const ctx = await browser.newContext(), page = await ctx.newPage(), spor = [];
      await page.addInitScript(fro);
      page.on("pageerror", e => spor.push("SIDEFEIL ¦ " + e.message));
      await page.goto(url);
      try { await kjor(page, spor, url); } catch (e) { spor.push("AVBRUTT ¦ " + e.message.split("\n")[0]); }
      await ctx.close();
      ut[navn] = spor;
    }
  }
  await Promise.all(Array.from({ length: 6 }, arbeider));
  return Object.fromEntries(liste.map(([n]) => [n, ut[n]]));
}

(async () => {
  const t0 = Date.now();
  const nyHtml = fs.readFileSync(path.join(rot, FIL), "utf8");
  const ref = verdi("--mot") || "HEAD";
  const gmlHtml = flagg("--bare") ? null :
    execFileSync("git", ["show", ref + ":" + FIL], { cwd: rot, encoding: "utf8", maxBuffer: 1 << 26 });
  const tillat = new Set((verdi("--tillat") || "").split(",").filter(Boolean));
  const browser = await chromium.launch();
  const ny = await server(nyHtml), gml = gmlHtml ? await server(gmlHtml) : null;
  const [a, b] = await Promise.all([
    gml ? kjorAlle(browser, gml.url, lastTest(gmlHtml).B) : null,
    kjorAlle(browser, ny.url, lastTest(nyHtml).B)]);
  await browser.close(); ny.lukk(); if (gml) gml.lukk();

  let feil = 0, like = 0, tillatt = 0;
  const nye = [], endret = [];
  for (const [navn, spor] of Object.entries(b)) {
    const brudd = spor.find(x => /^(SIDEFEIL|AVBRUTT)/.test(x));
    if (brudd) { feil++; console.log("FEIL i «" + navn + "»: " + brudd); }
    if (!a) continue;
    if (!a[navn]) { nye.push(navn); continue; }
    const k = spor.findIndex((x, i) => x !== a[navn][i]);
    const n = k < 0 && spor.length !== a[navn].length ? Math.min(spor.length, a[navn].length) : k;
    if (n < 0) { like++; continue; }
    if (tillat.has(navn)) tillatt++; else feil++;
    endret.push(navn);
    console.log((tillat.has(navn) ? "ENDRET (tillatt) «" : "ENDRET «") + navn + "», steg " + (n + 1) + ":\n  før: " +
      (a[navn][n] ?? "(slutt)") + "\n  nå:  " + (spor[n] ?? "(slutt)"));
  }
  const borte = a ? Object.keys(a).filter(n => !(n in b)) : [];
  borte.forEach(n => { feil++; console.log("BORTE: scenariet «" + n + "» finnes ikke lenger"); });
  if (nye.length) console.log("Nye scenarier (" + nye.length + "): " + nye.join(", "));
  const steg = Object.values(b).reduce((s, x) => s + x.length, 0);
  console.log(Object.keys(b).length + " scenarier, " + steg + " steg" +
    (a ? ", mot " + ref + ": " + like + " identiske, " + endret.length + " endret (" + tillatt + " tillatt), " + nye.length + " nye" : "") +
    ". " + Math.round((Date.now() - t0) / 1000) + " s.");
  if (verdi("--lagre")) fs.writeFileSync(verdi("--lagre"), JSON.stringify({ ny: b, gammel: a }, null, 1));
  console.log(feil ? feil + " feil." : "Ingen feil.");
  process.exit(feil ? 1 : 0);
})();
