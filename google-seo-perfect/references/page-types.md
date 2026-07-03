# Per-pagetype variaties

Niet elk item uit de 47-puntenchecklist is even relevant voor elk type pagina. Hieronder per type: welke extra eisen gelden + welk schema verplicht is.

---

## 1. Homepage

**Extra zwaar wegende items:**
- E1 (eigen invalshoek) — homepage is het visitekaartje, mag niet generiek
- E5 (contactinfo zichtbaar) — direct vindbaar
- C5 (zoekintentie) — de homepage moet duidelijk maken: wat doe je, voor wie, in welke regio
- D2 (Organization schema) — verplicht hier

**Verplichte structured data:**
- `Organization` of `LocalBusiness` (LocalBusiness voor lokaal-georiënteerde bedrijven)
- `WebSite` met `potentialAction` (sitelinks searchbox als relevant)

**Specifieke checks:**
- Hero met directe boodschap (geen vage slogan)
- Trust-signalen zichtbaar (reviews, klantcount, certificaten, jaartal opgericht)
- Duidelijke navigatie naar de top-categorieën

---

## 2. Categorie-pagina (bv. /aluminium-schuifpuien, /kozijnen)

**Extra zwaar wegende items:**
- C5 (zoekintentie) — vaak grootste zoekvolume, moet de "[product] categorie"-query dekken
- C7 (substantieel + diep) — niet alleen een productlijst, ook context/uitleg
- E10 (direct antwoord bovenaan) — wat is dit product, voor wie, welke varianten

**Verplichte structured data:**
- `BreadcrumbList`
- `ItemList` met de producten in de categorie (optioneel maar krachtig)

**Specifieke checks:**
- Categorie-tekst boven of onder de productlijst (200-500 woorden context)
- Filters/sorteer-opties met crawlable URLs (geen JS-only state)
- Pagination correct: `rel="next"`/`rel="prev"` of single canonical
- Geen duplicate content tussen categorie + tag-pagina's

---

## 3. Productpagina

**Extra zwaar wegende items:**
- E2 (first-hand bewijs) — eigen productfoto's, niet stock
- C12 (image optimalisatie) — vaak veel images, performance-impact
- D4 (schema spiegelt content) — prijs/voorraad in schema moet matchen wat zichtbaar is
- C13 (multimedia) — Google waardeert video/360-view op productpagina's extra

**Verplichte structured data:**
- `Product` met: name, image, description, brand, sku, offers (price, availability, priceCurrency)
- `AggregateRating` + `Review` als je echte reviews hebt (NIET verzinnen — spam-overtreding)
- `BreadcrumbList`

