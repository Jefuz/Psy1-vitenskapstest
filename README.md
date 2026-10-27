# Psykologi 1, repetisjon av hele faget

Øvingstest til repetisjonen før muntlig eksamen. 235 flervalgsoppgaver i 47 bolker
på fem, fordelt på 17 temaer, der alle fem spørsmålene i en bolk deler de samme fem
alternativene. I tillegg 30 oppgaver der eleven kobler par (15) eller setter ledd i riktig
rekkefølge (15). Bolk 1 til 12 er den opprinnelige testen i vitenskap og metode (økt 1A),
uendret. Bolk 13 til 40 dekker resten av faget, to bolker per tema. Bolk 41 til 47 er
ekstraoppgaver om fasettene i femfaktormodellen (temaet «Personlighet: fasetter»).
Bolk 48 til 55 kom til 26.10.2026: fagfelt og behandling (kompetansemål 3), bærekraftige
valg (kompetansemål 9), hjernens deler, rusmiddelgrupper, andre former for læring,
minneteknikker og flere fagpersoner. Bolk 41 til 47 og bolk 49 (behandling, som ellers er
Psykologi 2-stoff) er ekstra og ikke med i de blandede rundene. Ren statisk HTML/CSS/JS
uten byggverktøy, samme mønster som `Politikk-test`.

Testen er et øvingsverktøy, ikke en vurdering. Ingen data forlater nettleseren.

## Bruk

**Lokalt, virker med én gang:** åpne `psy1-vitenskap-og-metode.html` i nettleseren.
Filen er selvstendig og trenger verken server eller nett.

**Publisert:** `https://jefuz.github.io/Psy1-vitenskapstest/psy1-vitenskap-og-metode.html`
(rot-URL-en videresender hit). Sensorkortene ligger på
`https://jefuz.github.io/Psy1-vitenskapstest/sensorkort.html`.

**Selvsjekk etter redigering:** åpne testen med `?sjekk` på slutten av adressen
(`psy1-vitenskap-og-metode.html?sjekk`). Et banner øverst viser enten «alt i orden» eller
en liste over avvik, og det samme skrives til konsollen. Se «Selvsjekk» under.

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
| `psy1-vitenskap-og-metode.html` | Hele testen (filnavnet er beholdt så gamle lenker virker): spørsmål, alternativer, forklaringer, koble- og rekkefølgeoppgaver, øvingslogikk, selvsjekk og resultatside |
| `sensorkort.html` | 20 sensorkort til muntlig øving (ett per tema, pluss tre om personlighetstester, personlighet og psykisk helse, og personlighet på tvers av faget, og fra 26.10.2026 kort 19 om psykologi i yrkeslivet og kort 20 om psykologi og bærekraft): trekning uten gjentak, sensorvisning og joker som skjules for eksaminanden, tidtaker (7 og 4 min), utskrift av alle kort, og lenke til samme tema i testen (`#tema=<del>`). Kort kan åpnes direkte med `#kort=<nr>`. Trukne kort lagres i `localStorage` under `psy1-sensorkort-trukket`. |
| `index.html` | Videresending fra rot-URL til testen |
| `.nojekyll` | Slår av Jekyll-prosessering på GitHub Pages |

## Datamodell (alt ligger i `psy1-vitenskap-og-metode.html`)

### Flervalg: arrayen `B`, 55 bolker (47 i kjernen og 8 ekstra)

```js
{n:5, del:"Vitenskap og metode", tema:"Sammenheng og årsak",
 o:[["Korrelasjon","en målt sammenheng som ikke i seg selv viser årsak"], ...],   // 5 alternativer
 q:[["Spørsmålstekst", 2, "Begrunnelse som vises etter svar"], ...]}              // 5 spørsmål
```

- `o[i][0]` er alternativteksten, `o[i][1]` er kortforklaringen som vises hvis
  eleven velger dette alternativet feil.
