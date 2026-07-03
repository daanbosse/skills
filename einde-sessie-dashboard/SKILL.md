---
name: einde-sessie-dashboard
description: Sluit een werksessie aan de wecall-app (LEV/Ventasol dashboard) af. Trigger deze skill wanneer Javi zegt "einde sessie dashboard", "sluit sessie", "rond af", "we stoppen voor vandaag" of vergelijkbare afsluitende zinnen na werk aan de wecall-app. Deze skill werkt PROJECT-STATE.md bij met wat veranderde, schrijft een sessie-log, en zorgt dat de volgende `/start-dashboard` direct weer up-to-date is.
---

# Einde Dashboard-sessie

Doel: De huidige sessie zo afsluiten dat een nieuwe Claude-sessie via `/start-dashboard` direct weet (a) wat er deze sessie veranderd is, (b) wat de nieuwe focus is, en (c) waar losse eindjes liggen. PROJECT-STATE.md blijft de **single source of truth** voor toekomstige sessies.

## Stappen

### Stap 1 — Inventariseer wat deze sessie gebeurd is
Doe parallel:

```bash
git -C projects/ventasol/ventasol log --oneline -20
git -C projects/ventasol/ventasol status
git -C projects/ventasol/ventasol diff --stat
```

Identificeer:
- Welke commits zijn deze sessie gemaakt? (commits met datum vandaag of na de "Laatste commit" uit PROJECT-STATE.md)
- Welke files zijn nog uncommitted? (Javi committeert vaak zelf — niet zelf committen tenzij gevraagd)
- Welke onderwerpen / API's / pagina's zijn aangeraakt?
- **Welke files uit `data-project/wecall-app/intelligence/change-impact.md` zijn aangeraakt?** (huidige top-6: `sales-category.ts`, `ventasol-buckets.ts`, `lev-cost-model.ts`, `ventasol-cost-model.ts`, `sollit-pipeline.ts`, `config-registry.ts`). Maak een lijstje — dat is input voor Stap 2B.

### Stap 2 — Bespreek de afsluiting met Javi
Voordat je PROJECT-STATE.md bijwerkt, bevestig met Javi:

1. **Wat was de focus van deze sessie?** (1-zin samenvatting)
2. **Wat is de volgende stap?** (Wat staat als eerste op de agenda voor volgende sessie)
3. **Zijn er nieuwe blockers / open vragen ontstaan?**
4. **Zijn er nieuwe bevindingen die in memory horen?** (geheugen-tip: alleen niet-afleidbare info — geen code-patronen, wel beslissingen/incidenten)
5. **Registry-impact (alleen als Stap 1 fragiele helpers vond):** Heeft de wijziging een definitie verschoven (raakt `business-rules.md`)? Nieuwe PII-bron (`privacy.md`)? Nieuwe metric (`metrics.md`)? Verandert beslisser (`ownership.md`)?

Houd dit gesprek kort. Geen vragenformulier — gewoon vragen wat onduidelijk is.

### Stap 2B — Werk intelligence-registry bij

Pad: `projects/ventasol/ventasol/data-project/wecall-app/intelligence/`

**Alleen uitvoeren als Stap 1 fragiele files heeft gevonden óf Stap 2 vraag 5 iets opleverde.** Bij geen rakeren: skip deze stap en meld kort dat de registry niet geraakt is.

**Voor elke aangeraakte file uit `change-impact.md`:**
- `last_reviewed` → vandaag (systeem-datum, niet verzinnen)
- `validation-status` → terug naar `unchecked` (tenzij Javi bevestigt dat er meteen revalidatie is uitgevoerd via een `validation-checks.md`-procedure — dan `checked` + initialen + uitkomst)
- Open vragen aanpassen (beantwoord → weghalen; nieuw opgekomen → toevoegen)

**Aanvullend updaten waar relevant** (afhankelijk van Stap 2 vraag 5):
- **`business-rules.md`** — bij definitie-verschuiving (bv. "halve sale" verfijnd, "netto" anders gedefinieerd). Overweeg status `disputed` → `unchecked`/`checked`.
- **`privacy.md`** — bij nieuwe PII-bron, nieuwe export-pad, of nieuw raw_response-veld.
- **`metrics.md`** — bij nieuwe metric of grote wijziging in bestaande metric-definitie. Voeg ook bijbehorende `validation-checks.md`-entry toe.
- **`metrics.md` afhankelijke metrics** — verlaag `validation-status` naar `unchecked` voor alle metrics die de aangeraakte helper als bron hebben (zie `change-impact.md` afhankelijke metrics-veld).
- **`ownership.md`** — alleen bij echte beslisser-verschuiving.
- **`dataflows.md`** — alleen bij wijziging in keten-structuur (nieuwe bron, nieuwe tussenstap). Niet voor inhoudelijke helper-wijzigingen.

**Wat NIET in deze stap:**
- Geen registry-update zonder Javi-bevestiging als de wijziging een grijs gebied is (twijfel → vraag eerst).
- Geen `checked`-status zetten zonder uitvoerbewijs.
- Geen SQL kopiëren naar metrics.md — verwijs naar helper-naam.
- Niet de hele registry herschrijven — gericht updaten.

