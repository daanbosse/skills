# Checklist 100% — alle 47 items met fix-instructies

Elk item heeft: **wat checken**, **hoe checken**, **fix**, **Google-bron**. Werk top-down.

Legenda:
- **C** = Critical (zonder dit: pagina rankt niet of komt niet in index)
- **H** = High (sterk aanbevolen, directe impact op ranking)
- **A** = AI Search extra (item waar Google specifiek extra nadruk op legt voor AI Overviews/Mode)

---

## A. Indexering & crawl (8 items)

### A1 — HTTP 200 status [C]
- **Check:** `curl -I https://[url]` → moet `HTTP/2 200` zijn
- **Fix bij ander:** 301 redirects naar canonieke versie, 404's verwijderen uit sitemap, server-config bij 5xx
- **Bron:** Search Essentials → Technical requirements

### A2 — Googlebot niet geblokkeerd in robots.txt [C]
- **Check:** `curl https://[domein]/robots.txt` — zoek naar `Disallow:` voor Googlebot
- **Fix:** verwijder Disallow-regels die de pagina blokkeren, of gebruik `Allow:` voor de specifieke URL
- **Bron:** Search Essentials → Technical requirements

### A3 — Geen `noindex` meta-tag of header [C]
- **Check:** in HTML-bron zoeken naar `<meta name="robots" content="noindex">` of HTTP `X-Robots-Tag: noindex` (`curl -I`)
- **Fix:** verwijder de tag — vaak per ongeluk achtergebleven uit dev-fase
- **Bron:** Search docs → Block search indexing

### A4 — Canonical aanwezig en correct [C]
- **Check:** `<link rel="canonical" href="...">` in `<head>` — moet naar de pagina zelf wijzen (of bij duplicate naar de master)
- **Fix:** voeg toe of corrigeer. Eén canonical per pagina. Geen conflicterende canonicals.
- **Bron:** Search docs → Canonicalization

