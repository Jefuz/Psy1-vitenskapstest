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
BEDAC  EABDC  BECDA  CEDAB  CDAEB  BDECA  DACEB  CBEAD  BDEAC  ECABD
CEADB  CAEBD  EBACD  DABEC  DACBE  ECADB  EBADC  BDEAC  DBEAC  CAEDB
```

Forms-versjonen «Psy-1 intro quiz» har bare bolk 1 til 12, med samme fasit og
rekkefølge som her.

## Lokal utvikling

Filen er selvstendig og kan åpnes rett fra disk. For GitHub Pages holder det å
pushe mappa og slå på Pages fra rot i repoinnstillingene.
