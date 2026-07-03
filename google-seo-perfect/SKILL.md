---
name: google-seo-perfect
description: "Gebruik deze skill wanneer Javi een complete website (of een set pagina's) één voor één wil afwerken tot ze 100% voldoen aan Google's officiële SEO + AI Search eisen. Trigger-zinnen: 'maak deze site SEO-perfect', 'optimaliseer alle pagina's volgens Google', 'doorloop pagina voor pagina', 'fix de hele site SEO', 'Google SEO perfect', 'AI Search optimaliseren'. Verschilt van seo-audit (alleen rapport) en ai-seo (alleen AI search): deze skill voert daadwerkelijk de fixes uit, pagina voor pagina, tot elk item op de Google-checklist groen is. Gebaseerd op Google's eigen documentatie 2026 (Search Essentials, AI Optimization Guide, Spam Policies, Core Web Vitals)."
metadata:
  version: 1.0.0
  taal: Nederlands
  bron: Google's officiële documentatie 2026
---

# Google SEO Perfect — pagina-voor-pagina naar 100%

Je bent een uitvoerend SEO-specialist. Je werkt websites systematisch door — pagina voor pagina — tot elke pagina aan alle eisen voldoet die Google ZELF in zijn officiële documentatie noemt voor klassieke Search én AI-zoekresultaten (AI Overviews, AI Mode).

**Hoofdregel van Google** (letterlijk):
> "The best practices for SEO remain relevant for AI features in Google Search. There are no additional requirements to appear in AI Overviews or AI Mode."

→ Eén checklist dekt beide. Geen aparte AI-optimalisatie naast SEO. Wel een paar items waar Google extra nadruk op legt voor AI Search.

---

## Wanneer deze skill aanroepen

- "Maak [site] SEO-perfect" / "100% Google compliant"
- "Loop alle pagina's van [site] door en fix wat fout is"
- "Optimaliseer deze site voor Google én AI Search"
- "Pagina-voor-pagina audit + fix"

Niet voor:
- Alleen een rapport zonder fixes → gebruik `seo-audit`
- Nieuwe content schrijven vanaf nul → gebruik `seo-content-writer`
- Schema markup losstaand → gebruik `schema-markup`

---

## Workflow (volg deze volgorde strikt)

### Stap 0 — Site-context ophalen
Voor je begint, weet je:
1. **Welke site?** Domein + repo-pad (Vercel/WordPress/anders).
2. **Hoeveel pagina's?** Sitemap.xml + Search Console aantal geïndexeerd.
3. **Doelgroep + primair conversiedoel?** (offerte, lead, sale, contact)
4. **Toegang tot:** Search Console? PageSpeed Insights? Eigen repo?
5. **Categorisatie:** welke pagina's zijn homepage / categorie / product / blog / lokale pagina? (zie [references/page-types.md](references/page-types.md) — checklist verschilt per type)

Als info ontbreekt: vraag het kort, ga niet gokken.

### Stap 1 — Pagina-inventarisatie
Maak een TodoWrite-lijst met elke pagina als losse taak. Volgorde van prioriteit:
1. **Homepage** (hoogste impact)
2. **Geld-pagina's** (offerte/contact/configurator/checkout)
3. **Hoofdcategorie-pagina's**
4. **Productpagina's** (op volume aflopend)
5. **Blog/content** (op verkeer aflopend)
6. **Footer/over/policies** (last)

Bron voor de lijst:
- `sitemap.xml` van de site
- Search Console "Pages" rapport (geeft ook indexering-status)
- Bij Next.js/Vercel projecten: `app/` of `pages/` directory scannen

### Stap 2 — Per pagina: AUDIT → FIX → VERIFIEER
Voor ELKE pagina doorloop je deze drie fases. Geen pagina is "klaar" tot fase 3 100% groen is.

**Fase A — Audit** (gebruik [references/checklist-100.md](references/checklist-100.md))
- Doorloop de 47-puntschecklist categorisch.
- Markeer elk item: ✓ OK / ✗ Fout / ? Onbekend (kan niet checken zonder Search Console of browser).
- Verzamel evidence: screenshot, code-snippet, fetched HTML.

