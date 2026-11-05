#!/usr/bin/env node
/* Statisk sjekk av øvingstesten og sensorkortene. Kjør fra repo-rota:
     node tester/sjekk.js
   FEIL gir exit-kode 1. Varsler skrives ut, men stopper ikke. */
const fs = require("fs"), path = require("path");
const { lastTest, lastSensorkort } = require("./last");

const rot = path.join(__dirname, "..");
const les = f => fs.readFileSync(path.join(rot, f), "utf8");
const html = les("psy1-vitenskap-og-metode.html");
const { B, ALIAS, norm, matchIdx } = lastTest(html);

const feil = [], varsel = [];
const F = (b, t) => feil.push("Bolk " + b.n + ": " + t);
const V = (b, t) => varsel.push("Bolk " + b.n + ": " + t);
const kort = t => "«" + (t.length > 45 ? t.slice(0, 45) + "…" : t) + "»";

/* 1. Form og invarianter. Lagret fremdrift og beste skår bruker plassen i B,
      så nye bolker skal ligge bakerst. */
const nr = new Set();
B.forEach((b, i) => {
  if (nr.has(b.n)) F(b, "bolknummeret er brukt før");
  nr.add(b.n);
  if (b.n !== i + 1) V(b, "nummeret følger ikke plassen i lista (" + (i + 1) + ")");
  if (typeof b.tema !== "string" || !b.tema) F(b, "mangler tema");
  if (!Array.isArray(b.o) || b.o.length !== 5) return F(b, "skal ha fem alternativer");
  if (!Array.isArray(b.q) || b.q.length !== 5) return F(b, "skal ha fem spørsmål");
  b.o.forEach((o, k) => {
    if (typeof o[0] !== "string" || typeof o[1] !== "string") F(b, "alternativ " + "ABCDE"[k] + " har feil form");
  });
  b.q.forEach((q, k) => {
    if (typeof q[0] !== "string" || !Number.isInteger(q[1]) || q[1] < 0 || q[1] > 4 || typeof q[2] !== "string")
      F(b, "spørsmål " + (k + 1) + " har feil form");
  });
  const svar = b.q.map(q => q[1]);
  if (svar.slice().sort().join("") !== "01234")
    F(b, "hvert alternativ skal være riktig nøyaktig én gang (fasit " + svar.map(k => "ABCDE"[k]).join("") + ")");
  const lab = b.o.map(o => norm(o[0]));
  if (new Set(lab).size !== 5) F(b, "to alternativer har samme tekst");
});

/* 2. Stilreglene: ingen asterisk, tankestrek eller markdown-overskrift, ryddige mellomrom.
      Kortforklaringer starter med liten bokstav uten punktum til slutt. */
B.forEach(b => {
  const tekster = [b.tema, ...b.o.flat(), ...b.q.flatMap(q => [q[0], q[2]])];
  tekster.forEach(t => {
    if (/\*/.test(t)) F(b, "asterisk i " + kort(t));
    if (/[–—]/.test(t)) F(b, "tankestrek i " + kort(t));
    if (/^\s*#/.test(t)) F(b, "markdown-overskrift i " + kort(t));
    if (/^\s|\s$| {2}/.test(t)) F(b, "ekstra mellomrom i " + kort(t));
  });
  b.o.forEach(o => {
    if (!/^[a-zæøå]/.test(o[1]) || /\.$/.test(o[1])) V(b, "kortforklaringen til «" + o[0] + "» bryter mønsteret (liten forbokstav, ikke punktum)");
  });
  b.q.forEach(q => { if (!/[.»)]$/.test(q[2])) V(b, "begrunnelsen slutter uten punktum: " + kort(q[2])); });
});

/* 3. Skriv svaret: hvert alternativ og hvert synonym skal godtas for sitt eget
      alternativ i bolken, og ikke for noe annet. */
B.forEach(b => b.o.forEach((o, k) => {
  [o[0], ...(ALIAS[o[0]] || [])].forEach(t => {
    const m = matchIdx(t, b);
    if (m !== k) F(b, "«" + t + "» godtas som " + (m < 0 ? "ingenting" : "«" + b.o[m][0] + "»") + ", ikke som «" + o[0] + "»");
  });
}));

