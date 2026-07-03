---
name: wedstrijden
description: Toont de WK 2026-wedstrijden van een dag uit de poule-app, inclusief aftraptijd (NL-tijd), tussenstand/uitslag en live-status. Trigger wanneer Javi zegt "wedstrijden vandaag", "/wedstrijden", "welke wedstrijden zijn er vandaag", "wat speelt er vandaag", "wedstrijden morgen" of een datum noemt. Dit is een SNEL overzicht — niet de voorspel-prompt (dat is wk-voorspelling-vandaag).
---

# Wedstrijden van de dag (WK 2026-poule)

Doel: Javi in één blik laten zien welke WK-wedstrijden er op een dag zijn, met aftraptijd in NL-tijd, de stand/uitslag en of er een live loopt. Snel, geen analyse, geen prompt.

## Stap 1 — Bepaal de dag

- Default: **vandaag** in Europe/Amsterdam.
- Noemt Javi een dag ("morgen", "20 juni", "2026-06-20")? Reken om naar een `YYYY-MM-DD`-datum in NL-tijd en gebruik die.
- Let op: een wedstrijd die in de VS 's avonds begint, valt in NL-tijd vaak laat dezelfde dag of net de volgende — de query rekent zelf om naar NL-tijd, dus geef gewoon de kalenderdag mee.

## Stap 2 — Haal de wedstrijden op (live DB, met scores)

Draai vanuit `projects/wecall-wk-poule/web`:

```bash
npx tsx scripts/wedstrijden-dag.ts            # vandaag
npx tsx scripts/wedstrijden-dag.ts 2026-06-20 # specifieke dag
```

Het script leest de live poule-database (EliteDesk Postgres) en geeft per wedstrijd: aftraptijd in NL-tijd, Nederlandse teamnamen, stand/uitslag, status (LIVE / uitslag / nog te spelen) en een `[kraker]`-markering bij uitgelichte wedstrijden.

## Stap 3 — Fallback als de DB niet bereikbaar is

De live DB vereist VPN/verbinding met EliteDesk. Krijg je een connectie-fout, val dan terug op het **lokale fixtures-bestand** (geen VPN nodig, maar dan zónder scores/live-status — alleen het schema):

- Bron: `projects/wecall-wk-poule/web/db/fixtures-wk2026.ts`
- Lees de fixtures, converteer elke `kickoffAt` naar Europe/Amsterdam, selecteer de wedstrijden van de doeldag en toon: aftraptijd (NL-tijd), teams, fase/groep, stadion.
- Meld er kort bij dat dit het schema is zonder live-stand (DB was niet bereikbaar).

## Stap 4 — Presenteer

- Toon de scriptoutput vrijwel direct; voeg hooguit een korte kop toe.
- Geen wedstrijden die dag? Meld dat in één zin en stop.
- Speelt **Nederland**? Markeer kort dat die wedstrijd in de poule **dubbel** telt.
- Optioneel, alleen als Javi nog moet invullen: deadline = invullen kan tot **60 min voor aftrap**.

## Niet doen
- Niet zelf uitslagen voorspellen of analyseren (dat is `wk-voorspelling-vandaag`).
- Niets opslaan of committen tenzij Javi daarom vraagt.