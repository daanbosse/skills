---
name: compliance-run
description: Zet de wekelijkse LEV-compliance-batch van A tot Z klaar om te starten. Alle salesgesprekken sinds de vorige run die nog nooit beoordeeld zijn, op het beste regelboek van dat moment, via de Batch-API, met elke telling gecontroleerd en verklaard. Start pas na een expliciete go van Javi en bewaakt de run daarna tot en met de nameting. Trigger bij "/compliance-run", "compliance run", "zet de compliance klaar", "compliance-batch van deze week", "de maandagruns, begin met compliance" of vergelijkbaar.
---

# Compliance-run (wekelijks, LEV)

Doel: Javi zegt "compliance run" en krijgt één go-verzoek waarin alles al is uitgezocht. Welke
gesprekken, welk regelboek, wat er niet meegaat en waarom, wat het kost, en dat de code en de data
kloppen. Na zijn go start de run en wordt hij bewaakt tot de cijfers in de database zijn nagemeten.

**Standaard is dit elke maandag:** de saledagen van vorige week, plus nakomers van eerdere weken.

## Harde regels

- **Geen geld zonder go.** Alles tot en met stap 7 is alleen lezen en kost EUR 0. De go moet van
  Javi zelf komen, in deze chat, op het genoemde bedrag. Een go van vorige week geldt niet.
- **Altijd batch** (Batch-API, -50%). Nooit live.
- **Alleen nooit beoordeelde gesprekken.** Geen `--herscore`: fixes alleen vooruit. Een oordeel op een
  oudere regelboekversie blijft staan.
- **Geen misleiding-extractie** (`misleiding-extractie.ts`, ~EUR 20 per week), tenzij Javi er
  uitdrukkelijk om vraagt. Besluit Javi 08-10: "hoeft niet". Het DRY-script noemt hem wel; niet overnemen.
- **Niets aan de werkmap doen:** niet pullen, stashen of resetten. Andere chats werken in dezelfde map.
- **RUNS.md meteen bijwerken:** blok bij het klaarzetten, elk BATCH-ID zodra het in het log staat.
- **Valt het proces weg nadat er een BATCH-ID is: nooit opnieuw starten.** Er is al betaald. Hervatten
  met `--hervat-ronde1` (RUNS.md run 103) of de resultaten ophalen.
- **Een telling die niet klopt, wordt verklaard voordat je om een go vraagt.** Niet afronden, niet
  "ongeveer". Twee scripts die verschillend tellen = uitzoeken welke gesprekken het verschil zijn.

## Vaste paden

Alle paden relatief aan `C:\Users\javim\Desktop\Executive_assistant`.

| Wat | Pad |
|---|---|
| Repo (gedeeld met Daan) | `projects/ventasol/ventasol` |
| App, hier draai je alle `npx tsx` | `projects/ventasol/ventasol/data-project/wecall-app` |
| Meetscripts van deze skill | `skills/compliance-run/scripts/` |
| Runlogboek | `projects/ventasol/ventasol/data-project/RUNS.md` (nooit volledig lezen, ~90k tokens) |
| Startbestand en log | `C:\tmp\wecall-compliance-<DDMM>\run-<versie>.cmd` en `.log` |
| Regelboek in de code | `src/lib/compliance/rulebook-changes.ts` (`HUIDIG_REGELBOEK`) |

De twee `_q-`-scripts horen bij deze skill. tsx vindt `drizzle-orm` en de `@/`-paden alleen vanuit de
app-map, dus kopieer ze eerst:
`cp skills/compliance-run/scripts/_q-compliance-*.ts projects/ventasol/ventasol/data-project/wecall-app/scripts/`

## Stap 0: database bereikbaar

Luistert `localhost:55432` niet, draai dan `.\projects\ventasol\scripts\start-dev.ps1` (PowerShell,
timeout 300000). Dat opent de tunnel naar core. Core onbereikbaar: stoppen en het Javi vragen.

## Stap 1: meten (één bericht, parallel, alles EUR 0)

1. **Code en regelboek:** `bash skills/compliance-run/scripts/code-check.sh`
2. **Voormeting:** vanuit de app-map
   `npx tsx --tsconfig scripts/tsconfig.json scripts/_q-compliance-voormeting.ts`
   Standaardvenster: de laatste 35 saledagen tot en met gisteren. Alleen met reden afwijken (`--van`/`--tot`).