**Specifieke checks:**
- Prijs zichtbaar (Google's AI Search en Merchant Center waarderen prijstransparantie)
- Voorraad/leverstatus zichtbaar
- Specs in tabel-format (extractable voor AI Search)
- FAQ-sectie met productspecifieke vragen
- Geen letterlijk overgenomen fabrikant-tekst (= thin affiliation spam-risico)

---

## 4. Blog / content-artikel

**Extra zwaar wegende items:**
- E1 (eigen invalshoek) — content-marketing zonder eigen visie is commodity
- E2 (first-hand) — bij how-to/review: laat zien dat je het zelf gedaan hebt
- E3 (auteur-byline) — verplicht
- E7 (datum) — verplicht
- E11 (vervolgvragen) — pijlerstructuur

**Verplichte structured data:**
- `Article` of `BlogPosting` met: headline, image, datePublished, dateModified, author (met `@type: Person`), publisher (met `@type: Organization`)
- `BreadcrumbList`

**Specifieke checks:**
- Author met expertise zichtbaar voor de lezer
- Featured image met goede alt-tekst
- Inhoudsopgave voor langere artikelen (>1500 woorden)
- Related posts links onderaan
- Reading time / publish date / update date duidelijk

---

## 5. Lokale pagina (bv. /aluminium-schuifpui-rotterdam)

**LET OP: spam-risico hoog.** Alleen bouwen als de pagina daadwerkelijk unieke waarde voor die locatie biedt. Anders = doorway abuse.

**Wat ECHT moet voor een legitieme lokale pagina:**
- Eigen klantcases/projecten in die plaats/regio
- Eigen team/showroom info voor die locatie als die bestaat
- Lokale prijsindicatie of subsidie-info specifiek voor die regio
- Lokale reviews
- Andere call-to-action of contactgegevens dan generieke pagina

**Wat een lokale pagina tot doorway maakt:**
- Alleen plaatsnaam variabel, rest tekst identiek
- Geen eigen content/foto's/data voor de locatie
- 50+ lokale pagina's voor élke plaats in NL

**Verplichte structured data:**
- `LocalBusiness` met `address` (met `addressLocality` matchend met de pagina) + `geo` coördinaten
- `BreadcrumbList`

**Vuistregel:** Liever 5-10 sterke regio-pagina's (Randstad, Brabant, Noord-Holland, etc.) dan 400 stadspagina's.

---

## 6. Service / dienstenpagina (bv. /warmtepomp-installatie)

**Extra zwaar wegende items:**
- E2 (first-hand) — laat installatie-foto's, eigen monteurs, eigen werkprocessen zien
- C7 (substantieel) — service-pagina's worden vaak te dun, voeg proces/wat te verwachten/garantie toe
- E10 (direct antwoord) — wat is de dienst, voor wie, wat kost het ongeveer

**Verplichte structured data:**
- `Service` met `provider` (= Organization), `serviceType`, `areaServed`
- `LocalBusiness` (referentie naar het bedrijf)
- `BreadcrumbList`

**Specifieke checks:**
- USP's onder elkaar (proces, garantie, ervaringsjaren)
- Reviews/testimonials voor die specifieke dienst
- FAQ over kosten, doorlooptijd, vergunningen
- Lead-formulier of duidelijke contact-CTA

---

## 7. Contact / over / over-ons-pagina

**Extra zwaar wegende items:**
- E5 (contactinfo) — verplicht, volledig
- E6 (privacy/AV) — verplicht in footer
- D2 (Organization schema) — verplicht
- E3 (auteur/team info) — laat het team zien (foto's, namen, rollen)

**Verplichte structured data:**
- `Organization` of `LocalBusiness` (volledig: address, contactPoint, sameAs naar social profiles)
- `BreadcrumbList`

**Specifieke checks:**
- Adres + telefoon + email + KvK + BTW-nummer
- Openingstijden (gestructureerd)
- Foto's van het pand/team — bouwt trust
- Routebeschrijving / Google Maps embed
- Link naar Google Business Profile

---

## 8. Footer / policy-pagina's (privacy, voorwaarden, cookies)

**Lage prioriteit voor SEO, hoge prioriteit voor trust + legaal.**

**Verplichte items:**
- Bestaan + toegankelijk vanaf elke pagina
- HTTPS
- Indexable (mag in index)
- Wel: `noindex` mag overwogen worden voor "Bedankt"-pagina's na conversie

**Geen schema nodig.**

---

## Beslisboom: welke schema kies ik?

```
Is het de homepage?           → Organization + WebSite
Is het een productpagina?     → Product + BreadcrumbList (+ AggregateRating als reviews)
Is het een blogpost?          → Article + BreadcrumbList
Is het een dienst?            → Service + LocalBusiness ref
Is het een lokale pagina?     → LocalBusiness + BreadcrumbList
Is het een categoriepagina?   → BreadcrumbList (+ optioneel ItemList)
Is het een FAQ-pagina?        → FAQPage (alleen als FAQ ook zichtbaar is)
Is het een how-to?            → HowTo + BreadcrumbList
Anders                        → BreadcrumbList (bijna altijd nuttig)
```

Test ALLES met Rich Results Test voor je het livezet.
