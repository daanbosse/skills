---
name: start-dashboard
description: Start een werksessie aan de wecall-app (het LEV/Ventasol dashboard, CRM en AI-platform in projects/ventasol/ventasol/data-project/wecall-app/). Trigger bij "start sessie dashboard", "ga werken aan het dashboard", "ga aan de wecall-app", "start dashboard sessie", "start dev voor wecall" of vergelijkbare openingszinnen. Laadt eerst de projectkaart (hoe alles in elkaar zit), haalt git-updates op, start de lokale dev-omgeving, meet wat er aan runs loopt en geeft een korte briefing met een werkende localhost-link, zonder de context vol te laden.
---

# Start Dashboard-sessie

Doel: Javi binnen 1 à 2 minuten laten doorwerken aan de wecall-app, met een chat die **snapt hoe het
project in elkaar zit**, weet **wat er sinds de vorige sessie veranderd is**, weet **welke runs de
cijfers van vandaag onbetrouwbaar maken**, en een **werkende localhost** heeft. Budget: onder 12k
tokens aan ingelezen content.

## Vaste paden

Alle paden relatief aan `C:\Users\javim\Desktop\Executive_assistant`.

| Wat | Pad |
|---|---|
| Repo (gedeeld met Daan, remote `daanbosse/ventasol`, branch `main`) | `projects/ventasol/ventasol` |
| App | `projects/ventasol/ventasol/data-project/wecall-app` |
| Projectkaart (hoort bij deze skill) | `skills/start-dashboard/WECALL-KAART.md` |
| Sessiemarker | `.../wecall-app/PROJECT-STATE.md`, rij "Laatste sessie-datum" |
| Lopende runs | `.../data-project/RUNS.md` + script `wecall-app/scripts/_check-lopende-runs.ts` |
| Sessieverslagen | `.../data-project/sessions/` |
| Dev starten / stoppen | `projects/ventasol/scripts/start-dev.ps1` / `stop-dev.ps1` (identieke kopie in de repo onder `scripts/`; beide werken) |

⚠️ `projects/ventasol` zelf is **geen** repo. Een git-commando daar valt terug op de
Executive-assistant-repo. Gebruik altijd `git -C projects/ventasol/ventasol`.

⚠️ **Nooit volledig lezen:** `PROJECT-STATE.md` (~118k tokens) en `RUNS.md` (~90k tokens, bijna
alles is archief). Van RUNS.md is alleen het stuk vanaf `## Nu actief` tot `## Losse eindjes`
relevant (sinds de opschoning van 17-09 ~150 regels). Het script in stap 2 blijft de waarheid;
de tekst in RUNS.md is de stand van het moment van schrijven.

## Stap 1: alles tegelijk starten (één bericht, parallel)

1. **Read** `skills/start-dashboard/WECALL-KAART.md`, volledig (~5k tokens). Dit is de plattegrond:
   LEV tegenover Ventasol, wie wat mag zien, bronnen, machines, codekaart, definities en valkuilen.
2. **Git pull:** `git -C projects/ventasol/ventasol pull origin main`.
   Merge-conflict of een geweigerde pull (lokale wijzigingen) → **stop en meld** met de
   bestandsnamen. Niet zelf oplossen, niet stashen.
3. **Dev starten** (altijd, niet wachten op bevestiging), PowerShell, timeout 300000:
   `.\projects\ventasol\scripts\start-dev.ps1`
   Het script opent de tunnel naar core (poort uit `DATABASE_URL`), start `npm run dev` op de
   achtergrond, wacht op `localhost:3000` en toetst de database (timeline 2 = core). Draaien
   tunnel en server al, dan laat het ze staan.
4. **Grep** in `.../wecall-app/PROJECT-STATE.md` op `^\| \*\*Laatste sessie-datum` (output_mode
   `content`): dat geeft precies de laatste sessiemarker (datum, onderwerp, wat af is, wat openstaat,
   waar het verslag staat). Nu regel 12; zoek erop in plaats van op het regelnummer te vertrouwen.
