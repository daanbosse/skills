---
name: start-dashboard
description: Start een werksessie aan de wecall-app (het grote LEV/Ventasol dashboard in projects/ventasol/ventasol/data-project/wecall-app/). Trigger deze skill wanneer Javi zegt "start sessie dashboard", "ga werken aan het dashboard", "ga aan de wecall-app", "ga aan het lev/ventasol dashboard", "start dashboard sessie", "start dev voor wecall" of vergelijkbare openingszinnen voor een werksessie aan dit project. Deze skill haalt git-updates op, leest de huidige projectstaat, geeft een korte briefing, en kan op verzoek de lokale dev-omgeving (SSH-tunnel + npm run dev) starten — zonder onnodig context te vervuilen.
---

# Start Dashboard-sessie

Doel: Javi binnen 1-2 minuten klaarstomen om effectief verder te werken aan de wecall-app, met **alle relevante context** ingeladen en **geen overbodige tokens** verbrand.

## Het werkpad

Het project woont in `projects/ventasol/ventasol/data-project/wecall-app/`. Dat is onderdeel van de losse `ventasol`-repo die Javi deelt met Daan. Pull dus altijd eerst — Daan committeert ook regelmatig.

**Werkomgeving = werk-PC, niet EliteDesk.** Sinds 2026-05-27 draait Postgres alleen op localhost van de EliteDesk-productieserver. Vanaf de werk-PC werkt lokale dev via een SSH-tunnel (zie sectie "Dev-omgeving"). De EliteDesk is puur productieserver — raak die alleen aan voor deploys of productie-debug.

## Stappen (in deze volgorde, parallel waar mogelijk)

### Stap 1 — Git updates ophalen (parallel)
Doe deze twee commando's in één bericht (parallel):

```bash
git -C projects/ventasol/ventasol pull origin main
git -C . status
```

Als de pull merge-conflicten geeft of onverwacht veel veranderingen toont, **stop en meld het** — niet zelf oplossen, eerst aan Javi laten zien.

### Stap 2 — Diff sinds laatste sessie + huidige staat (parallel)
Lees in één bericht parallel:

1. `projects/ventasol/ventasol/data-project/wecall-app/PROJECT-STATE.md` — volledig
2. `git -C projects/ventasol/ventasol log --oneline ${LAST_COMMIT}..HEAD` waarbij `${LAST_COMMIT}` de hash is uit PROJECT-STATE.md sectie "Laatste sessie-marker"
3. `git -C projects/ventasol/ventasol status` — voor uncommitted werk

Als `${LAST_COMMIT}` niet bekend is (eerste run / corrupt bestand), gebruik `git log --oneline -10` als fallback.

### Stap 3 — Optionele extra context (alleen als relevant)
- Als er in stap 2 nieuwe commits zijn op bestanden die direct relevant kunnen zijn voor de focus uit PROJECT-STATE: kort `git -C projects/ventasol/ventasol show --stat ${HASH}` van de relevante commit
- Als PROJECT-STATE bekende bugs vermeldt waarvan de focus naartoe lijkt te gaan: lees het betreffende bestand
- Als de focus rondom een specifieke API draait (HubSpot/Google Ads/Sollit/Steam): scan kort de relevante API-doc-map in `data-project/`

**Belangrijk:** Lees niet preventief allerlei bestanden. Wacht tot Javi heeft aangegeven waar hij aan wil werken, en lees pas dan gericht in.

### Stap 4 — Briefing aan Javi
Geef een **korte** samenvatting (max 15 regels) met:

| Sectie | Inhoud |
|---|---|
| **Status sinds vorige sessie** | Aantal nieuwe commits + 1-regel beschrijving per stuk |
| **Working tree** | Clean / wijzigingen openstaand (welke files) |
| **Vorige focus** | Wat stond als volgende stap in PROJECT-STATE |
| **Openstaande beslispunten** | Max 3 belangrijkste vragen/blockers |
| **Voorstel voor vandaag** | 2-4 opties waar Javi uit kan kiezen, op basis van vorige focus + openstaande punten |

Sluit af met: _"Waar wil je vandaag op inzetten? Zal ik de dev-omgeving alvast starten?"_

### Stap 5 — Dev-omgeving starten (alleen op verzoek)

Als Javi bevestigt dat hij wil werken aan de wecall-app, draai het start-script:

```powershell
.\projects\ventasol\scripts\start-dev.ps1
```

Dit doet drie dingen achter de schermen:
1. Opent SSH-tunnel naar de EliteDesk (`ssh -N elitedesk`) — port-forward `localhost:5432` → EliteDesk's Postgres
2. Start Next.js dev-server in achtergrond (`npm run dev`)
3. Wacht tot `localhost:3000` reageert

Bevestig in 1 zin dat alles draait + zeg dat Javi de browser kan openen op `http://localhost:3000`. Logs in `%TEMP%\wecall-dev\dev.log` voor debug.

**Voorwaarden** (al ingericht 2026-05-27, niet opnieuw doen):
- EliteDesk staat 24/7 aan
- SSH-keypair in `~/.ssh/wecall-elitedesk`
- `Host elitedesk` in `~/.ssh/config` met `LocalForward 5432`
- `data-project/.env` op werk-PC wijst naar `localhost:5432` en bevat `CSRF_SECRET` + `PASSWORD_ENCRYPTION_KEY` (productie-identiek)

