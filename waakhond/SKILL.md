---
name: waakhond
description: Handel een melding van de waakhond of de wecall-e-review af. Trigger deze skill als Daan zegt "ik had een melding van de waakhond", "de waakhond heeft iets gestuurd", "kijk eens wat de waakhond gedaan heeft", "wat deed de review vannacht", "er ligt iets te wachten van de nachtrun", "/waakhond", of iets anders wijst op de automatische ochtendrun van de pijplijn-check of de wecall-e-review. De skill zoekt de juiste run op, vat samen wat er gebeurd is, en maakt af wat op Daan wachtte.
---

# Waakhond-melding afhandelen

Daan krijgt mails van twee automatische sessies. Als hij er iets over zegt, wil hij meestal één van
twee dingen: **"vertel me in gewone taal wat er was"** of **"maak het even af"**. Zoek het op, vat
samen, en vraag pas door als de logboeken het antwoord niet geven.

## De twee ketens

| | Waakhond | wecall-e-review |
|---|---|---|
| Wanneer | 08:00, alleen als de pijplijn-check ALARM of LET OP schrijft | elke ochtend 06:00 |
| Waar gestart | core duwt het rapport via ssh naar de desktop → taak `Wecall-Waakhond` | taak `Wecall-E-Review` op de desktop |
| Playbook | `waakhond/WAAKHOND.md` | `waakhond/WECALL-E-REVIEW.md` |
| Logboek | `waakhond/logs/<datum>-<tijd>.md` | `waakhond/logs/ai-review-<datum>.md` |
| Poort vóór ingrijpen/pushen | `waakhond/actie-poort.ps1` | `waakhond/publiceer-poort.ps1` (Fable 5.1) |

Beide mailen via `waakhond/mail.ps1` naar dezelfde n8n-webhook. Het venster sluit zichzelf na afloop.

## Stap 1 — vind de run (30 seconden, geen giswerk)

```
Get-Content waakhond\logs\sessies.log -Tail 10     # datum, soort, sessie-id, welk rapport
Get-Content waakhond\logs\mail.log -Tail 5         # welke mail Daan kreeg
```

Pak het logboek dat bij die run hoort. **Lees dat eerst helemaal** — daar staat wat er gevonden is,
wat er gerepareerd is, wat bewust is blijven liggen en welke beslissingen bij Daan liggen.

Alleen als het logboek een vraag openlaat (waaróm koos hij dit, wat zag hij precies): de chat zelf
terughalen met `claude --resume <sessie-id>` vanuit deze repo. Doe dat niet standaard, het is veel
context voor weinig.

## Stap 2 — vat het samen zoals Daan het wil

Hij leest het technische rapport niet. Zin 1 is de conclusie: was er iets stuk, is het weg, moet hij
iets doen. Daarna per bevinding één regel in gewone taal. Noem een taaknaam of foutcode alleen met
de betekenis erbij. Maximaal ~10 regels tenzij er echt meer beslispunten liggen.

Ligt er niets open, zeg dat dan gewoon: "vals alarm, dit was het, niks te doen."

## Stap 3 — maak af wat op hem wachtte

Openstaand werk staat altijd als **klaarliggende commit in een worktree** onder `C:\tmp\wt-*`
(bijvoorbeeld `wt-ai-review`, `wt-hermes`). Het logboek noemt pad, branch en commit.

- **Zegt Daan "doe maar" / "fix het":** loop het publiceer-pad van §5b in `WECALL-E-REVIEW.md`. Dus:
  eval-set groen (`npx tsx --tsconfig scripts/tsconfig.json scripts/run-ai-evals.ts` in
  `projects/ventasol/data-project/wecall-app`), dan `publiceer-poort.ps1` met een **eerlijke**
  `-EvalUitslag` en `-Toelichting`, en alleen bij exitcode 0 pushen via de worktree
  (`git push origin HEAD:main`). Daarna controleren dat core hem echt heeft:
  `ssh core "powershell -NoProfile -Command \"git -C C:\wecall\ventasol log -1 --oneline\""`.
- **Zegt de poort NO-GO:** niet ompraten, niet opnieuw draaien met een mooiere toelichting. Repareer
  wat hij aanwijst, of leg het terug bij Daan met zijn oordeel erbij.
- **Ruim op** als het gepusht is: `git worktree remove C:\tmp\wt-...`.

## Wat nooit mag, ook niet als Daan haast heeft

- Een wijziging pushen die **iemands toegang verruimt** (nieuwe tool die data breder openzet, een
  versoepelde scrub, een overgeslagen rechtencontrole). Dat blijft een beslissing van Daan, ook met
  groene evals. wecall-e is bewust fail-closed: "hij gaf geen antwoord" is vaak de grens die werkt.
- Pushen zonder rood-naar-groen bewijs, of buiten `src/lib/ai/**` (review) respectievelijk
  `cron-pijplijn-check.*` en `waakhond/**` (waakhond-onderhoud).
- `git add -A` of committen in de gedeelde Desktop-checkout. Altijd een aparte worktree vanaf
  `origin/main`, alleen je eigen bestanden stagen.
- Zware klussen op core tussen 08:00 en 21:30 (belvloer).

## Handige controles

```
# draaien de twee taken nog?
Get-ScheduledTask -TaskName Wecall-Waakhond, Wecall-E-Review | Select TaskName, State

# heeft core vanochtend iets doorgestuurd?
ssh core "cmd /c type C:\wecall\scripts\waakhond-trigger.log"

# wat zegt het verse rapport op core?
ssh core "powershell -NoProfile -Command \"Get-Content C:\wecall\ventasol\data-project\wecall-app\logs\pijplijn-status.txt\""

# vraagmateriaal van de review zelf opnieuw ophalen
cd projects\ventasol\data-project\wecall-app
npx tsx --tsconfig scripts/tsconfig.json scripts/ai-review-input.ts --dagen 2
```

Achtergrond en volledige regels: `waakhond/WAAKHOND.md` §6-7 en `waakhond/WECALL-E-REVIEW.md` §5b.