- `q[i][1]` er indeksen til riktig alternativ (0 til 4, altså A til E).
- Hver bolk bruker hvert alternativ som riktig svar nøyaktig én gang. Selvsjekken
  kontrollerer dette; behold invarianten ved redigering.
- `del` er temaet bolken hører til. Bolker uten `del` havner under Vitenskap og metode.
- `ekstra:true` holder en bolk utenfor «Alle», «20 tilfeldige» og «Det jeg kan dårligst»
  (konstanten `CORE`). Bolken er fortsatt med i sitt eget tema og kan velges alene.
- Nye bolker legges bakerst i `B`, fordi lagret fremdrift og beste skår bruker indeksen i
  arrayen. Feltet `n` er bare visningsnummeret.

### Koble og rekkefølge: arrayen `X`, 30 oppgaver

```js
{type:"koble", del:"Rus", tema:"Stoff og gruppe",
 tekst:"Koble hvert stoff med gruppen det hører til.",
 par:[["Alkohol","Sentraldempende"], ["Kokain","Sentralstimulerende"], ...],
 forkl:"Forklaring som vises etter retting."}

{type:"rekke", del:"Kriser", tema:"Cullbergs faser",
 tekst:"Sett Cullbergs krisefaser i rekkefølge.",
 rekke:["Sjokkfasen","Reaksjonsfasen","Bearbeidingsfasen","Nyorienteringsfasen"],   // riktig rekkefølge
 forkl:"..."}
```

- Koble: hver rad har en nedtrekksliste. Den siden av parene som har kortest tekst i snitt,
  havner i listene, så det valgte svaret er lesbart på mobil. Når de lange tekstene står
  fast, stokkes radene. Høyresidene må være unike i oppgaven.
- Rekkefølge: leddene stokkes (aldri i riktig rekkefølge fra start), og eleven flytter dem
  med pilknapper, som virker både med mus, berøring og tastatur.
- Minst tre par eller ledd per oppgave. I køen har oppgavene id-en `"x"+indeks`, ved siden
  av tallene for spørsmålene. Nye oppgaver legges derfor bakerst i `X`.

### Temarekkefølgen: `DEL_ORDER`

Forsiden viser temaene i rekkefølgen i `DEL_ORDER`. Et tema som ikke står der, havner
sist. «Anvendt psykologi» står etter faghistorien, «Bærekraft» etter rus.

**Legge til en bolk eller oppgave:** legg til et objekt bakerst i `B` eller `X`, og kjør
selvsjekken. Bolkvelgeren, temaknappene, antallene på forsiden og fasittabellen genereres
fra dataene. Et nytt tema må også inn i `DEL_ORDER` hvis det skal stå et bestemt sted.

## Språknivå

Spørsmålene skal kunne besvares uten å kjenne forskernavn, akronymer eller
fagbegreper utover Psykologi 1. Kildehenvisninger står i forklaringen, ikke i
spørsmålet. Unntakene er personbolkene (3, 14 og 55) og koblingsoppgaven «Hvem står bak?».
I «Skriv svaret» må eleven skrive alternativet selv, så alternativtekstene bør være
begreper en elev rimelig kan hente fram. Påstander i forklaringene følger regelen om
«ifølge» og kvalifiserende ord der belegget er usikkert.

## Svarform

Forsiden har en bryter mellom «Skriv svaret» (standard) og «Velg alternativ». Valget
lagres i `localStorage` under `psy1-svarform` og følger med hver runde. Koble- og
rekkefølgeoppgavene ser like ut i begge.

I «Skriv svaret» skriver eleven begrepet før alternativene vises. Svaret sammenlignes med
hvert alternativ i to former, og det nærmeste alternativet vinner:

1. **Ordene satt sammen**, som før: små bokstaver, uten tegnsetting, bindestrek og
   mellomrom.
