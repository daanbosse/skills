# Wecall-kaart: hoe het project in elkaar zit

> Ingelezen door `/start-dashboard` bij elke start. Doel: een verse chat snapt in één keer wat
> de wecall-app is, voor wie, waar de data vandaan komt, waar alles staat en waar de valkuilen
> zitten. **Laatst gecontroleerd: 2026-09-17.** Details en actuele stand staan in de bronnen
> die onderaan genoemd worden; dit is de plattegrond, niet het archief.
> Klopt iets hier niet meer? Pas het aan (kort houden, max ~250 regels).

---

## 1. Wat het is

**De wecall-app** (live op `wecalldashboard.com`) is het interne dashboard, CRM en AI-platform van
**Wecall**, het callcenter en de salesorganisatie (120+ mensen, Leiden en Rijswijk) waaronder de
labels vallen. Gebouwd door **Javi en Daan** met Claude Code. Next.js 16 + React 19 + Drizzle +
PostgreSQL 18, volledig on-premise (geen cloud voor de data).

Twee bedrijven, twee werelden. Haal ze nooit door elkaar:

| | **LEV** (Landelijke Energie Vergelijker) | **Ventasol** (verduurzaming) |
|---|---|---|
| Verkoopt | Energiecontracten (gas en stroom) | Kozijnen, warmtepompen, thuisbatterijen, zonnepanelen, overig |
| Leveranciers / categorieën | Eneco, Greenchoice, ENGIE, Budget Thuis (+ Windzeker) | Kozijnen, Warmtepompen, Thuisbatterijen, Zonnepanelen, Overig |
| Leads | Belbestanden in Steam, telefonisch getekend in Salesdock | Oud Mega Solar-bestand (planners bellen elke 6 mnd), websites, Google Ads, partners, AI leads |
| Steam | Setup **176**, campaign 15 | Lijn **177+178+179+181** (nooit alleen 177), campaign 23. Lijst staat op één plek: `src/lib/ventasol-lijn.ts` |
| Locaties | Leiden (1), Leiden 2, Rijswijk (Keysales), Den Haag, elk met eigen commissiemodel | Leiden 1 |
| Pagina's | `/lev/*` (LEV-glasstijl, groen/crème) | `/ventasol/*` (Ventasol-glas, blauw) |

LEV telt **niet** mee bij Ventasol-vragen en andersom.

Ventasol-verkoop: **afspraakplanners** (team Lucas) bellen oude klanten, boeken code **455** (afspraak
voor een adviseur; 452 = terugbelafspraak, geen afspraak) → **closer/adviseur** voert het
verkoopgesprek → sale in Salesdock. Planner krijgt €50 per converterende 455.

## 2. Wie het gebruikt (en wat ze mogen zien)

| Wie | Rol in het dashboard |
|---|---|
| **Javi, Daan** | Bouwers, admin. Daan doet ook infra, deploy en n8n (VPS) en commit mee op `main` |
| **Ali** | Manager, strategie |
| **Enver** | Leiding LEV Leiden. Directie-board (omzet, marge, bedrijfs-P&L) en bonusuitbetaling (`/mijn-dashboard/bonus`). Krijgt de LEV-recyclingleveringen |
| **Anton** | Ventasol. Eigen modulair board (`/mijn-dashboard/ventasol`). Prio van project 87 (betere verduurzaming-closers) |
| **Kayra** | Leidende compliance-beoordelaar van LEV-gesprekken; zijn besluiten bepalen het regelboek. **Ziet geen geldcijfers** |
| **Talar** | Tweede beoordelaar (volume) |
| **Daniel** | Belvloermanager Ventasol, eigen bord. Handelt on-hold-verzoeken van Jemal af |
| **Hematullah** | Belvloermanager LEV, **alleen Leiden 1**, bord zonder geld |
| **Lucas** | Team afspraakplanners, eigen bord |
| Closers verduurzaming | Bradley, Sten, Stef, Dean, Mark |

Rechten gaan per **sectie** (page-permissions), dubbel afgedwongen: proxy + API-route. Geld weghalen
gebeurt op de **datalaag**, niet alleen in de UI. Klantgegevens (NAW, telefoon, IBAN) nooit naar
console, logs of een model.

## 3. Waar de data vandaan komt