3. **Open batches bij Anthropic:** `npx tsx --tsconfig scripts/tsconfig.json scripts/_check-batches.ts`
   (een crash met `Assertion failed ... async.c` aan het eind is ruis van Node op Windows).
4. **Wat RUNS.md zegt:** Grep in RUNS.md op `^### [0-9]+\..*COMPLIANCE` (eerste 6 treffers) voor de
   vorige runs en hun nummers, en op `KLAARGEZET|WACHT OP GO` om te zien of een andere chat al iets
   heeft klaargezet.

## Stap 2: beoordelen (wat elk signaal betekent)

| Signaal | Betekenis | Doen |
|---|---|---|
| code-check `NIET STARTEN` | De keten draait andere code of een ander regelboek dan origin/main | Stoppen. Melden welke bestanden het zijn. Niet zelf pullen |
| code-check `[LET OP]` regelboekdocument noemt een hogere versie | Een nieuwe versie is beschreven maar niet geactiveerd | Melden en vragen. Nooit zelf activeren: activeren loopt via de aftekenronde met Kayra |
| Voormeting §2: open compliance-run | Er loopt al iets, of er is iets blijven hangen. Mogelijk al betaald | Stoppen. Met `_check-batches.ts` en het BATCH-ID uit RUNS.md uitzoeken. Nooit eromheen |
| Voormeting §2: open run van een andere soort (bijv. `klant`) | Raakt deze run niet, maar er is misschien al betaald | Eén regel in het go-verzoek |
| §3 TE SCOREN per dag | Dit gaat mee | Controleren: vallen de dagen na de vorige run (§2 saledagen)? Staan er oudere dagen bij, dan zijn dat nakomers. Apart benoemen |
| §3 `ouder` | Oordeel op een oudere versie | Gaat niet mee. Alleen het aantal noemen |
| §3b tweede sale op een record met een oud oordeel | Compliance werkt per record. De nieuwe sale wordt nooit gescoord, en `--herscore` helpt niet (het transcript in de compliance-laag is nog dat van de eerste sale) | Aantal melden als structureel gat. Besluit van Javi, niet zelf oplossen |
| §4 `geen salesgesprek` | Werving of geen interesse in de compliance-laag. Verklaart waarom de preflight hoger telt | Niets, alleen als verklaring gebruiken |
| §4 `salesgesprek ZONDER transcript` of `buiten het venster` | Een echte sale die stil buiten de run valt | Uitzoeken voor de go (transcriptiewachtrij, venster) |
| §5 nakomers die "NU al gescoord worden met een onvolledig gesprek" | Een leg wacht nog op audio of transcript, maar het gesprek gaat wel mee | Groter dan 0: `--tot` terugzetten tot voor die dag, of een dag wachten. Voorleggen |
| §6 nooit beoordeeld vóór het venster | Oude achterstand (juni-juli is bekend: ~1.000 van voor de volledige dekking) | Eén regel. Nooit stil meenemen; dat is een eigen go met een eigen bedrag |

## Stap 3: DRY van het echte script (EUR 0)

Vanuit de app-map, met het venster uit de voormeting (de laatste regel van §7 geeft het commando):
`npx tsx --tsconfig scripts/tsconfig.json scripts/corpus-compliance-run.ts --van <VAN> --tot <TOT>`

- **`KLAAR OM TE SCOREN` moet gelijk zijn aan TE SCOREN uit de voormeting.** Anders eerst verklaren.
- `STAP 1 brug` of `STAP 2 registreer` groter dan 0: de nachttaak `Wecall-Compliance-Brug` liep
  achter. Eerst gratis bijwerken met hetzelfde commando plus `--run` (zonder `--score`), dan de DRY opnieuw.
- Zet in de DRY geen `--max-eur`: de auto-mode-classifier weigerde de DRY met die vlag op 19-10, zonder vlag ging hij door.
- Raming en band staan onder `raming:`.

## Stap 4: voorcontrole (EUR 0)

`npx tsx --tsconfig scripts/tsconfig.json scripts/_q-preflight-compliance-batch.ts <VAN> <TOT+1 dag>`
(de tweede datum is exclusief). Moet eindigen op `ALLE CONTROLES GROEN`. De preflight telt de hele
compliance-laag, dus ook de niet-sales uit §4. Het verschil moet precies het aantal `geen salesgesprek` zijn.
Zijn raming (EUR 0,45 per gesprek) is verouderd; gebruik die van de DRY.