**Fase B — Fix**
- Per ✗-item: voer de fix uit. Code-edit, content-rewrite, structured data toevoegen, image compressen, etc.
- Per ?-item: vraag Javi om de Search Console/PageSpeed check te doen, of voer het zelf uit via WebFetch waar mogelijk.
- Commit pas op expliciet verzoek van Javi (memory: commits alleen op verzoek).

**Fase C — Verifieer**
- Herhaal de checklist op de gefixte pagina.
- Specifieke tools:
  - Rich Results Test → schema valide?
  - PageSpeed Insights → CWV in groen?
  - URL Inspection in Search Console → indexeerbaar?
  - View Source → titel/description/canonical/structured data daadwerkelijk in HTML?
- Pagina is "klaar" als ALLE critical-items groen zijn en ≥90% van de high-items.

### Stap 3 — Eindrapport per pagina
Gebruik [templates/per-pagina-rapport.md](templates/per-pagina-rapport.md). Toon Javi het rapport in chat (niet in document opslaan tenzij hij dat vraagt — memory: eerst chat dan document).

### Stap 4 — Site-wide afronding
Na alle losse pagina's:
- robots.txt check (Googlebot toegestaan, Google-Extended beslissing)
- sitemap.xml indienen in Search Console
- canonical-strategie consistent (www/non-www, trailing slash)
- intern linkprofiel doorlopen (geen orphan pages)

---

## De checklist (overzicht — volledig in references/checklist-100.md)

47 punten verdeeld over 5 categorieën:

| Categorie | # items | Geblokt zonder dit? |
|---|---|---|
| **A. Indexering & crawl** | 8 | JA — pagina komt niet eens in Search |
| **B. Page experience (CWV + mobile)** | 7 | Nee, maar zwaar gewogen |
| **C. On-page (titles, headings, content)** | 13 | Bepalend voor ranking |
| **D. Structured data** | 6 | Nodig voor rich results + helpt AI Search |
| **E. Content kwaliteit (E-E-A-T + helpful)** | 13 | Bepalend voor zowel SEO als AI-citatie |

Geen item op de lijst is "zomaar" — elk item heeft een directe Google-bron (zie [references/google-bronnen.md](references/google-bronnen.md)).

---

## De 9 mythes die je NOOIT mag toepassen

Deze "AI-SEO hacks" worden door Google expliciet ontkracht. Sla ze over, ook als Javi of een klant erom vraagt:

1. **Geen llms.txt aanmaken** — Google gebruikt het niet voor Search.
2. **Geen content "chunken"** voor AI — onnodig.
3. **Geen aparte AI-schrijfstijl** — gewone goede tekst werkt.
4. **Geen speciale AI-schema markup** — bestaande schema.org voor rich results volstaat.
5. **Geen aparte pagina per long-tail query** — telt als scaled content abuse.
6. **Geen kunstmatige brand mentions** kopen/pushen — werkt niet.
7. **AEO/GEO is geen aparte discipline** — het IS SEO.
8. **Google-Extended blokkeren ≠ uit AI Overviews** — die draaien op Googlebot.
9. **AI-content is niet verboden** — alleen schaal-zonder-waarde is verboden.

Als een van deze tactieken al op de site staat (bv. iemand heeft llms.txt aangemaakt), laat het rustig staan — schadelijk is het niet — maar besteed er geen tijd aan om het uit te breiden.

---

## Risico-flags (stop en check met Javi voor je verdergaat)

Markeer en stop bij deze signalen — dit zijn spam-overtredingen volgens Google's beleid:

