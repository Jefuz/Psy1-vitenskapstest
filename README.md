# Psykologi 1, repetisjon av hele faget

Øvingstest til repetisjonen før muntlig eksamen. 200 flervalgsoppgaver i 40 bolker
på fem, fordelt på 15 temaer, der alle fem spørsmålene i en bolk deler de samme fem
alternativene. Bolk 1 til 12 er den opprinnelige testen i vitenskap og metode (økt 1A),
uendret. Bolk 13 til 40 dekker resten av faget, to bolker per tema. Ren statisk HTML/CSS/JS
uten byggverktøy, samme mønster som `Politikk-test`.

Testen er et øvingsverktøy, ikke en vurdering. Ingen data forlater nettleseren.

## Bruk

**Lokalt, virker med én gang:** åpne `psy1-vitenskap-og-metode.html` i nettleseren.
Filen er selvstendig og trenger verken server eller nett.

**Publisert:** etter at repoet er pushet og GitHub Pages er slått på, ligger testen på
`https://jefuz.github.io/Psy1-vitenskapstest/psy1-vitenskap-og-metode.html`
(rot-URL-en videresender hit). Lenka er død fram til det er gjort.

Publisering, kjørt fra Windows (ikke fra en mountet Linux-sesjon, der låser
`git` seg på filrettigheter):

```
gh repo create jefuz/Psy1-vitenskapstest --public --source . --push
```

eller, uten `gh`: opprett et tomt repo med navnet `Psy1-vitenskapstest` på
github.com, og kjør `git push -u origin main`. Slå deretter på Pages fra
`main` / rot under Settings → Pages.

## Filer

| Fil | Innhold |
|---|---|
| `psy1-vitenskap-og-metode.html` | Hele testen (filnavnet er beholdt så gamle lenker virker): spørsmål, alternativer, forklaringer, øvingslogikk og resultatside |
| `sensorkort.html` | 18 sensorkort til muntlig øving (ett per tema, pluss tre om personlighetstester, personlighet og psykisk helse, og personlighet på tvers av faget): trekning uten gjentak, sensorvisning og joker som skjules for eksaminanden, tidtaker (7 og 4 min), utskrift av alle kort, og lenke til samme tema i testen (`#tema=<del>`). Kort kan åpnes direkte med `#kort=<nr>`. Trukne kort lagres i `localStorage` under `psy1-sensorkort-trukket`. |
| `index.html` | Videresending fra rot-URL til testen |
| `.nojekyll` | Slår av Jekyll-prosessering på GitHub Pages |

## Datamodell (alt ligger i `psy1-vitenskap-og-metode.html`)

Én array `B` med 40 bolker:

```js
{n:5, del:"Vitenskap og metode", tema:"Sammenheng og årsak",
 o:[["Korrelasjon","en målt sammenheng som ikke i seg selv viser årsak"], ...],   // 5 alternativer
 q:[["Spørsmålstekst", 2, "Begrunnelse som vises etter svar"], ...]}              // 5 spørsmål
```

- `o[i][0]` er alternativteksten, `o[i][1]` er kortforklaringen som vises hvis
  eleven velger dette alternativet feil.
- `q[i][1]` er indeksen til riktig alternativ (0 til 4, altså A til E).
- Hver bolk bruker hvert alternativ som riktig svar nøyaktig én gang. Testen i
  `/tmp`-skriptet sjekker denne invarianten; behold den ved redigering.

- `del` er temaet bolken hører til. Forsiden grupperer bolkene etter `del` i den
  rekkefølgen temaene først dukker opp. Bolker uten `del` havner under Vitenskap og metode.

**Legge til en bolk:** legg til et objekt i `B`. Ingenting annet må endres,
bolkvelgeren, temaknappene og fasittabellen genereres fra `B`.

## Språknivå

Spørsmålene skal kunne besvares uten å kjenne forskernavn, akronymer eller
fagbegreper utover Psykologi 1. Kildehenvisninger står i forklaringen, ikke i
spørsmålet. I «Skriv svaret» må eleven skrive alternativet selv, så
alternativtekstene bør være begreper en elev rimelig kan hente fram.

## Svarform

Forsiden har en bryter mellom «Skriv svaret» (standard) og «Velg alternativ». Valget
lagres i `localStorage` under `psy1-svarform` og følger med hver runde.

- I «Skriv svaret» skriver eleven begrepet før alternativene vises. Svaret normaliseres
  (små bokstaver, uten tegnsetting og bindestrek) og godtas ved små skrivefeil:
  0 tegn avvik for svar på inntil 3 bokstaver, 1 for inntil 7, ellers 2. Første bokstav
  må stemme, slik at «ubetinget» ikke godtas for «betinget».
- Ord som går igjen i minst tre alternativer i bolken (som «perspektiv»), kan utelates.
  Tekst i parentes og hver del av «X og Y» godtas også.
- Synonymer ligger i `ALIAS`, nøkkel er alternativteksten slik den står i `B`.
- Hint 1 viser forbokstaver og antall bokstaver, uten trekk. Hint 2 viser alternativene,
  og da teller ikke spørsmålet som riktig på første forsøk.
- Godtas ikke svaret, kan eleven trykke «Jeg mente det samme». Da teller det som riktig.
- Ved endring av alternativer eller `ALIAS`: kontroller at hvert alternativ og hvert
  synonym bare godtas for sitt eget alternativ i bolken.

## Runder

- Én bolk, et helt tema, 20 tilfeldige fra hele faget, eller alle 200.
- «Det jeg kan dårligst» trekker 20 spørsmål fra bolker eleven ikke har tatt eller
  har under 80 prosent på. Beste skår lagres også når en hel bolk inngår i en temarunde.

## Øvingslogikk

- Riktig på første forsøk teller i poengsummen. Riktig etter bom teller ikke.
- Feilsvar legges bakerst i køen og kommer igjen til de sitter. Runden er ferdig
  når køen er tom, ikke etter et fast antall spørsmål.
- Resultatsiden viser skår, hvilke begreper som bør repeteres, og full fasit.

## Lagring

`localStorage`:

| Nøkkel | Innhold |
|---|---|
| `psy1-vitenskap-fremdrift` | Påbegynt runde, tilbys som «Fortsett» på forsiden. Slettes når resultatet vises. |
| `psy1-vitenskap-bolker` | Beste prosentskår per bolk, vises på bolkkortene. |

Knappen «Nullstill fremdrift» sletter begge.

## Fasit

Riktig alternativ per spørsmål, bolk 1 til 40:

```
CAEBD  ACDEB  ACBDE  ACBDE  CADEB  ADBCE  ABCDE  ABDCE  CABDE  ABCDE
BACDE  ABCDE  BCDEA  CDEAB  DAEBC  DAEBC  EDACB  EBDCA  CEADB  BDEAC
BEDAC  EABDC  BECDA  DAEBC  DEABC  BDECA  DACEB  CBEAD  BDEAC  EDABC
CEADB  CAEBD  EBACD  DABEC  DACBE  ECADB  EBADC  BDEAC  DBEAC  BEADC
```

Forms-versjonen «Psy-1 intro quiz» har bare bolk 1 til 12, med samme fasit og
rekkefølge som her.

## Lokal utvikling

Filen er selvstendig og kan åpnes rett fra disk. For GitHub Pages holder det å
pushe mappa og slå på Pages fra rot i repoinnstillingene.