/* 4. Synonymer som ikke hører til noe alternativ (som regel rester etter omdøping). */
const alleAlt = new Set(B.flatMap(b => b.o.map(o => o[0])));
Object.keys(ALIAS).filter(k => !alleAlt.has(k))
  .forEach(k => varsel.push("ALIAS «" + k + "» hører ikke til noe alternativ"));

/* 5. Kortforklaringer som gjentar ord fra begrepet. Gjør en framtidig koblevisning
      (begrep til forklaring) for lett. */
const ord = t => norm(t).split(" ").filter(w => w.length >= 4);
let ekko = 0;
B.forEach(b => b.o.forEach(o => {
  const l = ord(o[0]), e = ord(o[1]);
  const treff = l.find(w => e.some(x => x === w || (w.length >= 5 && x.slice(0, 5) === w.slice(0, 5))));
  if (treff) { ekko++; V(b, "kortforklaringen til «" + o[0] + "» gjentar «" + treff + "»"); }
}));

/* 6. Tall som står i teksten på forsiden. */
const kjerne = B.filter(b => !b.ekstra);
const kjerneSpm = kjerne.reduce((s, b) => s + b.q.length, 0);
const ekstraSpm = B.filter(b => b.ekstra).reduce((s, b) => s + b.q.length, 0);
const kjerneDeler = new Set(kjerne.map(b => b.del)).size;
const tall = (re) => { const m = html.match(re); return m ? m.slice(1).map(Number) : null; };
const sub = tall(/(\d+) flervalgsoppgaver i (\d+) bolker på fem, fordelt på (\d+) temaer/);
if (!sub || sub[0] !== kjerneSpm || sub[1] !== kjerne.length || sub[2] !== kjerneDeler)
  feil.push("Forsiden oppgir " + (sub || []).join("/") + " (spørsmål/bolker/temaer), men kjernen har " +
            kjerneSpm + "/" + kjerne.length + "/" + kjerneDeler);
const ekstraTekst = tall(/I tillegg[^<]*?(\d+) ekstraoppgaver/);
if (!ekstraTekst || ekstraTekst[0] !== ekstraSpm)
  feil.push("Forsiden oppgir " + (ekstraTekst || ["?"])[0] + " ekstraoppgaver, men det finnes " + ekstraSpm);
const knapp = tall(/data-set="all">Alle (\d+)</), etikett = tall(/return "alle (\d+)"/);
if (!knapp || knapp[0] !== kjerneSpm) feil.push("Knappen «Alle» stemmer ikke med kjernen (" + kjerneSpm + ")");
if (!etikett || etikett[0] !== kjerneSpm) feil.push("labelOf («alle N») stemmer ikke med kjernen (" + kjerneSpm + ")");

/* 7. Fasiten i README skal være den samme som i testen. */
const readme = les("README.md");
const fasitDel = readme.split("## Fasit")[1] || "";
const blokk = (fasitDel.match(/```\n([\s\S]*?)```/) || [])[1];
const fasit = B.map(b => b.q.map(q => "ABCDE"[q[1]]).join("")).join("");
if (!blokk) feil.push("Fant ikke fasitblokken i README");
else if (blokk.replace(/\s/g, "") !== fasit) feil.push("Fasiten i README stemmer ikke med testen");
const tilBolk = (fasitDel.match(/bolk 1 til (\d+)/) || [])[1];
if (+tilBolk !== B.length) feil.push("README sier fasit for bolk 1 til " + tilBolk + ", men testen har " + B.length);

/* 8. Sensorkortene lenker til temaer (#tema=del) som finnes i testen. */
const deler = new Set(B.map(b => b.del));
lastSensorkort(les("sensorkort.html")).forEach(k => {
  if (!deler.has(k.del)) feil.push("Sensorkort " + k.nr + " lenker til temaet «" + k.del + "», som ikke finnes");
});

console.log(B.length + " bolker, " + (kjerneSpm + ekstraSpm) + " spørsmål (" + kjerneSpm + " i kjernen, " +
            ekstraSpm + " ekstra), " + deler.size + " temaer. " + ekko + " kortforklaringer gjentar begrepet.");
varsel.forEach(v => console.log("Varsel: " + v));
feil.forEach(f => console.log("FEIL: " + f));
console.log(feil.length ? feil.length + " feil." : "Ingen feil.");
process.exit(feil.length ? 1 : 0);
