---
name: klantanalyse-run
description: Zet de wekelijkse klantanalyse-batch (LEV-gesprekken analyseren op verduurzamingsleads voor Ventasol) van A tot Z klaar om te starten. Alle LEV-salesgesprekken en geen-interessegesprekken langer dan 7 minuten sinds de vorige run die nog geen dossier hebben, plus nakomers, met dezelfde code als origin/main, via de Batch-API. Elke telling wordt gecontroleerd en verklaard. Start pas na een expliciete go van Javi en bewaakt de run tot en met de nameting. Trigger bij "/klantanalyse-run", "klantanalyse run", "zet de klantanalyse klaar", "klantanalyse van deze week", "de maandagruns, nu klantanalyse" of vergelijkbaar.
---

# Klantanalyse-run (wekelijks)

**Klantanalyse** is voor Javi alleen de analyse van LEV-gesprekken op verduurzamingsleads voor Ventasol.
LEV-recycling, de Eneco-indeling en formulierleads vallen daar niet onder.

Doel: Javi zegt "klantanalyse run" en krijgt één go-verzoek waarin alles al is uitgezocht. Welke
gesprekken in welke stroom, wat er afvalt en waarom, wat het kost, en dat de code en de lijsten
kloppen. Na zijn go starten beide batches en wordt de uitkomst in de database nagemeten.

**Standaard is dit elke maandag**, meestal direct na `/compliance-run`.

## Twee stromen, één tabel

| Stroom | Populatie | Runner | Herkomst in `compliance.klant_dossier` |
|---|---|---|---|
| Sales | LEV-salesgesprekken (`corpus.leg` is_sale, rol 'sale'), per record de dag van het laatste salesgesprek, gebrugd, met sale en adres | `klant-dossier-runner.ts <records> --run --batch` | `lev-sale` |
| Geen interesse | Alle LEV-bakken (setup 176), afboeking geen interesse (246), meer dan 7 min, met transcript, als `record:hid`-paar | `analyse-recycling-leads-run.ts --bestand gi-paren.txt --herkomst lev-geen-interesse --run --batch` | `lev-geen-interesse` |

`klant_dossier` heeft het record als sleutel. Een record in beide stromen levert één dossier en de
laatste run overschrijft de eerste. De selectie haalt die overlap er daarom uit (sales gaan voor).

## Harde regels

- **Geen geld zonder go.** Alles tot en met stap 6 is alleen lezen en kost EUR 0. De go moet van
  Javi zelf komen, in deze chat. Zegt hij "alleen als alles klopt": pas starten als elke controle uit
  stap 3 groen is, ook de DRY-runs.
- **Altijd batch** (-50%). Proeven van tientallen gesprekken mogen live, de weekrun nooit.
- **Alleen gesprekken zonder dossier.** Nooit een bestaand dossier overschrijven.
- **Leads worden NOOIT automatisch doorgezet.** Doorzetten doet Javi zelf.
- **Verbodslijst (`compliance.bel_verbod`) is heilig.** Recht van verzet: die gaan er altijd uit.
- **Niets aan de werkmap doen:** niet pullen, stashen of resetten.
- **RUNS.md meteen bijwerken:** blok bij het klaarzetten, de batch-ID's zodra ze in de logs staan.
- **Valt een runner om na het insturen: nooit opnieuw starten.** Er is al betaald. Oogsten met
  `_oogst-klantanalyse-batch.ts --batch <id> --stroom sales|gi --run`.