Korte registry-update-notitie wordt opgenomen in de sessie-log (Stap 4) en in PROJECT-STATE.md (Stap 3) zodat de volgende sessie weet dat de registry bij is.

### Stap 3 — Werk PROJECT-STATE.md bij
Pad: `projects/ventasol/ventasol/data-project/wecall-app/PROJECT-STATE.md`

**Altijd updaten:**
- Sectie "Laatste sessie-marker":
  - `Laatste sessie-datum` → vandaag (gebruik systeem-datum, niet verzinnen)
  - `Laatste commit op moment van sluiten` → meest recente commit-hash + onderwerpregel
  - `Branch` → check
  - `Working tree status` → clean / wijzigingen + welke files
  - `Volgende stap (besloten)` → wat Javi in stap 2 noemde
- Sectie "Veranderlog op dit bestand": voeg regel toe met datum + 1-zin samenvatting wijziging

**Updaten als relevant:**
- "Huidige focus (TL;DR)" — als de sprintrichting verschoven is
- "Recent geleverd" — voeg nieuwe commits toe bovenaan, verwijder oudste regel als de tabel >7 rijen wordt
- "API-statussen" — als een API-status veranderde (bv. Google Ads approval binnen)
- "Open beslispunten" — toevoegen / verwijderen op basis van wat besloten of nieuw is
- "Bekende bugs / TODO's in code" — toevoegen / strepen
- "Operationele kennis" — alleen aanpassen als de infra zelf veranderde

**Niet aanraken tenzij echt veranderd:**
- "Architectuur-snapshot" (verandert zelden)
- "Belangrijke documenten" (verandert zelden)
- "DB-schema" (verandert alleen bij migrations)

### Stap 4 — Schrijf sessie-log
Pad: `projects/ventasol/ventasol/data-project/sessions/YYYY-MM-DD-onderwerp.md`

Gebruik vandaag-datum als prefix. Onderwerp = 2-4 woorden, kebab-case.

**Format:**
```markdown
# Sessie YYYY-MM-DD — Onderwerp

## Wat is gedaan
- Bullet per concrete actie / commit / beslissing

## Belangrijke beslissingen
- (Als van toepassing) Beslissingen die ook in decisions/log.md moeten

## Open punten
- Wat nog niet af is
- Vragen die nog beantwoord moeten worden

## Volgende sessie
- Concrete eerste stap

## Bestanden / commits
- Commits: hash + onderwerp
- Uncommitted: pad
```

Houd het kort en feitelijk. Geen reflectie of marketing-taal.

### Stap 5 — Voorstel memory-updates
Als er deze sessie iets is geleerd dat **niet uit code/git afleidbaar is** en in toekomstige sessies relevant is, stel voor om een memory-entry toe te voegen. Vraag Javi expliciet — niet zelf doen.

**Wel memory-waardig:**
- Beslissingen met "waarom" (bv. "Daan koos schema X omdat Y")
- Bevestigde business-logica van Javi/Enver/Ali
- API-eigenaardigheden die je elke keer opnieuw zou ontdekken
- Voorkeuren / werkstijl-feedback

**Niet memory-waardig:**
- Wat in PROJECT-STATE.md hoort (huidige staat)
- Wat in code/git zit (file-paden, function-namen, recente changes)
- Sessie-specifieke details (taken-in-progress)

### Stap 6 — Afsluiting
Korte samenvatting aan Javi:
- PROJECT-STATE.md bijgewerkt (1-regel wat veranderd is)
- Sessie-log geschreven (pad noemen)
- Eventuele memory-suggesties (als gevraagd)
- Eventuele uncommitted wijzigingen die Javi nog wil committen

## Wat NIET doen

- **Niet automatisch committen.** Javi commit zelf. Vermeld wel welke files uncommitted zijn.
- **Niet pushen.** Memory-regel: `feedback-commit-only-on-request`.
- **Geen reflectie-essays.** Sessie-logs zijn feitelijk, geen "wat hebben we geleerd".
- **PROJECT-STATE.md niet integraal herschrijven.** Update gericht, behoud structuur.
- **Niet alle datums opnieuw invullen.** Alleen wat werkelijk veranderde.
- **Geen memory-entries toevoegen zonder bevestiging van Javi.**

## Edge cases

**Niks veranderd deze sessie**
Update alleen `Laatste sessie-datum` in PROJECT-STATE.md (om te markeren dat er gekeken is), schrijf geen sessie-log, meld het kort aan Javi.

**Sessie eindigde halverwege complexe taak**
Schrijf in sessie-log een sectie "WIP - in progress" met de huidige staat + wat de volgende sessie als eerste moet doen. Zet "Volgende stap" in PROJECT-STATE op die concrete actie.

**Javi wil iets niet in PROJECT-STATE**
Respecteer dat. Niet alle sessies vereisen volledige update — minimaal de sessie-marker + nieuwe focus.

**Conflicterende memory-suggestie met bestaande**
Lees eerst de bestaande memory-entry (via `MEMORY.md`-pointer), check of die update-bar is in plaats van een nieuwe entry toevoegen.

## Context-budget

Heel deze skill blijft onder 5k tokens. PROJECT-STATE-update is een gerichte Edit, geen Read-+-rewrite. Sessie-log is een nieuw bestand, max 30 regels.