2. **Stammeform**, nytt 26.10.2026. Hvert ord gjøres om i tre trinn:
   - aksenter foldes (é til e, ö til ø, ü til u), så «Køhler» og «Kohler» treffer Köhler;
   - ordledd som betyr det samme i ulike lærebøker gjøres like: hukommelse og minne,
     følelse og emosjon, -asjon og -ering (konservasjon, konservering), -istisk og -isme
     (behavioristisk, behaviorismen), -stadiet og -fasen (utmattelsesstadiet);
   - bøyingsendelser fjernes med en norsk stemmer etter Snowball-reglene, så synapsene,
     stavene, eneggete tvillinger og Freuds treffer grunnformen.

   Generiske etterledd som -teorien, -modellen, -metoden, -effekten, -prosesseringen og
   -fasen kan i tillegg utelates («selvbestemmelse», «sjokk»).

Felles regler for begge former:

- Små skrivefeil godtas: 0 tegn avvik for inntil 3 bokstaver, 1 for inntil 7, ellers 2.
  Første bokstav må stemme, slik at «ubetinget» ikke godtas for «betinget».
- Ligger svaret like nær to alternativer (for eksempel «kvatitativ», som er én feil unna
  både kvantitativ og kvalitativ), godtas ingen av dem automatisk.
- Ord som går igjen i minst tre alternativer i bolken (som «perspektiv»), kan utelates.
  Tekst i parentes og hver del av «X og Y» godtas også.
- For personnavn godtas etternavnet alene.
- Synonymer ligger i `ALIAS`, nøkkel er alternativteksten slik den står i `B`. Listen har
  også ordene lærebøkene bruker der de skiller seg fra testen, fra samsvarsregisteret for
  Diseth, Menneskesinnet 1 og Svendsen: naturlig utvalg, stress-sårbarhetsmodellen,
  forlukking, udelt miljø, primær og sekundær fortolkning, følelsesfokusert mestring,
  motstandsdyktighet, topdown-prosessering, stimulantia, sedativer, opiater og flere.
- Hint 1 viser forbokstaver og antall bokstaver, uten trekk. Hint 2 viser alternativene,
  og da teller ikke spørsmålet som riktig på første forsøk.
- Godtas ikke svaret, kan eleven trykke «Jeg mente det samme». Da teller det som riktig.

## Selvsjekk

`?sjekk` kjører `selvsjekk()` og rapporterer:

- bolker som ikke har fem alternativer og fem spørsmål, eller der et alternativ ikke er
  riktig nøyaktig én gang, og bolknumre som er brukt to ganger;
- alternativer eller synonymer som ikke godtas for sitt eget alternativ i bolken;
- vanlige bøyinger av et alternativ (-en, -et, -er, -ene, -e, -s) som treffer et annet
  alternativ;
- `ALIAS`-nøkler som ikke finnes som alternativ;
- koble- og rekkefølgeoppgaver med færre enn tre par eller ledd, doble tekster eller
  ukjent type.

Ved endring av alternativer eller `ALIAS`: kjør selvsjekken før publisering.

## Runder

- Dagens repetisjon, én bolk, én koble- eller rekkefølgeoppgave, et helt tema (spørsmål først, så temaets
  oppgaver), 20 tilfeldige fra hele faget, alle i kjernen, eller alle koble- og
  rekkefølgeoppgavene.
- «Det jeg kan dårligst» trekker 20 fra bolker og oppgaver eleven ikke har tatt eller
  har under 80 prosent på, med opptil tre koble- eller rekkefølgeoppgaver. Beste skår
  lagres også når en hel bolk inngår i en temarunde.

## Dagens repetisjon, sikkerhet og forvekslinger

- Hvert spørsmål og hver oppgave eleven har svart på, får en boks fra 1 til 5. Riktig på
  første forsøk flytter én boks opp, feil sender tilbake til boks 1. Boksen bestemmer når
  elementet kommer igjen: om 1, 3, 7, 14 eller 30 dager. «Jeg mente det samme» teller som
  riktig også her.