## Stap 5: kosten

- **Raming:** uit de DRY (gebaseerd op de laatste v4.x-batches).
- **Verwacht:** aantal x het hoogste bedrag per gesprek van de laatste drie runs (voormeting §2).
  Ter referentie: EUR 0,288 tot 0,329 per gesprek in oktober 2026.
- **`--max-eur`:** de hoogste van de bovenkant van de band en het verwachte bedrag, naar boven
  afgerond op tientallen. Het script toetst dit plafond op de raming vóór het indienen.
  Het is een vangnet, geen hard plafond op de werkelijke uitgave.
- **Kleine batches zijn per gesprek duurder** (minder cache): run 121 (226) kostte EUR 0,359 per gesprek, 19% boven de raming
  en EUR 1,08 boven de go van max EUR 80. Onder ~250 gesprekken: reken met de hoogste prijs per gesprek plus 10%, en zeg in
  het go-verzoek dat de werkelijke uitgave boven de raming kan komen.

## Stap 6: klaarzetten

**Runnummer:** het hoogste `### N.` in RUNS.md lokaal en op origin
(`git -C projects/ventasol/ventasol show origin/main:data-project/RUNS.md`) plus 1.

**Startbestand** `C:\tmp\wecall-compliance-<DDMM>\run-<versie>.cmd`:

```bat
@echo off
rem Compliance-batch <versie> (RUNS.md run <N>): alles sinds run <vorige>.
rem Te scoren (DRY <datum>): <aantal> nooit beoordeelde LEV-salesgesprekken, saledagen <per dag>.
rem Materiaalpoort houdt <x> tegen. <y> met een oordeel op een oudere versie bewust NIET (geen --herscore). Zonder misleiding-extractie.
rem KOST TOKENS (raming EUR <r>, band <a>-<b>): alleen starten met een go van Javi.
rem Alleen een regel "BATCH-ID: msgbatch_..." in het log betekent betaald.
rem start /b: dit proces en zijn kinderen negeren Ctrl+C (run 103, poging 1). < NUL: "Terminate batch job (Y/N)?" blijft niet hangen.
rem negeer-ctrl-c.cjs: elk node-proces negeert Ctrl+C/Ctrl+Break en schrijft ze in signalen.log (run 121).
cd /d C:\Users\javim\Desktop\Executive_assistant\projects\ventasol\ventasol\data-project\wecall-app
set NODE_OPTIONS=--require C:\tmp\wecall-compliance-<DDMM>\negeer-ctrl-c.cjs
echo gestart %DATE% %TIME% > C:\tmp\wecall-compliance-<DDMM>\run-<versie>.log
start "" /b /wait cmd /c "npx tsx --tsconfig scripts/tsconfig.json scripts/corpus-compliance-run.ts --van <VAN> --tot <TOT> --run --score --max-eur <M> < NUL >> C:\tmp\wecall-compliance-<DDMM>\run-<versie>.log 2>&1"
echo klaar %DATE% %TIME% (exit %ERRORLEVEL%) >> C:\tmp\wecall-compliance-<DDMM>\run-<versie>.log
```

Kopieer `negeer-ctrl-c.cjs` uit `C:\tmp\wecall-compliance-2110\` naar de nieuwe map en pas daarin het pad van `signalen.log` aan.

**Taakplanner-taak** (eenmalig registreren, geen trigger; starten pas na de go):

```powershell
$act = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument '-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -Command "cmd /c ''C:\tmp\wecall-compliance-<DDMM>\run-<versie>.cmd < NUL''"'
$set = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Hours 6) -MultipleInstances IgnoreNew
$prin = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Limited
Register-ScheduledTask -TaskName 'Wecall-Compliance-<N>' -Action $act -Settings $set -Principal $prin -Force
```

**RUNS.md-blok** direct onder de inleiding van `## Nu actief` (boven het eerste `### `-blok):