### A5 — HTTPS [C]
- **Check:** URL begint met `https://`, geen mixed content warnings (DevTools console)
- **Fix:** SSL-certificaat instellen (Let's Encrypt via Vercel/host), alle interne links + images naar https
- **Bron:** Search Essentials → page experience self-assessment

### A6 — URL in sitemap.xml [H]
- **Check:** `curl https://[domein]/sitemap.xml` — staat de URL erin?
- **Fix:** toevoegen aan sitemap. Bij Next.js: `app/sitemap.ts` updaten. Bij WordPress: SEO-plugin regenereert sitemap.
- **Bron:** Search docs → Sitemaps

### A7 — Pagina geïndexeerd in Google [C]
- **Check:** `site:[domein]/[pad]` in Google, of URL Inspection in Search Console
- **Fix bij niet geïndexeerd:** URL Inspection → "Request indexing", check op crawl-errors, controleer A1-A6
- **Bron:** Search Console help

### A8 — Geen redirect chains of loops [H]
- **Check:** `curl -IL https://[url]` — tellen hoeveel hops, max 1 redirect aanvaardbaar
- **Fix:** directe redirect naar einddoel, intermediate hops elimineren
- **Bron:** Search docs → Redirects

---

## B. Page experience (7 items)

### B1 — LCP < 2,5 sec (mobiel) [H][A]
- **Check:** PageSpeed Insights → mobile tab → LCP-score
- **Fix:** hero image: `<img loading="eager" fetchpriority="high">`, gebruik WebP/AVIF, preload critical fonts (`<link rel="preload" as="font">`), inline critical CSS, server-side render bij Next.js
- **Bron:** Search docs → Core Web Vitals

### B2 — INP < 200 ms [H][A]
- **Check:** PageSpeed Insights → INP-score
- **Fix:** lange JS-tasks opbreken (web workers, code splitting), event handlers debouncen, third-party scripts async/defer
- **Bron:** Search docs → Core Web Vitals

### B3 — CLS < 0,1 [H][A]
- **Check:** PageSpeed Insights → CLS-score
- **Fix:** `width`+`height` op alle images/iframes, `font-display: swap` met font-loading API, geen content-injectie boven bestaande content (banners, ads)
- **Bron:** Search docs → Core Web Vitals

### B4 — Mobiel responsive [C][A]
- **Check:** Chrome DevTools → device mode (375px breedte) — geen horizontale scroll, tekst leesbaar, buttons tapbaar (min 48×48px)
- **Fix:** `viewport` meta-tag aanwezig (`<meta name="viewport" content="width=device-width, initial-scale=1">`), responsive CSS (mobile-first), tap target sizes
- **Bron:** Search docs → Mobile-friendly + AI Optimization Guide

### B5 — Geen intrusive interstitials op mobiel [H]
- **Check:** open pagina in mobiel, popup die hele scherm vult bij landen?
- **Fix:** vervang door inline banner, slide-in, of kleinere bovenbalk. Cookie consent + leeftijd-check zijn toegestaan.
- **Bron:** Search docs → Intrusive interstitials

### B6 — Hoofdcontent duidelijk gescheiden [H][A]
- **Check:** is content visueel afgebakend van sidebar/ads/footer? Geen verwarring waar de pagina over gaat?
- **Fix:** layout met duidelijke hierarchie, ads niet door content geweven, sidebar visueel gescheiden
- **Bron:** AI Optimization Guide → page experience

### B7 — Geen schadelijke/storende ads [H]
- **Check:** pop-unders, auto-play met geluid, interstitials tussen content, ad-density te hoog?
- **Fix:** ad-stack opschonen, Better Ads Standards volgen
- **Bron:** Search docs → page experience self-assessment

---

## C. On-page optimalisatie (13 items)

### C1 — Unieke `<title>` tag [C]
- **Check:** HTML-bron, eerste `<title>` in `<head>`. Moet uniek zijn voor deze pagina (vergelijken met andere pagina's).
- **Fix:** schrijf een titel: primaire keyword + waardepropositie, 50-60 chars, niet sensationeel.
- **Bron:** SEO Starter Guide → titles

### C2 — Unieke meta description [H]
- **Check:** `<meta name="description" content="...">` — uniek per pagina, 150-160 chars
- **Fix:** schrijf description die de pagina samenvat + click-trigger. Niet auto-genereren.
- **Bron:** Search docs → snippets

### C3 — Eén H1 per pagina [H]
- **Check:** HTML-bron tellen `<h1>` tags
- **Fix:** maak één H1 die het onderwerp beschrijft. Andere headings worden H2/H3. (Volgorde H2/H3 is volgens Google overigens niet kritisch.)
- **Bron:** SEO Starter Guide → headings

### C4 — Beschrijvende URL [H]
- **Check:** is de URL leesbaar? `/aluminium-schuifpui-prijzen` ja, `/p?id=4738` nee
- **Fix:** URL hernoemen + 301 oude → nieuwe. Bij Next.js: route renamen in `app/`.
- **Bron:** SEO Starter Guide → URLs

### C5 — Content beantwoordt zoekintentie [C][A]
- **Check:** zoek de hoofdquery in Google, wat staat er nu in de top 10? Beantwoordt jouw pagina dat ook (of beter)?
- **Fix:** pagina herschrijven met direct antwoord bovenaan, dan diepere uitwerking
- **Bron:** Helpful Content guidance

### C6 — Originele inhoud (niet gekopieerd) [C]
- **Check:** kopieer een zin, zoek in Google met aanhalingstekens. Komt het elders voor?
- **Fix:** herschrijven met eigen invalshoek, of pagina samenvoegen met origineel + canonical
- **Bron:** Spam policies → scraped content

### C7 — Substantieel + diep [H][A]
- **Check:** beantwoordt de pagina ook de logische vervolgvragen? Of stopt het na de oppervlakte?
- **Fix:** voeg secties toe over: hoe werkt het, wanneer kies je dit, wat kost het, veelgemaakte fouten, vergelijk met alternatief
- **Bron:** Helpful Content guidance

### C8 — Geen keyword stuffing [C]
- **Check:** komt de primaire keyword onnatuurlijk vaak voor? Lees de tekst hardop — klinkt het normaal?
- **Fix:** verwijder herhaling, gebruik synoniemen ("aluminium schuifpui" / "aluminium pui" / "schuifpui van aluminium")
- **Bron:** Spam policies → keyword stuffing

### C9 — Beschrijvende ankertekst op alle links [H]
- **Check:** scan links — "klik hier" / "lees meer" → te generiek
- **Fix:** vervang door "bekijk onze aluminium schuifpui maten" of vergelijkbaar — beschrijft de bestemming
- **Bron:** SEO Starter Guide → anchor text

### C10 — Interne links naar relevante andere pagina's [H]
- **Check:** zijn er 3-10 interne links naar gerelateerde pagina's (niet alleen menu/footer)?
- **Fix:** voeg contextual links in de body toe naar product/categorie/blog-content die relevant is
- **Bron:** SEO Starter Guide → internal linking

### C11 — Alle images hebben alt-tekst [H][A]
- **Check:** HTML-bron → elke `<img>` heeft `alt="..."` die de afbeelding beschrijft
- **Fix:** alt-tekst per image — wat staat erop, niet keyword-spam. Decoratieve images: `alt=""`.
- **Bron:** SEO Starter Guide → images

### C12 — Images geoptimaliseerd (formaat + grootte) [H][A]
- **Check:** image-bestand >200kb? Niet WebP/AVIF? Geen `width`/`height` attributen?
- **Fix:** WebP/AVIF conversie, comprimeren naar <100kb waar mogelijk, lazy loading onder de vouw (`loading="lazy"`), eager + fetchpriority high boven de vouw
- **Bron:** SEO Starter Guide → images + AI Optimization Guide

### C13 — Multimedia aanwezig (image + bij voorkeur video) [A]
- **Check:** zijn er beelden? Bij voorkeur eigen foto's + video voor productpagina's?
- **Fix:** voeg eigen installatie-foto's toe, korte productvideo embedden, infographics
- **Bron:** AI Optimization Guide → "support text with high-quality images and videos"

---

## D. Structured data (6 items)

### D1 — JSON-LD format gebruikt [H][A]
- **Check:** Rich Results Test of HTML-bron `<script type="application/ld+json">`
- **Fix:** als Microdata of geen schema → migreer naar JSON-LD in `<head>`
- **Bron:** Structured data → JSON-LD aanbevolen

### D2 — `Organization` schema op site-niveau [H]
- **Check:** is er `@type: Organization` met naam, logo, contact?
- **Fix:** voeg JSON-LD toe in site-wide header met `Organization`/`LocalBusiness`
- **Bron:** Structured data → Organization

### D3 — Page-type specifiek schema aanwezig [H][A]
- **Check:** matchend met page-type — `Product` voor productpagina, `Article` voor blog, `LocalBusiness` voor contact-pagina, `BreadcrumbList` overal
- **Fix:** genereer + voeg toe per type (zie `references/page-types.md` voor welke schema per type)
- **Bron:** Structured data overview

### D4 — Schema spiegelt zichtbare content [C]
- **Check:** elk veld in JSON-LD ook zichtbaar op de pagina? Geen verzonnen reviews/prijzen?
- **Fix:** verwijder velden die niet op de pagina staan — Google ziet verborgen schema als spam-overtreding
- **Bron:** AI Optimization Guide → "structured data matches visible text"

### D5 — Rich Results Test groen [H]
- **Check:** https://search.google.com/test/rich-results → URL invullen → geen errors/warnings
- **Fix:** errors corrigeren conform output van de tool. Warnings = optioneel, errors = blokkerend.
- **Bron:** Rich Results Test docs

### D6 — Breadcrumb-schema op niet-homepage pagina's [H]
- **Check:** JSON-LD met `@type: BreadcrumbList` met de paginahiërarchie
- **Fix:** toevoegen — verbetert zichtbaarheid in SERP
- **Bron:** Structured data → BreadcrumbList

---

## E. Content kwaliteit, E-E-A-T, helpful content (13 items)

### E1 — Eigen invalshoek / non-commodity [C][A]
- **Check:** zegt deze pagina iets wat de top 10 concurrenten NIET zegt? Eigen ervaring/data/casus?
- **Fix:** voeg toe: eigen prijsranges, eigen klantcase, eigen installatiefoto's, eigen test/review
- **Bron:** AI Optimization Guide → "unique perspective, non-commodity content"

### E2 — First-hand bewijs (Experience-pijler) [H][A]
- **Check:** staan eigen foto's, video's, projectreferenties of casussen op de pagina?
- **Fix:** eigen materiaal toevoegen. Bij Ventasol: installatie-foto's, klantnamen (met toestemming), regio's
- **Bron:** E-E-A-T docs → Experience

### E3 — Auteur-byline aanwezig waar verwacht [H]
- **Check:** blogposts/guides: auteur vermeld? Productpagina's: bedrijfsnaam zichtbaar?
- **Fix:** byline toevoegen met link naar auteurspagina + foto + expertise
- **Bron:** Helpful Content → "Who" framework

### E4 — Auteurspagina bestaat en geeft context [H]
- **Check:** klik op auteur-link → komt er een pagina met achtergrond, expertise, andere artikelen?
- **Fix:** auteurspagina maken (per auteur één URL), bevat: foto, korte bio, expertise, contact/social
- **Bron:** Helpful Content → "Who" framework

### E5 — Contactinfo + business-info zichtbaar [H]
- **Check:** ergens op site (footer/contact-pagina): NAW, telefoon, email, KvK
- **Fix:** complete bedrijfsinfo op contact-pagina + in footer
- **Bron:** E-E-A-T → Trustworthiness

### E6 — Privacy policy + algemene voorwaarden [H]
- **Check:** linkjes in footer naar privacybeleid + AV?
- **Fix:** beide pagina's aanmaken, in footer linken
- **Bron:** E-E-A-T → Trustworthiness

### E7 — Datum laatst bijgewerkt (waar van toepassing) [H][A]
- **Check:** content > 6 maanden oud? Staat er "laatst bijgewerkt" datum?
- **Fix:** datum tonen op blog/guide-pagina's. Update alleen tonen ALS content ook echt veranderd is (anders spam-signaal).
- **Bron:** Helpful Content + AI Optimization Guide → freshness

### E8 — Foutloos NL [C]
- **Check:** spelling + grammatica via grammarly/native NL-check
- **Fix:** spelfouten corrigeren — Google ziet "free of spelling and grammatical mistakes" als kwaliteitssignaal
- **Bron:** Helpful Content guidance

### E9 — Heldere paragraafstructuur [H][A]
- **Check:** paragrafen kort, koppen die de inhoud beschrijven, geen lappen tekst
- **Fix:** opbreken in secties met H2/H3, bullets/tabellen waar passend
- **Bron:** AI Optimization Guide → "human-centered organization"

### E10 — Direct antwoord bovenaan [H][A]
- **Check:** beantwoordt de pagina de hoofdvraag in de eerste paragraaf? Of wordt het pas in de 5e alinea duidelijk?
- **Fix:** lead-paragraaf herschrijven met de direct answer, daarna uitwerking. Dit is wat AI Search extraheert.
- **Bron:** Helpful Content + AI extractability patterns

### E11 — Beantwoordt vervolgvragen (fan-out coverage) [H][A]
- **Check:** voor "aluminium schuifpui kosten" → behandelt de pagina ook: prijs/m², vs kunststof, subsidie, installatie, isolatiewaarde?
- **Fix:** uitbreiden met secties die fan-out queries dekken. Eén pijlerpagina, niet 50 dunne pagina's.
- **Bron:** AI Optimization Guide → query fan-out

### E12 — Geen scaled/AI-only inhoud zonder waarde [C]
- **Check:** is deze pagina AI-gegenereerd zonder eigen review/feiten/foto's? Onderdeel van een serie van 50+ vergelijkbare pagina's?
- **Fix:** ofwel eigen waarde toevoegen (data, foto's, review), ofwel pagina samenvoegen met andere, ofwel verwijderen
- **Bron:** Spam policies → scaled content abuse

### E13 — Geen verborgen tekst of doorway-tactiek [C]
- **Check:** wit-op-wit tekst? Onzichtbare keyword-lijsten? Stedenlijst onderaan?
- **Fix:** direct verwijderen
- **Bron:** Spam policies → hidden text + doorways

---

## Eindstand: pagina is "100%" als

- ALLE C-items (Critical): groen
- ≥ 90% van de H-items (High): groen
- ALLE A-items (AI Search): groen óf bewust uitgesteld met reden

Bij <100% op een non-critical item: log de reden in het pagina-rapport (template). Geen pagina is "klaar" zonder dit rapport.