- Forsiden viser hvor mange som venter i dag. En runde tar høyst 25, i denne rekkefølgen:
  feil eleven var sikker på, elementer eleven har forvekslet med et annet alternativ, så de
  som har ventet lengst.
- Før svaret kan eleven velge «Sikker», «Tror det» eller «Gjetter» (kan slås av under
  Svarform). Resultatsiden viser andel riktige per nivå.
- Når eleven svarer et galt alternativ, eller skriver noe som treffer et galt alternativ,
  logges paret. Forsiden viser de tre parene eleven forveksler oftest, og resultatsiden
  parene fra runden.

## Øvingslogikk

- Riktig på første forsøk teller i poengsummen. Riktig etter bom teller ikke.
- Feilsvar legges bakerst i køen og kommer igjen til de sitter. Runden er ferdig
  når køen er tom, ikke etter et fast antall spørsmål.
- En koble- eller rekkefølgeoppgave teller som riktig når alt er riktig. Raden eller
  leddet som er feil, markeres med riktig svar eller riktig plass, og oppgaven kommer
  igjen i ny stokking. Andelen riktige ledd på første forsøk lagres som beste skår.
- Resultatsiden viser skår, hva som bør repeteres, og full fasit.

## Lagring

`localStorage`:

| Nøkkel | Innhold |
|---|---|
| `psy1-vitenskap-fremdrift` | Påbegynt runde, tilbys som «Fortsett» på forsiden. Slettes når resultatet vises. |
| `psy1-vitenskap-bolker` | Beste prosentskår per bolk (nøkkel: indeksen i `B`) og per koble- eller rekkefølgeoppgave (nøkkel: `x` + indeksen i `X`). |
| `psy1-repetisjon` | Per spørsmål (indeksen i `FLAT`) og oppgave (`x` + indeks): boks, neste dag, antall svar, antall forvekslinger og om siste feil var gjort med «sikker». |
| `psy1-forvekslinger` | Antall ganger hvert par av alternativer er forvekslet. |
| `psy1-sikkerhet` | Om eleven blir spurt om sikkerhet (`1` eller `0`). |

Knappen «Nullstill fremdrift» sletter fremdrift, beste skår, repetisjon og forvekslinger.
Alt ligger i nettleseren, så mobil og datamaskin har hver sin repetisjon.

## Fasit

Riktig alternativ per spørsmål, bolk 1 til 55:

```
CAEBD  ACDEB  ACBDE  ACBDE  CADEB  ADBCE  ABCDE  ABDCE  CABDE  ABCDE
BACDE  ABCDE  BCDEA  CDEAB  DAEBC  DAEBC  EDACB  EBDCA  CEADB  BDEAC
BEDAC  EABDC  BECDA  DAEBC  DEABC  BDECA  DACEB  CBEAD  BDEAC  EDABC
CEADB  CAEBD  EBACD  DABEC  DACBE  ECADB  EBADC  BDEAC  DBEAC  BEADC
ADBEC  BEACD  CABED  EADBC  DAECB  CEADB  CAEBD  BCADE  BEACD  DAEBC
CABED  CAEBD  BDACE  ABEDC  BDECA
```

Fasiten for koble- og rekkefølgeoppgavene er selve dataene i `X`: parene står riktig
koblet, og `rekke` står i riktig rekkefølge.

Forms-versjonen «Psy-1 intro quiz» har bare bolk 1 til 12, med samme fasit og
rekkefølge som her. Endringene 26.10.2026 endrer ikke spørsmål, alternativer eller fasit
i bolk 1 til 12, så Forms-skjemaet trenger ingen oppdatering.

## Lokal utvikling

Filen er selvstendig og kan åpnes rett fra disk. For GitHub Pages holder det å
pushe mappa og slå på Pages fra rot i repoinnstillingene.