```
### <N>. COMPLIANCE-BATCH <versie> · SALEDAGEN <eerste> t/m <laatste> (LEV) · ⏳ KLAARGEZET <datum>, WACHT OP GO JAVI · werk-PC · raming EUR <r> (band <a>-<b>)

- **Wat:** <aantal> nooit beoordeelde salesgesprekken (<per dag>). Regelboek <versie>. Materiaalpoort houdt <x> tegen.
  <y> met een ouder oordeel bewust niet. Zonder misleiding-extractie.
- **Voorcontrole <datum> (EUR 0):** code-check OK · voormeting · DRY · preflight ALLE CONTROLES GROEN · geen open batch.
  <elke verklaarde afwijking in één zin>
- **Startbestand:** `C:\tmp\wecall-compliance-<DDMM>\run-<versie>.cmd`. **Log:** `...\run-<versie>.log`.
- **Valt het proces weg na een BATCH-ID:** niet opnieuw starten, hervatten met `--hervat-ronde1` (zie run 103).
- **⚠️ Onbetrouwbaar zolang dit loopt:** compliance-dekking en -scores van <eerste> t/m <laatste>, en de
  weekgemiddelden per adviseur en leverancier; de oordelen komen pas na ronde 4 in `compliance.ai_evaluation`.
- **Meet zelf:** `scripts/_check-batches.ts` en `app.ai_run` (phase, progress).
```

## Stap 7: go-verzoek aan Javi

Kort en volledig. Volgorde:
1. **Wat:** aantal, saledagen met aantal per dag, regelboek, batch.
2. **Wat niet meegaat en waarom:** poort (aantal en belangrijkste reden), ouder oordeel, misleiding,
   tweede sales (§3b), oude achterstand (§6).
3. **Gecontroleerd:** in één regel per controle, met de uitkomst. Noem elke verklaarde afwijking.
4. **Kosten:** tabel met raming, verwacht, `--max-eur`, doorlooptijd (35 tot 50 minuten).
5. Sluit af met: *"Geef je een go voor de compliance-run, max EUR <M>?"*

## Stap 8: na de go starten en bewaken

1. Status in het RUNS.md-blok: `GESTART <datum tijd> · go Javi <datum> ("<zijn woorden>", max EUR <M>)`.
2. **Starten via de Taakplanner** (PowerShell): `Start-ScheduledTask -TaskName 'Wecall-Compliance-<N>'`.
   **Niet via WMI** (`Win32_Process.Create`): zo'n run zit in de job van de wmiprvse-host en sterft mee als die host stopt.
   Run 121 viel daardoor drie keer om binnen 1 tot 3 minuten (`^C` in het log of stil, `signalen.log` leeg), vóór het indienen.
   De Taakplanner-start overleefde de hele run (126 min). Na afloop: `Unregister-ScheduledTask -TaskName 'Wecall-Compliance-<N>' -Confirm:$false`.
   Weigert de classifier dit, geef Javi dan precies deze commando's om zelf te draaien.
   Ligt de go van een vorige dag: eerst opnieuw de DRY. Op 22-10 stopte `--tot` van gisteren op de bewaker (een record kreeg
   een nieuwe sale) en schoof het venster een dag op, met een hoger bedrag en dus een nieuwe go.
3. **Bewaken** met Monitor (max 30 min, daarna opnieuw instellen):
   `tail -n +1 -F <log> | grep -a -E --line-buffered "BATCH-ID|✗|GEWEIGERD|faalde|[Ee]rror|\^C|^klaar |✓ klaar|gescoord|batch-runner starten"`
   Filter niet los op "klaar": de pollregels bevatten "N klaar".
   Bij het opnieuw instellen eerst het log nalopen (`grep -a -E "BATCH-ID|gescoord|^klaar" <log>`): wat in het
   gat tussen twee monitors verscheen, meldt de nieuwe niet (19-10: ronde 4 en "klaar" vielen in dat gat).
4. **Elk BATCH-ID meteen in RUNS.md** (ronde 1 neutraal, 2 aanklager, 3 rechter, 4 synthese), met het
   ai_run-id (staat in voormeting §2 of `app.ai_run`).
   "Batch ingestuurd, wachten op Anthropic" in het log is nog niet betaald, alleen een BATCH-ID-regel wel.
5. Fout, `^C` of `GEWEIGERD`: niet opnieuw starten. Eerst `_check-batches.ts`, dan melden.

## Stap 9: klaar en nameten

