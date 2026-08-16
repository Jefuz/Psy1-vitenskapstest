# Vitenskap og metode, Psykologi 1

Øvingstest til økt 1A. 60 flervalgsoppgaver i 12 bolker på fem, der alle fem
spørsmålene i en bolk deler de samme fem alternativene. Ren statisk HTML/CSS/JS
uten byggverktøy, samme mønster som `Politikk-test`.

- **Test:** <https://jefuz.github.io/Psy1-vitenskapstest/psy1-vitenskap-og-metode.html> (rot-URL-en videresender hit)

Testen er et øvingsverktøy, ikke en vurdering. Ingen data forlater nettleseren.

## Filer

| Fil | Innhold |
|---|---|
| `psy1-vitenskap-og-metode.html` | Hele testen: spørsmål, alternativer, forklaringer, øvingslogikk og resultatside |
| `index.html` | Videresending fra rot-URL til testen |
| `.nojekyll` | Slår av Jekyll-prosessering på GitHub Pages |

## Datamodell (alt ligger i `psy1-vitenskap-og-metode.html`)

Én array `B` med 12 bolker:

```js
{n:5, tema:"Sammenheng og årsak",
 o:[["Korrelasjon","en målt sammenheng som ikke i seg selv viser årsak"], ...],   // 5 alternativer
 q:[["Spørsmålstekst", 2, "Begrunnelse som vises etter svar"], ...]}              // 5 spørsmål
```

- `o[i][0]` er alternativteksten, `o[i][1]` er kortforklaringen som vises hvis
  eleven velger dette alternativet feil.
- `q[i][1]` er indeksen til riktig alternativ (0 til 4, altså A til E).
- Hver bolk bruker hvert alternativ som riktig svar nøyaktig én gang. Testen i
  `/tmp`-skriptet sjekker denne invarianten; behold den ved redigering.

**Legge til en bolk:** legg til et objekt i `B`. Ingenting annet må endres,
bolkvelgeren og fasittabellen genereres fra `B`.

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

Bolk 1 til 12, riktig alternativ per spørsmål:

```
CAEBD  ACDEB  ACBDE  ACBDE  CADEB  ADBCE
ABCDE  ABDCE  CABDE  ABCDE  BACDE  ABCDE
```

Samme fasit gjelder Forms-versjonen «Psy-1 intro quiz», som har de samme 60
spørsmålene i samme rekkefølge.

## Lokal utvikling

Filen er selvstendig og kan åpnes rett fra disk. For GitHub Pages holder det å
pushe mappa og slå på Pages fra rot i repoinnstillingene.