5. **Nieuwste sessieverslagen:**
   `Get-ChildItem projects/ventasol/ventasol/data-project/sessions | Sort-Object LastWriteTime -Descending | Select-Object -First 4 Name, LastWriteTime`

## Stap 2: meten wat er veranderd is en wat er loopt (na stap 1, parallel)

1. **Commits sinds de vorige sessie.** Neem de datum uit de marker (`**YYYY-MM-DD`; nieuwere
   markers noemen ook de laatste commit-hash, maar de datum werkt altijd) en draai:
   `git -C projects/ventasol/ventasol log main --since="<datum> 00:00" --date=format:"%d-%m %H:%M" --format="%h %ad %an: %s"`
   Commits van Daan apart benoemen. Meer dan 10 commits: `--stat` erbij en de geraakte gebieden
   samenvatten.
2. **Working tree, alleen gevolgde bestanden:**
   `git -C projects/ventasol/ventasol status --short --untracked-files=no`
   Honderden untracked `_`-bestanden zijn normaal (klantdata en scripts van andere chats): niet
   tonen, niet opruimen.
3. **Lopende runs** (read-only, €0, ~10 s, heeft de tunnel uit stap 1.3 nodig), vanuit de app-map:
   `npx tsx --tsconfig scripts/tsconfig.json scripts/_check-lopende-runs.ts`
   Het script kijkt in de transcriptiewachtrij, `app.ai_run`, bumptabellen, Steam-history, de
   compliance-brug en de processen op core en de AI-bak, en kruist dat tegen RUNS.md.
   - Lees alleen de **signalen** onderaan; de proceslijsten zijn ruis.
   - 🔴 in de uitvoer = iets loopt maar staat niet in RUNS.md → noemen in de briefing.
   - Staat er een go-commando bij (bijvoorbeeld `corpus-compliance-run.ts ... --run --score`):
     dat is een **betaalde run**. Noem aantal en bedrag, **voer het nooit uit** zonder expliciete go.
   - Faalt het script omdat de database niet bereikbaar is: meld "runs niet gemeten" in de
     briefing en ga door.
4. **Wat er onbetrouwbaar is:** Grep in RUNS.md op `^## Nu actief|^## Losse eindjes` voor de
   regelnummers en lees alleen dat stuk. Neem per actieve run het veld
   "Onbetrouwbaar zolang dit loopt" mee in de briefing. Verwijst een signaal of de marker naar een
   oudere run: zoek die gericht op nummer (Grep, `-A 15`).

## Stap 3: extra context alleen als het gericht nodig is

Lees niet preventief. Wel toegestaan vóór de briefing:
- Noemt de marker een overdracht of sessieverslag als startpunt voor een lopend spoor: lees daarvan
  alleen de eerste ~40 regels.
- Een nieuwe commit raakt duidelijk het spoor uit de marker: `git show --stat <hash>`.

Al het andere pas nadat Javi heeft gekozen waar hij aan werkt. Dan eerst de bron die de kaart
(sectie 6) voor dat onderwerp aanwijst.

## Stap 4: briefing (max 15 regels, Nederlands, geen emojis)

| Blok | Inhoud |
|---|---|
| **Dev** | Eén regel: `Dev draait → http://localhost:3000` of wat er misging |
| **Runs en betrouwbaarheid** | Bovenaan. Per signaal één regel: wat loopt of stilstaat en welk cijfer daardoor nu niet klopt. Wachtende betaalde runs met bedrag. Niets aan de hand: één regel "geen runs die cijfers raken" |
| **Sinds vorige sessie** | Aantal commits (Javi / Daan), per stuk één korte regel, of gebundeld per gebied als het er veel zijn |
| **Working tree** | Schoon, of welke gevolgde bestanden gewijzigd zijn |
| **Vorige sessie** | Onderwerp + wat er openstaat volgens de marker |
| **Open beslispunten** | Max 3, alleen wat Javi moet beslissen (uit de marker of de run-check) |
| **Voorstel voor vandaag** | 2 tot 4 concrete opties, afgeleid van het bovenstaande |