| Bron | Wat | Landt in schema |
|---|---|---|
| **Steam** (belplatform) | Records, belhistorie, live belvloer (RTD-websocket), audio | `steam`, `steam_live` |
| **Salesdock** | Sales, relaties, statushistorie, formulier-leads | `salesdock` |
| **Sollit** (ERP) | Pipeline kozijnen/installatie, on-hold-fases | `sollit` |
| **werktijden.nl** | Uren → loonkosten, rendabiliteit | `werktijden` |
| **Google Ads** (Ventasol + LEV), **Meta Ads** | Spend, CPL | `google_ads`, `google_ads_lev`, `meta_ads` |
| **ventasolpartners** (Supabase) | Partner-, site- en Meta-leads, elke minuut gepold, auto-push naar Steam | `partner_leads` |
| **SaySimple** | WhatsApp-gesprekken → CRM-tijdlijn | |
| **HubSpot** | Wordt uitgefaseerd. **Niet als bron vertrouwen** | `hubspot` |
| Eigen afgeleid | Personen, auth, config, bonus, HR, taken, meldingen | `app`, `compliance`, `corpus` |

Ingest draait als geplande taken op core: Salesdock en Steam elke 2 min (live) en 15 min (breder),
nachtelijke Steam-history (22:00) en full-dump (00:30). Volledige tabel: `data-project/DATAFLOWS.md`.

## 4. Machines

| Machine | Rol |
|---|---|
| **wecall-core** `192.168.50.162`, ssh `core` | **PRODUCTIE sinds 12-09-2026**: app (pm2), Postgres, alle 27 geplande taken, `wecall-steam-live` |
| **EliteDesk** `.120`, ssh `elitedesk` | Warme app-reserve **zonder database**. Niet naar schrijven, niet deployen, geen crons |
| **AI-bak** `.247` | Audio ophalen + transcriptie (Whisper op GPU), ~400 audio-uur per dag |
| **NAS** `.139` | Backups en audio-archief |
| **Werk-PC van Javi** | Hier wordt gebouwd. Dev via SSH-tunnel `55432 → core:5432` |

**Deploy = push naar `main`.** GitHub Actions bouwt op Windows → `deploy`-branch → `Wecall-Deploy-Pull`
op core pullt en herlaadt binnen 2 min. Nooit op een server bouwen, `deploy.ps1` is verouderd.
Publiek verkeer loopt via een Cloudflare-tunnel die **na 100 s afkapt** (lange routes moeten streamen).

## 5. De lagen van de app

1. **Dashboards**: `/ventasol/*` (overzicht, sales, agents, marge, pipeline, leads, marketing…),
   `/lev/*`, persoonlijke borden onder `/mijn-dashboard` (Enver, Anton, Daniel, Hematullah, Lucas),
   scoreborden (`/scorebord`, finishbord, kiosk-TV).
2. **CRM**: `/crm`, klantkaart (Steam + Salesdock + WhatsApp per persoon), `/mijn-leads`, `/leads`.
3. **Personeel en geld**: bonus (drie organisaties, bevriezen op betaalmoment), HR-werkplek
   LEV-dossier (`app.hr_*`, loon achter een pincode), werktijden, takenplatform.
4. **AI-laag** (grootste lopende investering):
   - **Corpus**: gesprekken uit Steam → audio → transcript → PII-strip → `corpus.*`.
   - **Compliance**: AI scoort LEV-salesgesprekken tegen het **regelboek (nu v4.2)**, Kayra en Talar
     tekenen af in `/beoordelen`. Scorer = Sonnet, via de Batch-API. Kost geld per run.
   - **Klantanalyse**: LEV-gesprekken → signaal voor verduurzamingsleads (eigendom, koopwens) →
     klantdossiers en leadscores.
   - **LEV-recycling**: oude LEV-leads opnieuw analyseren en in Steam-bakken laden (ladingen,
     leveringsregister voor Enver).
   - **Project 87** (sinds 16-09, ontwerpfase): verduurzaming-closers beter laten verkopen.
   - **Wecall·E**: de AI-assistent in de app. Bedrijfskennis in `src/lib/ai/kennis.ts`,
     paginacatalogus in `src/lib/ai/pages.ts`.
5. **Beheer**: `/systeembeheer`, `/diagnostiek` (versheid per bron, runs), config via
   `config-registry.ts` (altijd eerst daar kijken voor een instelbaar getal).

## 6. Waar alles staat

Repo: `projects/ventasol/ventasol` (remote `daanbosse/ventasol`, gedeeld met Daan, altijd op `main`).