1. Log eindigt op `klaar ... (exit 0)`. Dan vanuit de app-map:
   `npx tsx --tsconfig scripts/tsconfig.json scripts/_q-compliance-nameting.ts <ai_run_id>`
   Moet geven: alle records in `ai_evaluation` op het huidige regelboek, criteriumscores = n x 32,
   geen lege adviseurs. Elke `[STUK]` of `[LET OP]` uitzoeken en melden.
2. **RUNS.md-blok bijwerken** naar de vorm van run 110: kop `✅ ... KLAAR <datum tijd>, <n>/<n>, werkelijk
   EUR <x> (raming <r>)`, en een regel **Uitkomst** met exit, ai_run-id, EUR per gesprek, doorlooptijd,
   verdeling per gespreksdag, leveranciers, gespreksoordeel AI en ernstige fouten (met het percentage
   van de vorige run ernaast). Vermeld: alles nog AI-oordeel, niet afgetekend.
3. Melden aan Javi: in vijf regels de uitkomst en wat er nu betrouwbaar is.

## Wat deze skill NIET doet

- Geen klantanalyse. Dat is een eigen run met een eigen go.
- Geen herscore, geen misleiding-extractie en geen oude achterstand, tenzij Javi daar los om vraagt.
- Geen toewijzing aan beoordelaars (Kayra en Talar). Dat is een aparte stap.
- Niet committen of pushen. De `_q-`-kopieën in `wecall-app/scripts/` blijven untracked, zoals alle `_`-scripts.

## Herkomst

Opgebouwd op 19-10-2026 uit run 117 en de vorige runs 95, 103 en 110. Lessen die erin zitten:
- 19-10: preflight telde 489 en het script 470. De 19 waren geen sales (§4 legt dat nu vanzelf uit).
- 19-10: met een venster van 21 dagen vielen 12 nooit beoordeelde nakomers van 23 t/m 25-09 buiten de
  run. Daarom is het standaardvenster 35 dagen.
- 19-10: 34 tweede sales op een record met een oud oordeel in 35 dagen, nooit gescoord (§3b).
- 08-10 (run 103): Ctrl+C van buitenaf brak de eerste poging af. Daarom `start /b` via WMI.
- 30-09: de geboekte kosten tot 28-09 lagen 1,5x te hoog. Ramingen vanaf oktober zijn betrouwbaar.
- 21/22-10 (run 121): drie WMI-starts stierven mee met de wmiprvse-host; vanaf nu de Taakplanner. Een brug die achterloopt
  (gesprekken van gisteren nog niet overgezet) laat de DRY te laag tellen: eerst `--run` zonder `--score`, dan opnieuw tellen.
- 27-10 (run 126): de bewaker kijkt naar de LAATSTE sale-leg per record. Een record dat in het venster al beoordeeld is en na
  `--tot` een nieuwe sale kreeg, laat de DRY stoppen. Staat er vóór de eerste te scoren dag 0 open (§3 en §6 poort-ja), zet dan
  `--van` op die dag: zelfde aantal, geen stop. Maandag zelf is 's ochtends nog in transcriptie: `--tot` = de vrijdag ervoor.
- 27-10: §5 telt ook wervingslegs NA de sale. De keten neemt werving alleen mee tussen eerste sale min 30 dagen en laatste sale
  (`trajectCte`), dus zo'n leg is een vals signaal. Altijd de datum van de ontbrekende leg naast die van de sale leggen.
- 27-10: de classifier weigerde ook `Register-ScheduledTask` (Unauthorized Persistence). Geef Javi dan registratie en start in
  één PowerShell-blok, te plakken in een eigen venster na zijn go (de `!` in Antigravity werkt niet).
- 29-10 (run 127): §5 groepeert op de saledag van het record, niet op de datum van de ontbrekende leg; leg ze per record naast
  elkaar. `--tot` gisteren gaf 4 echte nakomers (werving van dezelfde dag nog in transcriptie), `--tot` een dag terug liet de
  bewaker stoppen op 5 records met een tweede voicelog de dag erna. Uitweg: `--records` met precies de doelrecords van het
  venster (de query van `selectRecords()`), gecontroleerd met een DRY-toets via het startbestand zelf (zonder `--run --score`).
  De preflight telt die grensrecords niet (laatste gespreksdatum valt buiten zijn venster); de nameting zet ze op de dag van
  de tweede leg. Registreren van de Taakplanner-taak werkte deze keer wel. Doorlooptijd 27 min voor 201 gesprekken.
