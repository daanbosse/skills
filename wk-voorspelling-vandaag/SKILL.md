---
name: wk-voorspelling-vandaag
description: Genereert een lange, extreem grondige deep-research-prompt voor ChatGPT om de KOMENDE WK 2026-KNOCK-OUTwedstrijden te laten voorspellen. Trigger wanneer Javi zegt "wk voorspelling", "voorspel de komende wedstrijden", "voorspel de wedstrijden van vandaag", "maak de wk-prompt", "deep research wk", "komende wedstrijden voorspellen" of een aantal noemt ("komende 2"). De skill pakt standaard de wedstrijden van de eerstvolgende speeldag uit de live poule-DB (knock-out: meestal 1-3), bouwt per wedstrijd een feiten-dossier en levert ÉÉN kant-en-klare ChatGPT-prompt op die ChatGPT dwingt verse data + opstellingen op te zoeken en per wedstrijd 4 uitkomsten te geven: uitslag NA 90 MINUTEN (winnaar/gelijk met %), top-3 exacte 90-min-uitslagen met %, wie doorgaat naar de volgende ronde (na evt. verlenging/penalty's), en de eerste doelpuntenmaker.
---

# WK-voorspelling → ChatGPT deep-research-prompt (knock-outfase)

Doel: Javi één **kant-en-klare, zeer uitgebreide prompt** geven die hij in ChatGPT (deep research) plakt, voor de **komende nog niet gespeelde knock-outwedstrijden**. Claude doet het voorwerk (welke wedstrijden, feiten-dossier), ChatGPT doet de zware analyse en zoekt zelf naar verse data en opstellingen.

**Rolverdeling (belangrijk):** Claude analyseert NIET zelf de wedstrijden en voorspelt geen uitslagen. Claude verzamelt alleen de feiten en bouwt de prompt. De voorspelkracht moet volledig uit ChatGPT's deep research komen.

**Het is nu de knock-outfase.** Dat verandert twee dingen fundamenteel:
1. De **uitslag-voorspelling geldt voor 90 minuten** (reguliere speeltijd, géén verlenging/penalty's). Een gelijkspel mág de meest waarschijnlijke 90-min-uitkomst zijn.
2. Omdat er altijd één team doorgaat, wil Javi **óók weten wie zich plaatst** voor de volgende ronde — dus wie het wint inclusief eventuele verlenging en strafschoppen. Dit is een aparte uitkomst, los van de 90-min-stand.

**Gewenste output per wedstrijd (dit wil Javi uiteindelijk uit ChatGPT):**
1. **Uitslag na 90 minuten** — thuis wint / uit wint / gelijk, met zekerheids-%. Expliciet reguliere speeltijd, geen verlenging.
2. **Top-3 meest waarschijnlijke exacte 90-min-uitslagen, elk met een %** (uit een verwachte-goals-model, percentages onderling consistent).
3. **Wie gaat door naar de volgende ronde** — het team dat zich plaatst inclusief eventuele verlenging + strafschoppen, met zekerheids-%. Verplicht voor élke wedstrijd, extra belangrijk als de 90-min-uitkomst een gelijkspel is.
4. **Eerste doelpuntenmaker** — welke speler. Zo **veilig mogelijk**: uitsluitend uit de verwachte basisopstelling, geen invallers.

---

## Stap 1 — Bepaal welke wedstrijden

- Default: **alle nog niet gespeelde wedstrijden van de eerstvolgende speeldag** (NL-tijd), oplopend op aftrap. In de knock-outfase zijn dat er vanzelf meestal **1 tot 3**. Een late aftrap (VS-avond) kan in NL-tijd over middernacht schuiven — het script rekent zelf om en groepeert op NL-kalenderdag.
- Noemt Javi een ander aantal ("komende 2", "alleen de eerstvolgende")? Geef dat getal mee aan het script; dan pakt het exact dat aantal i.p.v. een hele speeldag.

## Stap 2 — Haal de wedstrijden op (live DB, echte teams)

Draai vanuit `projects/wecall-wk-poule/web`:

```bash
npx tsx scripts/komende-wedstrijden.ts        # eerstvolgende speeldag (default, knock-out: 1-3)
npx tsx scripts/komende-wedstrijden.ts 2      # exact de eerstvolgende 2
```

Het script leest de live poule-database en geeft per wedstrijd: `matchNum`, fase (1/16, achtste, kwart, halve, finale), teams (Nederlandse namen), aftrap in NL-tijd, stadion + stad, en een **×2-markering** (Oranje speelt of uitgelichte kraker — die wedstrijd telt dubbel in de poule).

**Fallback als de DB niet bereikbaar is:** val terug op het lokale fixtures-bestand `projects/wecall-wk-poule/web/db/fixtures-wk2026.ts` (geen DB nodig). Lees de fixtures, converteer elke `kickoffAt` naar Europe/Amsterdam, en pak de wedstrijden van de eerstvolgende speeldag waarvan de aftrap nog in de toekomst ligt. In de knock-outfase kunnen daar nog plaatsaanduidingen staan ("Winnaar Groep E", "Verliezer ..."); zet die om naar de échte landen via een korte web-check van de eindstanden/vorige ronde, of zet de plaatsaanduiding in de prompt mét instructie aan ChatGPT om eerst het juiste land te bevestigen.

## Stap 3 — Bouw per wedstrijd een kort feiten-dossier

Vul wat je zeker weet uit het script + lichte context. Niet analyseren, alleen feiten:
- Wedstrijdnummer, **fase** (1/16 / achtste / kwart / halve / finale) en het bracket-pad indien relevant (uit welke vorige ronde komen beide teams, hoeveel rust hebben ze gehad).
- Teams, stadion + **stad** (cruciaal voor weer/hoogte — bv. Mexico-Stad = hoogte, veel VS-steden = hitte in juni/juli).
- Kickoff in NL-tijd.
- **×2-markering:** speelt **Nederland** mee of is het een uitgelichte kraker? Dan telt de wedstrijd in de poule dubbel — markeer dat (het script doet dit al).
- **Knock-outcontext:** dit is afvalrace — verliezer ligt eruit. Noem kort wat bekend is dat het beeld kleurt: een team dat de vorige ronde via verlenging/penalty's won (vermoeidheid), een belangrijke schorsing die meegenomen is uit de vorige ronde, of een opvallend reisschema. Een korte web-check mag; houd het feitelijk en markeer onzekerheid.

## Stap 4 — Genereer de ChatGPT-prompt

Geef de onderstaande prompt-template terug, met de `{...}`-velden ingevuld voor de wedstrijden van de eerstvolgende speeldag. Eén prompt voor álle wedstrijden samen, met een apart blok per wedstrijd.

- Toon de prompt in één codeblok zodat Javi 'm in één keer kan kopiëren.
- De prompt moet **minimaal 800 woorden** zijn (met meerdere wedstrijden ruim gehaald). Liever te uitgebreid dan te kort — de instructies hieronder zijn bewust streng en gedetailleerd; laat niets weg.
- Zet er kort boven (buiten het codeblok) welke wedstrijden het zijn en de deadline-herinnering: **invullen kan tot 60 min voor aftrap**.

### PROMPT-TEMPLATE (vul de velden in, plak de rest letterlijk)

```
ROL — Je bent een team van vier experts ineen: (1) een sportstatisticus/betting-quant die bookmaker-odds en voorspelmodellen leest en odds omrekent naar zuivere kansen (marge eruit), (2) een internationaal voetbalscout met diepe kennis van selecties, vorm, tactiek en knock-outvoetbal, (3) een data-analist die actief en realtime het internet afzoekt naar de meest recente informatie, en (4) een kritische reviewer die de eindconclusie toetst op interne consistentie en tegen de markt. Je werkt kwantitatief, citeert elke kernbron mét datum, en verzint NOOIT cijfers. Bij twijfel zeg je expliciet dat iets onzeker is.

OPDRACHT — Voer diepgaand deep research uit naar de onderstaande KOMENDE WK 2026-KNOCK-OUTwedstrijden en geef per wedstrijd een zo accuraat mogelijke voorspelling. Onderzoek zo breed en grondig mogelijk, maar lever per wedstrijd een compacte, beslisbare conclusie. Dit is de knock-outfase: er is geen groepsstand meer, het is afvalrace, en de verliezer ligt eruit.

HARDE EIS 1 — VERSE DATA. Dit is het belangrijkste. Vertrouw NIET op je geheugen; zoek actief en gebruik uitsluitend de nieuwste informatie. Voor ELKE wedstrijd onderzoek je expliciet:
- VERWACHTE OPSTELLINGEN van beide teams voor déze wedstrijd, uit team-nieuws, persconferenties, beat-reporters en voorspelde-XI-bronnen (FotMob, Sofascore, WhoScored, lokale pers, Fabrizio Romano). Geef per team de waarschijnlijke basis-11 met namen en het systeem (bv. 4-3-3). Vermeld of de opstelling al BEVESTIGD is of nog "verwacht".
- BLESSURES en SCHORSINGEN op dit moment, inclusief schorsingen die uit de vorige knock-outronde zijn meegenomen, plus wie op een gele kaart staat (een tweede geel in de knock-out = schorsing volgende ronde, beïnvloedt rotatie/risico-mijding).
- VORM: de laatste 5-6 wedstrijden van beide teams + hun complete pad in dit WK tot nu toe (per ronde: tegenstander, uitslag, en of er verlenging/penalty's aan te pas kwamen).
- VERMOEIDHEID & RUST: won een team de vorige ronde pas na 120 minuten of strafschoppen? Hoeveel rustdagen heeft elk team gehad en hoe groot was de reisafstand? Minder rust en 120 min in de benen drukt het niveau.
- CONTEXT op de speeldag: weersvoorspelling voor de speelstad op de speeldatum (hitte, luchtvochtigheid, regen), hoogte (bv. Mexico-Stad), aftraptijd lokaal (middaghitte?).
- ODDS-SNAPSHOT van bookmakers (Pinnacle als scherpste, plus Bet365/Oddschecker): 1X2 voor 90 minuten, "to qualify"/doorgaan-odds, over/under, beide-teams-scoren, correcte-score (90 min) en eerste-doelpuntenmaker. Reken de 1X2- en doorgaan-odds om naar IMPLICIETE KANSEN en haal de bookmakermarge (overround) eruit, zodat je zuivere percentages overhoudt. Dit is je kwantitatieve anker.
- STRAFSCHOPPEN & VERLENGING: de strafschoppenreeks-historie van beide landen en de bondscoach, de vaste penaltynemers, de keeperreputatie bij shoot-outs, en de selectiediepte voor 120 minuten (bank-kwaliteit). Dit bepaalt wie doorgaat als het 90 min gelijk staat.
- SCHEIDSRECHTER en diens kaart- en penaltygemiddelde, als bekend.
Regel: elk kerngegeven krijgt een bron + datum. Oude data mag alleen voor structurele zaken (speelstijl, kwaliteit, historie), niet voor vorm/opstelling/blessures. Geen bron = niet meenemen. Noem de datum waarop je de odds hebt geraadpleegd.

HARDE EIS 2 — 90 MINUTEN vs. DOORGANG. Houd deze twee scherp uit elkaar:
- De UITSLAG-voorspelling (uitkomst 1 en 2 hieronder) gaat over de stand NA 90 MINUTEN reguliere speeltijd, ZONDER verlenging of strafschoppen. Een gelijkspel is een geldige, en in knock-outvoetbal vaak waarschijnlijke, 90-min-uitkomst — voorspel het als het écht het meest waarschijnlijk is, forceer geen winnaar.
- De DOORGANG-voorspelling (uitkomst 3) gaat over wie zich uiteindelijk plaatst, INCLUSIEF eventuele verlenging en strafschoppen. Dit is een aparte vraag met een eigen kans.

ANALYSE — Combineer odds (sterkste signaal) met je eigen model en scoutingkennis. Bouw een verwachte-goals-inschatting (Poisson/xG-stijl) per team voor 90 minuten en leid daaruit de waarschijnlijkste 90-min-uitslagen af. Kies de MODALE exacte uitslag (meest waarschijnlijke stand), niet het gemiddelde. Houd er rekening mee dat knock-outwedstrijden gemiddeld behoudender en lager-scorend zijn dan groepswedstrijden, met een hogere kans op een gelijke stand na 90 min en dus op verlenging. Weeg de tactische matchup: formaties tegen elkaar, sleutelduels, set-pieces, pressing, en hoe een team speelt als het op voorsprong/achterstand komt in een afvalrace.

KRITISCHE ZELFCHECK (reviewer-rol) — Voordat je concludeert: vergelijk je eigen kansen met de impliciete kansen uit de odds. Wijkt je voorspelling sterk af van de markt, leg dan in één zin uit waarom (en wees voorzichtig — de markt is scherp). Controleer dat je percentages intern consistent zijn: de top-3 90-min-uitslagen mogen samen niet bijna 100% claimen (er zijn meer mogelijke standen), en de doorgaan-kansen van beide teams tellen samen op tot 100%.

LEVER PER WEDSTRIJD EXACT DIT (en niets weglaten):
1. UITSLAG NA 90 MINUTEN — je conclusie (thuis wint / uit wint / gelijk na 90 min) met een zekerheids-% en 1-2 zinnen onderbouwing. Expliciet reguliere speeltijd.
2. TOP-3 MEEST WAARSCHIJNLIJKE EXACTE 90-MIN-UITSLAGEN — drie standen (bv. 1-0, 1-1, 2-1), elk met een waarschijnlijkheids-% afgeleid uit je goals-model. De percentages moeten realistisch en onderling consistent zijn.
3. WIE GAAT DOOR NAAR DE VOLGENDE RONDE — één team dat zich volgens jou plaatst, inclusief eventuele verlenging en strafschoppen, met een zekerheids-% en korte onderbouwing (kwaliteitsverschil, selectiediepte voor 120 min, penalty-historie, mentaliteit/ervaring in shoot-outs). Geef dit ALTIJD, ook als je bij uitkomst 1 een winnaar voorspelt — extra belangrijk als uitkomst 1 een gelijkspel is.
4. EERSTE DOELPUNTENMAKER — één speler die volgens jou het allereerste doelpunt van de wedstrijd maakt. ZO VEILIG MOGELIJK: kies uitsluitend uit de VERWACHTE BASISOPSTELLING (geen invallers), op basis van first-scorer-odds, penaltynemer, vrije-trap/strafschop-status, vorm en rol in het team. Geef ook 1 alternatieve naam.
Voeg onder elke wedstrijd 4-6 regels onderbouwing toe (opstellingsnieuws, vorm, vermoeidheid/rust, sleutelfactoren, penalty-beeld) met bronnen + datum.

OUTPUT-FORMAT — Per wedstrijd een kort kopje "Wedstrijd: {THUIS} – {UIT} ({fase})", dan de 4 genummerde uitkomsten in een klein tabelletje of bullets, dan de onderbouwing. Sluit af met een totaaltabel: per wedstrijd één regel met 90-min-uitslag | meest waarschijnlijke exacte uitslag | gaat door | eerste doelpuntenmaker — zodat ik het in 2 minuten kan overnemen.

DE KOMENDE WEDSTRIJDEN:
{Per wedstrijd één blok, bijvoorbeeld:}
- Wedstrijd {matchNum} — {fase, bv. "Achtste finale"}: {THUIS} – {UIT}. Aftrap {NL-tijd} NL-tijd, {dag}. Stadion: {venue}, {stad}. {×2-markering indien Nederland of kraker: "LET OP: telt dubbel in mijn poule."} {Knock-outcontext indien bekend: vorige ronde via verlenging/penalty's, schorsing, korte rust, etc.}

Begin met zoeken naar de meest recente opstellingen, blessures en odds, en wees uitputtend grondig.
```

## Stap 5 — Korte afronding

Geef onder het codeblok:
- Een mini-overzicht van de wedstrijden van de eerstvolgende speeldag (teams + fase + NL-tijd + ×2-markering).
- De deadline-herinnering: invullen in de poule kan tot **60 min voor aftrap**; officiële opstellingen komen vaak pas ~1 uur voor de aftrap, dus deze prompt werkt met de *verwachte* opstelling.
- Niets opslaan of committen tenzij Javi daarom vraagt.

## Niet doen
- Niet zelf de wedstrijden analyseren of uitslagen voorspellen — dat is ChatGPT's taak.
- De 90-min-uitslag en de doorgang niet door elkaar halen — het zijn twee aparte uitkomsten.
- Geen onbevestigde feiten als zeker presenteren; markeer onzekerheid.
- De prompt nooit korter dan 800 woorden maken.