## Common issues (en hoe ze op te lossen)

**`CSRF_SECRET niet gezet in env` of `PASSWORD_ENCRYPTION_KEY ontbreekt`**
Werk-PC `.env` mist productie-keys. Kopieer ze van EliteDesk zonder waarden in chat-context te zetten:
```powershell
$envPath = "c:\Users\javim\Desktop\Executive_assistant\projects\ventasol\ventasol\data-project\.env"
$remote = ssh elitedesk 'type C:\wecall\ventasol\data-project\.env'
foreach ($key in @('CSRF_SECRET','PASSWORD_ENCRYPTION_KEY','PASSWORD_ENCRYPTION_KEY_VERSION')) {
  if ((Get-Content $envPath -Raw) -notmatch "(?m)^$key=") {
    $line = $remote | Where-Object { $_ -match "^$key=" } | Select-Object -First 1
    if ($line) { Add-Content -Path $envPath -Value "`n$line" }
  }
}
```
Daarna dev-server herstarten (stop + start).

**`adapterFn is not a function` of andere Next.js runtime-errors**
Dependency-mismatch tussen werk-PC en productie. Sync:
```powershell
cd projects\ventasol\ventasol\data-project\wecall-app
npm ci
```
Daarna dev-server herstarten.

**`localhost:5432` niet bereikbaar / DB-connection-errors**
SSH-tunnel staat niet. Check met `Test-NetConnection localhost -Port 5432 -InformationLevel Quiet`. Zo niet: `ssh -N elitedesk` opnieuw starten, of `start-dev.ps1` opnieuw runnen.

**Dev-server start niet (port 3000 al in gebruik door zombie-proces)**
```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```
Daarna `start-dev.ps1` opnieuw.

## Drie scripts in `projects/ventasol/scripts/`

| Script | Wanneer |
|---|---|
| `start-dev.ps1` | Begin werkdag — tunnel + dev-server |
| `stop-dev.ps1` | Einde werkdag — netjes afsluiten |
| `deploy.ps1` | Wijzigingen live op EliteDesk (push + ssh-deploy). Vereist nog deploy-key bij repo voor volautomatisch zonder PAT — zie memory `wecall-dev-workflow-ssh-tunnel` |

## Relevante memories om bij twijfel te raadplegen

- `wecall-livegang-elitedesk-state-2026-05-27` — wat staat er op de EliteDesk productie-server
- `wecall-dev-workflow-ssh-tunnel` — de hele SSH-tunnel + scripts-setup, inclusief openstaand punt over deploy-key
- `wecall-codereview-auth-2026-05-27` — auth-stack code-review findings + welke fixes gepushed
- `wecall-filter-bug-privacy-mode` — privacy-mode CSS-bug (gefixt 2026-05-27)
- `feedback-werkomgeving-werk-pc` — werkomgeving is altijd werk-PC, niet EliteDesk
- `feedback-wecall-data-veiligheid-top-prio` — security is top prio, geen shortcuts

## Wat NIET doen

- **Niet automatisch werk starten.** Wacht tot Javi heeft gekozen waar hij aan wil werken.
- **Niet automatisch de dev-omgeving starten** vóór de briefing — alleen na expliciete bevestiging (stap 5).
- **Niet preventief 10+ bestanden inlezen.** PROJECT-STATE.md is de single source of truth. Andere files alleen als gericht nodig.
- **Niet PROJECT-STATE.md updaten.** Dat is taak van `einde-sessie-dashboard` skill, niet de start-skill.
- **Niet alle docs uit `data-project/` herhalen.** Die context staat al in `MEMORY.md` en CLAUDE.md.
- **Niet automatisch committen of pushen.** Memory-regel `feedback-commit-only-on-request`.
- **Niet rechtstreeks op EliteDesk werken voor code-edits.** Werkomgeving = werk-PC (memory `feedback-werkomgeving-werk-pc`). EliteDesk alleen via deploy.

## Edge cases

**PROJECT-STATE.md ontbreekt of corrupt**
Meld het aan Javi. Vraag of de baseline opnieuw gegenereerd moet worden, of dat hij alleen een snelle git-status wil zonder volle inlees.

**Merge-conflicten bij `git pull`**
Stop direct. Meld de conflicten aan Javi met de bestandsnamen. Niet zelf resolven.

**Daan heeft veel gepusht (>10 commits)**
Lees `git log --stat` voor een beeld van wat veranderd is. Vermeld in de briefing dat er substantieel werk van Daan bij is gekomen en welke bestanden geraakt zijn.

**EliteDesk onbereikbaar** (`ssh elitedesk` faalt)
- Eerst pingen: `Test-NetConnection 192.168.50.120 -Port 22 -InformationLevel Quiet`
- Als unreachable: EliteDesk staat uit of off-LAN. Vraag Javi of de machine aan staat.
- Zonder EliteDesk: geen DB, dus geen lokale dev mogelijk. Beperk je tot code lezen + statisch werk.

**Dev-server log bevat errors**
Optioneel: scan `%TEMP%\wecall-dev\dev.log` op recente ERROR-lijnen. Vermeld het kort in de briefing.

## Context-budget

Doel: hele skill onder 10k tokens aan ingelezen content. Als je merkt dat je daarover heen gaat, stop met inlezen en lever de briefing op basis van wat je hebt. Beter een snelle briefing met gerichte vervolgvragen dan een dichtgeslibte context.