- **Verandert de prompt of het schema** (`klant-llm.ts`): eerst de schemagrens toetsen
  (`scripts/_toets-schema-grens-1210.ts -`, ~EUR 0,01; te groot = HTTP 400 "compiled grammar is too
  large") en een kleine proef met go. Niet in de weekrun ontdekken.

## Vaste paden

Alle paden relatief aan `C:\Users\javim\Desktop\Executive_assistant`.

| Wat | Pad |
|---|---|
| App, hier draai je alle `npx tsx` | `projects/ventasol/ventasol/data-project/wecall-app` |
| Scripts van deze skill | `skills/klantanalyse-run/scripts/` |
| Codecontrole (gedeeld met compliance-run) | `skills/compliance-run/scripts/code-check.sh` |
| Runmap (lijsten, logs) | `C:\tmp\wecall-klantanalyse-<DDMM>\` |
| Runlogboek | `projects/ventasol/ventasol/data-project/RUNS.md` (nooit volledig lezen) |

`klantanalyse-batch.ps1` kopieert de twee `_`-scripts zelf naar `wecall-app/scripts/` (tsx vindt de
modules alleen vanuit de app-map).

## Stap 0: database bereikbaar

Luistert `localhost:55432` niet: `.\projects\ventasol\scripts\start-dev.ps1` (PowerShell, timeout 300000).

## Stap 1: meten (parallel, alles EUR 0)

1. **Code:** `bash skills/compliance-run/scripts/code-check.sh scripts/klant-dossier-runner.ts scripts/analyse-recycling-leads-run.ts scripts/pick-geen-interesse-batch.ts`
   Moet eindigen op `CODE OK`. (Het regelboekdeel van de uitvoer hoort bij compliance en is hier niet van belang.)
2. **Vorige runs:** Grep in RUNS.md op `^### [0-9]+\..*KLANTANALYSE` (eerste 4 treffers) voor de vorige
   weekrun en zijn venster, en op `KLAARGEZET|WACHT OP GO` (heeft een andere chat al iets klaargezet?).
   Kruis met `app.ai_run`: `kind='klant'` en `triggered_by` `runner:klant-dossier-batch` of
   `runner:lev-geen-interesse-batch`. Open rijen zonder eindtijd melden. Een losse `test-javi-juli`-rij
   (één formulierlead, live) raakt de weekrun niet.
3. **Selectie verversen:** vanuit de hoofdmap
   `powershell -NoProfile -ExecutionPolicy Bypass -File skills\klantanalyse-run\scripts\klantanalyse-batch.ps1 -Van <VAN> -Tot <TOT> -Map C:\tmp\wecall-klantanalyse-<DDMM>`
   (zonder `-Start` = alleen tellen). **Venster:** de dag na het einde van de vorige weekrun tot en met
   gisteren. Beide datums zijn inclusief.
4. **Nakomers:** hetzelfde script over de vier weken vóór `<VAN>`, naar een eigen map
   (`...\<DDMM>\nakomers`). Verwacht: 0 te analyseren. Alles wat er nog zonder dossier staat moet
   terecht afvallen (verbodslijst, geen sale of adres, geen adres in de belbak). Komen er wel nakomers
   uit, neem het venster dan ruimer zodat ze meegaan, en meld ze apart.

## Stap 2: beoordelen

| Signaal | Doen |
|---|---|
| code-check niet OK | Stoppen en melden. Niet zelf pullen |
| Picker: dekking onder 95% of gesprekken "nog in de transcriptiewachtrij" | Noemen. Een handvol gaat volgende week mee; veel = een dag wachten of voorrang geven (`prioritize-geen-interesse-transcripts.ts --run`, EUR 0, met akkoord) |
| Sales per dag: `gebrugd` lager dan `gesprekken` | De compliance-brug loopt achter. Melden; die gesprekken gaan anders stil niet mee |
| "al een klant_dossier" | Normaal (eerder geanalyseerd of in de andere stroom). Aantal noemen |
| Verbodslijst | Gaat eruit. Aantal noemen |
| "geen gekoppelde sale of adres" / "geen adres of transcript" | De runner zou ze overslaan. Aantal noemen |
| Controle aan het eind van de selectie (overlap, dubbel, met dossier) | Moet 0 · 0 · 0 zijn. Anders stoppen (het script stopt zelf ook) |
| Venster sluit niet aan op de vorige run (gat of overlap) | Venster aanpassen voordat je verder gaat |

## Stap 3: DRY van beide runners (EUR 0, op de achtergrond)

Duurt ~20 minuten per stroom bij ~500 gesprekken (19-10: 09:04 → 09:24; ze bouwen elke prompt op en de
geen-interesse-DRY ververst eerst de Steam-belhistorie). Start ze direct na de selectie, tegelijk, op de
achtergrond zonder tijdslimiet, en doe intussen de rest:
- `npx tsx --tsconfig scripts/tsconfig.json scripts/klant-dossier-runner.ts $(cat <map>/sales-records.txt) --batch`
- `npx tsx --tsconfig scripts/tsconfig.json scripts/analyse-recycling-leads-run.ts --bestand <map>/gi-paren.txt --herkomst lev-geen-interesse --batch`

Beide moeten melden dat ze precies het aantal uit de selectie zouden insturen ("Zou N gesprekken
analyseren"), zonder fouten. De geen-interesse-DRY ververst eerst de belhistorie uit Steam; dat is normaal.

## Stap 4: kosten

- **Per gesprek** (met denkstappen, gemeten in RUNS 112): sales EUR 0,0624, geen interesse EUR 0,0477.
  Staat in de selectie; pas aan als de laatste weekrun duidelijk anders uitkwam (nameting stap 8 geeft het).
- **Band:** raming -10% tot +12%. RUNS 112 kwam 3% onder de raming uit.
- De runners kennen geen `--max-eur`. Het bedrag ligt vast door de lijsten.

## Stap 5: klaarzetten

- **Runnummer:** het hoogste `### N.` in RUNS.md lokaal en op origin, plus 1.
- **Starten gaat met hetzelfde script plus `-Start`.** Het ververst de selectie vlak voor het insturen
  (wat intussen een dossier kreeg valt eruit), splitst sales boven 700 records in delen, en start elke
  runner losgekoppeld via WMI. Logs: `sales.log` (of `sales-1.log`, `sales-2.log`) en `gi.log` in de runmap.
- **RUNS.md-blok** direct onder de inleiding van `## Nu actief`:

```
### <N>. KLANTANALYSE <VAN> t/m <TOT> MET DENKSTAPPEN · BATCH · ⏳ KLAARGEZET <datum>, WACHT OP GO JAVI · werk-PC · raming EUR <r>

- **Wat:** <s> sales + <g> geen interesse (> 7 min) zonder dossier, gespreksdagen <VAN> t/m <TOT>. Nakomers <periode>: <n>.
  Afgevallen: <per poort met aantal>. Controle: 0 overlap · 0 dubbel · 0 met dossier.
- **Voorcontrole (EUR 0):** code-check OK (<aantal> bestanden) · DRY sales <s> · DRY geen interesse <g>.
- **Start:** `powershell -NoProfile -ExecutionPolicy Bypass -File skills\klantanalyse-run\scripts\klantanalyse-batch.ps1 -Van <VAN> -Tot <TOT> -Map <map> -Start`
- **Valt een runner om na het insturen:** niet opnieuw starten, oogsten met `_oogst-klantanalyse-batch.ts --batch <id> --stroom sales|gi --run`.
- **⚠️ Onbetrouwbaar zolang dit loopt:** de leadlijst en "Nieuw voor jou" voor gesprekken van <VAN> t/m <TOT>
  (dossiers komen pas binnen als de batch klaar is); AI-kosten van vandaag in `app.ai_run`.
- **Leads worden NOOIT automatisch doorgezet.**
```

## Stap 6: go-verzoek aan Javi

1. **Wat:** per stroom het aantal en de gespreksdagen.
2. **Wat afvalt en waarom:** per poort met aantal; nakomers.
3. **Gecontroleerd:** code, DRY's, controle 0/0/0, aansluiting op de vorige run.
4. **Kosten:** tabel per stroom, samen, band.
5. Sluit af met: *"Geef je een go voor de klantanalyse-batch, ~EUR <r>?"*

## Stap 7: na de go starten en bewaken

1. Status in het RUNS.md-blok naar `GESTART <datum tijd> · go Javi ("<zijn woorden>")`.
2. Starten met `klantanalyse-batch.ps1 ... -Start`. Controleer in de uitvoer dat de selectie gelijk
   bleef (of verklaar het verschil) en dat elke runner `rc 0` gaf. Weigert de classifier het starten:
   geef Javi het commando.
3. **Bewaken** met Monitor op de logs (max 30 min, daarna opnieuw instellen en eerst de logs nalopen):
   `tail -n +1 -F <map>/sales.log <map>/gi.log | grep -a -v --line-buffered "in_progress" | grep -a -E --line-buffered "msgbatch_|✗|[Ee]rror|faal|opgeslagen|Batch insturen|ended|[Tt]otaal|exit"`
   Niet filteren op "klaar": de pollregels ("in_progress (482 bezig, 0 klaar)") vullen dan de chat.
   Elk batch-ID meteen in RUNS.md.

## Stap 8: klaar en nameten

1. Beide logs klaar. Dan vanuit de app-map:
   `npx tsx --tsconfig scripts/tsconfig.json scripts/_q-klantanalyse-nameting.ts --map <map>`
   Moet geven: elk record uit beide lijsten heeft een dossier met de juiste herkomst, met situatie, en
   (bijna) allemaal met klantuitspraken. Plus kosten per stroom, het lead-oordeel en de controle.
2. **Controle van de samenvattingen:** `npx tsx --tsconfig scripts/tsconfig.json scripts/_check-samenvattingen.ts`
   (de nameting geeft de top-5 redenen al per stroom).
3. **RUNS.md-blok** naar de vorm van RUNS 112: kop `✅ ... KLAAR <tijd>, <n>/<n>, werkelijk EUR <x> (raming <r>)`,
   regel **Uitkomst** met per stroom ai_run-id, aantal, kosten, lead-oordeel ja/twijfel/nee, controle afgekeurd met de
   hoofdredenen. "Niets doorgezet."
4. Melden aan Javi in vijf regels.

## Wat deze skill NIET doet

- Geen leads doorzetten, niet naar Geselecteerd, niet naar een belbak.
- Geen LEV-recycling, formulierleads of Eneco-indeling.
- Geen promptwijzigingen. Die gaan via een proef met een eigen go.
- Niet committen of pushen.

## Herkomst

Opgebouwd op 19-10-2026 (RUNS 118) uit RUNS 112 (12-10: 462 sales + 332 geen interesse, EUR 44,64).
- Selectiescript afgeleid van `_klantanalyse-selectie-1210.ts`, nu met venster en map als argument.
- De nameting is getoetst op RUNS 112: lead-oordeel 52/150/260 en 36/78/218, 50 afgekeurd en 784 met
  klantuitspraken, gelijk aan wat toen is gemeten.
- `situatie` en `klantZei` zijn lijsten in het dossier: een lege lijst `[]` is geen inhoud.