| Pad (onder `data-project/`) | Wat |
|---|---|
| `wecall-app/src/app/` | Routes en pagina's (Next.js app-router) |
| `wecall-app/src/lib/` | Alle rekenlogica (~550 bestanden). Kern: `sales-category.ts`, `ventasol-lijn.ts`, `lev-cost-model.ts`, `ventasol-cost-model.ts`, `period.ts`, `config-registry.ts`, `tech-ops.ts` |
| `wecall-app/src/ingestion/<bron>/` | Ingest per bron |
| `wecall-app/src/db/schema/` | Drizzle-schema per databaseschema |
| `wecall-app/scripts/` | Crons, migraties, metingen. `_`-scripts = eenmalig of diagnose |
| `wecall-app/intelligence/` | Registry: business-rules, metrics, privacy, change-impact |
| `wecall-app/AGENTS.md` | Harde regels voor elke chat (runs, parallelle chats, core, deploy) |
| `wecall-app/PROJECT-STATE.md` | Sessiegeschiedenis. **~118k tokens: nooit volledig lezen** |
| `wecall-app/ONTWERP-designrichtlijn.md` | Glasontwerp. `/ventasol/sales` is de norm |
| `wecall-app/deploy/README.md` | Deploy-pipeline |
| `RUNS.md` | Langlopende runs. Bovenaan *Nu actief*, onderaan een groot *Archief*. **Nooit volledig lezen** |
| `sessions/` | Sessieverslagen en overdrachten, nieuwste = beste startpunt voor een spoor |
| `wecall-ai/` | Genummerde AI-projectdocumenten (regelboek, recycling, project 87…), `LEV-RECYCLING-LEADREGISTER.md` |
| `DATAFLOWS.md`, `HANDOFF-2026-09-14-migratie-wecall-core.md` | Wat draait wanneer, en de verhuizing naar core |

Dev-scripts: `projects/ventasol/scripts/start-dev.ps1` en `stop-dev.ps1`, met een identieke kopie
in de repo onder `scripts/`. `deploy.ps1` is buiten gebruik en stopt direct.

Tests: `npm run test` (regressie), `test:authz` (rechten), `test:aichat` (geldlek Wecall·E),
`test:render`, plus `npx tsc --noEmit`.

## 7. Definities die altijd gelden

- **Aantal sales = bruto incl. on-hold, excl. per-ongeluk, op tekendatum `api_finalized_at`.**
  Netto (`status = 'netto'`) = geld binnen. Bij elk sales-cijfer de telling erbij zetten.
- **Sale aan gesprek koppelen op de KLANT (telefoon over alle records), niet op het record**:
  40% tegen 94% dekking.
- **`corpus.leg.is_sale` telt sales van andere verkopers mee** (4x te hoog): filter op
  `salesdock.sales.user_id`.
- **Marge kozijnen = 32% all-in**; overige producten = omzet − inkoop − bonus − loon.
- **Bonusstaffel Ventasol is per maand**, niet per week.
- **Belresultaat is geen bewijs van een gesprek**; Steam schrijft een poging pas bij afboeken.
- **Stilstand en klaar zien er in de data hetzelfde uit.** Eerst de runs checken.

## 8. Technische valkuilen (elk heeft al eens geld of een dag gekost)

- JS-array in `ANY(${...})` met Drizzle faalt **stil**: bouw een SQL-array met `sql.join`.
- Drizzle/node-postgres geeft datums als **string** terug.
- `npm run build` naast een draaiende dev-server legt dev plat (gedeelde `.next`).
- Turbopack serveert na CSS-wijzigingen vaak een oud brok: meten of het is aangekomen.
- `backdrop-filter` in `globals.css` werkt niet (Lightning CSS), blur hoort in een `<style>`-tag.
- Niets zwaars in de root-layout (legde de hele app plat).
- Migraties één versie achterwaarts compatibel: de reserve-app draait oudere code tegen dezelfde DB.
- Nieuwe pagina → `src/lib/ai/pages.ts` bijwerken en `scripts/_test-pages.ts` draaien.
- Een parallelle chat kan de gedeelde tunnel 55432 omleggen: lange runs een eigen tunnel geven.

## 9. Werkafspraken met Javi

- **Meerdere chats tegelijk** is normaal. Vreemde wijzigingen in de tree = andere chat: niet
  opruimen, niet alarmeren. **Nooit `git add -A`**, commit per pad en alleen als Javi erom vraagt.
- **Dashboard niet wijzigen zonder opdracht.** "Verbeter als het kan" = eerst een voorstel.
- **Nooit een betaalde AI-run zonder expliciete go**, met kostenraming vooraf; boven €2 via batch.
- Start je een langlopende run: **meteen** in `RUNS.md`, met het veld "Onbetrouwbaar zolang dit loopt".
- **Alle data klikbaar** met een grote pop-up, ook tabelcellen en totalen.
- Data-veiligheid is prioriteit #1: fail-closed, geld en PII op de datalaag afschermen.
- Nederlands, direct, geen emojis, kosten tegen opbrengst expliciet.
