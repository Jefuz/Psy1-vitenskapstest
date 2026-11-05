/* Henter dataene og skrivesvar-funksjonene ut av øvingstesten, uten nettleser.
   Brukes av sjekk.js og spor.js. Returnerer B (bolkene), ALIAS og funksjonene
   som retter «Skriv svaret», slik de står i HTML-fila. */
const vm = require("vm");

function bit(s, fra, til) {
  const a = s.indexOf(fra), b = s.indexOf(til, a);
  if (a < 0 || b < 0) throw new Error("Fant ikke kodebiten som starter med «" + fra + "»");
  return s.slice(a, b);
}

function lastTest(html) {
  const m = html.match(/<script>([\s\S]*?)<\/script>/);
  if (!m) throw new Error("Fant ikke <script> i øvingstesten");
  const s = m[1];
  const kode = bit(s, "const B=[", "/* ---------------- STATE") +
               bit(s, "const ALIAS=", "function showHint") +
               "\n;({B, ALIAS, norm, matchIdx, variants, commonTok});";
  return vm.runInNewContext(kode, {});
}

function lastSensorkort(html) {
  const m = html.match(/const K=(\[[\s\S]*?\n\]);/);
  if (!m) throw new Error("Fant ikke kortlista K i sensorkort.html");
  return vm.runInNewContext(m[1], {});
}

module.exports = { lastTest, lastSensorkort };