Sluit af met: *"Waar wil je vandaag op inzetten?"*

## Wat NIET doen

- **Geen werk starten** op een spoor voordat Javi kiest (dev starten en runs meten wel).
- **Geen betaalde runs**, ook niet als het script het commando kant-en-klaar geeft.
- **PROJECT-STATE.md, RUNS.md en de kaart niet bijwerken** tijdens de start. Dat doet
  `/einde-sessie-dashboard`.
- **Niet committen, pushen, stashen of resetten.**
- **Niets op een server doen.** Core alleen voor productie-debug (read-only), nooit naar de
  EliteDesk schrijven. Bouwen gebeurt op de werk-PC, live zetten gaat via push naar `main`.
- **Geen `npm run build`** terwijl dev draait: dat legt dev plat.

## Problemen bij het starten

**`CSRF_SECRET niet gezet` of `PASSWORD_ENCRYPTION_KEY ontbreekt`**
De `.env` op de werk-PC mist productiesleutels. Kopieer ze van core zonder waarden in de chat te zetten:
```powershell
$envPath = "c:\Users\javim\Desktop\Executive_assistant\projects\ventasol\ventasol\data-project\.env"
$remote = ssh core 'type C:\wecall\ventasol\data-project\.env'
foreach ($key in @('CSRF_SECRET','PASSWORD_ENCRYPTION_KEY','PASSWORD_ENCRYPTION_KEY_VERSION')) {
  if ((Get-Content $envPath -Raw) -notmatch "(?m)^$key=") {
    $line = $remote | Where-Object { $_ -match "^$key=" } | Select-Object -First 1
    if ($line) { Add-Content -Path $envPath -Value "`n$line" }
  }
}
```
Daarna `stop-dev.ps1` en `start-dev.ps1`.

**`adapterFn is not a function` of andere Next.js-runtimefouten na een pull**
Dependencies lopen achter: `npm ci` in de app-map (eerst `stop-dev.ps1`), daarna opnieuw starten.

**Database niet bereikbaar, `Connection terminated unexpectedly`, timeline 1 of `DB_VERKEERDE_BAK`**
Tunnel ligt eruit of wijst nog naar de EliteDesk. `stop-dev.ps1`, dan `start-dev.ps1`.

**Poort 3000 bezet door een zombieproces**
```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```
Let op: een andere chat kan dev bewust draaien hebben. Alleen doen als de server niet reageert.

**Core onbereikbaar (`ssh core` faalt)**
`Test-NetConnection 192.168.50.162 -Port 22 -InformationLevel Quiet`. Faalt dat: core staat uit of
Javi zit niet op het kantoornetwerk. Vraag het. Zonder core geen database en geen dev; beperk je tot
code lezen. **Niet uitwijken naar de EliteDesk** (geen database; promoveren is mensenwerk).

**Dev-log met fouten**
`Get-Content "$env:TEMP\wecall-dev\dev.log" -Tail 40`, kort in de briefing noemen.

## Randgevallen

- **Marker onleesbaar of zonder datum:** gebruik `git log main --oneline -15` en de nieuwste
  sessieverslagen, en meld dat de marker niet te lezen was.
- **Pull haalt veel binnen (>10 commits of wijzigingen in `package-lock.json`):** noem het, en
  herstart dev na `npm ci` als er dependency-wijzigingen bij zitten.
- **Branch is niet `main`:** meld het (memory: blijf op main), niet zelf wisselen.

## De kaart actueel houden

`WECALL-KAART.md` is de plattegrond, geen logboek. Bijwerken als de **structuur** verandert: een
nieuwe machine, bron, grote module, rol van een persoon, definitie of harde regel. Niet voor
losse features of sessienieuws (dat hoort in PROJECT-STATE en `sessions/`). Datum bovenaan
aanpassen. Merkt een sessie dat de kaart iets fout zegt, meld dat dan aan Javi en stel de correctie
voor bij `/einde-sessie-dashboard`.