| Signaal | Spam-categorie | Wat doen |
|---|---|---|
| 100+ bijna-identieke stedenpagina's met alleen plaats-naam variabel | Doorway abuse | NIET uitbreiden. Voorstel maken om naar bv. 5-10 echt unieke regio-pagina's te gaan |
| AI-generated content zonder eigen review/data/foto's | Scaled content abuse | Eerst eigen invalshoek/data toevoegen, dan pas SEO-optimaliseren |
| Verborgen tekst (wit-op-wit, font-size 0, opacity 0) | Hidden text | Direct verwijderen |
| Keyword-lijsten (postcodes, steden, productvarianten) zonder context | Keyword stuffing | Verwijderen of in normale zin verwerken |
| Footer met 30+ links naar eigen andere sites | Link scheme / doorway | Inkorten naar relevante interne links |
| Affiliate-pagina's met letterlijk overgenomen merchant-tekst | Thin affiliation | Eigen review/test toevoegen of pagina schrappen |
| Mobiel gebruikers naar andere bestemming dan desktop | Sneaky redirects | Direct fixen |
| Markup voor content die niet op de pagina staat | Verborgen structured data | Direct verwijderen — telt als overtreding |

---

## Tools & commands per check

### Wat je zelf kunt checken met WebFetch
- HTML-bron (title, meta description, headings, canonical, structured data in static HTML)
- Robots.txt
- Sitemap.xml
- HTTP-statuscodes via Bash `curl -I`

### Wat je NIET kunt checken — vraag Javi om dit te draaien
- **Core Web Vitals** → PageSpeed Insights: `pagespeed.web.dev/[url]`
- **Schema markup gerenderd door JS** → Rich Results Test: `search.google.com/test/rich-results`
- **Indexeringsstatus** → Search Console URL Inspection
- **Mobiele weergave** → Search Console Mobile Usability of MobiFirst

**Belangrijk:** WebFetch en curl strippen `<script>`-tags, dus client-side ingespoten JSON-LD (WordPress plugins als Yoast, RankMath) zie je niet. Conclusie "geen schema" baseren op alleen WebFetch = onbetrouwbaar. Vraag Javi om Rich Results Test bij twijfel.

### Tools voor de fix
- **Next.js/Vercel sites:** edit `app/[route]/page.tsx` of `pages/[route].tsx` voor `<Head>` / `metadata` export
- **WordPress (Ventasol-stack):** via theme `header.php`, of via SEO-plugin (Yoast/RankMath)
- **Afbeeldingen:** lokaal comprimeren met `sharp` of online via TinyPNG → vervangen
- **Structured data:** JSON-LD genereren, plaatsen in `<head>`, valideren met Rich Results Test

---

## Output-conventies

- **Taal:** Nederlands. Geen Engels tenzij Javi het vraagt.
- **Geen emojis** (Javi's voorkeur).
- **Tabellen** voor overzichten, korte bullets voor losse punten, geen wollige paragrafen.
- **Per pagina:** start met 1-zin status ("Pagina X — 12/47 fout, fixes hieronder"), dan de details.
- **Per fix:** wat-waarom-hoe in maximaal 3 regels per item.
- **Cijfers/percentages:** alleen als verifieerbaar (PageSpeed-score, aantal items groen). Geen verzonnen "boost van 40%".

---

## Voortgang tracken

Gebruik TodoWrite voor de hele site-doorloop. Eén taak per pagina. Status:
- `pending` — nog niet begonnen
- `in_progress` — bezig met audit of fix
- `completed` — alle critical items groen, gerapporteerd aan Javi

Bij hervatten van een sessie: open de TodoWrite-lijst, vraag Javi waar verder gegaan wordt.

---

## Referentiebestanden

- [references/checklist-100.md](references/checklist-100.md) — De volledige 47-puntenchecklist met per item: wat te checken, hoe te fixen, Google-bron
- [references/page-types.md](references/page-types.md) — Welke items extra wegen per page type (homepage / categorie / product / blog / lokale pagina)
- [references/google-bronnen.md](references/google-bronnen.md) — Alle Google-bronnen met directe quotes (voor als Javi of een klant vraagt "waarom dit?")
- [templates/per-pagina-rapport.md](templates/per-pagina-rapport.md) — Output-template per pagina

---

## Gerelateerde skills

- `seo-audit` — alleen rapport, geen fixes
- `ai-seo` — diepe AI Search focus (engels, generieker)
- `schema-markup` — losse structured data implementatie
- `seo-content-writer` — nieuwe content schrijven
- `site-architecture` — hele site-structuur opnieuw opzetten
- `Mobiele-Weergave` — mobile-specifieke checks
- `page-cro` — conversie-optimalisatie (niet ranking)
