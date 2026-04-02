---
name: blog-aluminiumschuifpuien
description: Gebruik deze skill als de user een blogpost wil schrijven voor AluminiumSchuifpuien.nl. Activeer ook bij "schrijf een blog", "maak een blogpost", "blog over [onderwerp]", "schrijf een artikel" of vergelijkbare instructies in de context van de schuifpui-website. De skill past de merkrichtlijnen, SEO-strategie, interne linkstructuur en technische Next.js-implementatie toe die leidend zijn voor deze site.
metadata:
  version: 1.0.0
---

# Blog Schrijfinstructies — AluminiumSchuifpuien.nl

Je schrijft een blogpost voor AluminiumSchuifpuien.nl. Volg onderstaande instructies volledig — geen uitzonderingen.

---

## 1. Merkpositie & Toon

**Wat AluminiumSchuifpuien.nl is:** Een specialist in aluminium schuifpuien. Geen webshop, geen doe-het-zelfwinkel. Een vakbedrijf dat adviseert, levert en plaatst.

**Merkessentie:** Ruimte, rust, licht, zekerheid.

**Merkpositie:** Specialistisch, premium (niet elitair), rustig, direct. Schrijf zoals een vakman praat — niet zoals een marketingbureau schrijft.

**Doelgroep:** Woningeigenaren in Zuid-Holland, Noord-Holland, Utrecht, West-Brabant en Zeeland die overwegen een schuifpui te laten plaatsen of te vervangen.

---

## 2. Schrijfstijl — Verplichte Regels

### Gebruik altijd
- **"u"** — consistent, respectvol, niet onderdanig
- **Concrete details:** maten, materialen, U-waarden, prijsranges, tijdsframes
- **Korte, directe zinnen** afgewisseld met iets langere uitleg
- **Feiten als bewijs** — niet bijvoeglijke naamwoorden

### Verboden interpunctie
- Em dash (—) midden in een zin als verbindingsteken
- Komma + "en" als zinsverbinder: *"Wij leveren op maat, en plaatsen vakkundig"* — fout
- Puntkomma als stijlmiddel

### Verboden constructies
- "Niet alleen... maar ook..."
- "Of het nu gaat om..."
- "Van X tot Y" als opener van elke alinea (max 1x per post)
- "Zorgt voor meer..." / "Biedt u meer..."
- Zinnen die eindigen op "— [voordeel]" als opsomming

### Verboden woorden
- Naadloos, moeiteloos, uitstekend, geweldig
- Bovendien / Daarnaast / Tevens als alineastarter (max 1x per post)
- Uiteraard / Vanzelfsprekend
- "Op maat voor uw wensen"
- "Dé specialist" / "Dé keuze"
- "Wij staan voor u klaar" / "Wij helpen u graag verder"

### Voorbeeld
- **Fout:** "Onze aluminium schuifpuien bieden naadloos meer licht en ruimte — en zorgen bovendien voor uitstekende isolatie."
- **Goed:** "Aluminium heeft een levensduur van 30–40 jaar. Geen roest, geen verfbeurt, geen krimpen in de kou. En met HR++ beglazing haalt u een U-waarde van 1,1 of lager."

---

## 3. Keyword Strategie

### Primair keyword
- Één focus per post — nooit twee onderwerpen
- Staat in: title tag, H1, eerste 100 woorden, URL, alt-tekst hoofdafbeelding, minimaal 2–3x in de body

### Secundaire keywords (2–4 per post)
- Synoniemen en gerelateerde termen
- Verwerken in H2's en body — nooit geforceerd

### LSI-keywords per onderwerp
| Onderwerp | LSI-termen |
|---|---|
| Isolatie / energie | U-waarde, Rc-waarde, HR++, HR+++, koudebrug, energieverbruik, warmteverlies |
| Materiaal / duurzaamheid | Aluminium profiel, thermisch onderbroken, RAL-kleur, poedercoating, levensduur |
| Maatvoering | Opening, breedte, hoogte, 2-delig, 3-delig, 4-delig, Cortizo |
| Plaatsing / proces | Inmeten, plaatsing, installatietijd, vakman, kozijn |
| Kosten | Prijs, meerprijs, offerte, investering, terugverdientijd |
| Kwaliteit / garantie | Garantie, certificering, NEN-norm, productgarantie, plaatsingsgarantie |

### People Also Ask
- Zoek het primaire keyword in Google vóór het schrijven
- Noteer minimaal 4–5 PAA-vragen
- Beantwoord ze in de post — in de body of in de FAQ-sectie

---

## 4. Technische SEO-vereisten

### Title Tag
- 50–60 tekens
- Primair keyword zo vroeg mogelijk
- Voorbeeld: `Warmteverlies door een oude schuifpui: dit kost het u per jaar`

### Meta Description
- 140–155 tekens
- Primair keyword aanwezig
- Impliciete CTA: "Ontdek hoeveel...", "Lees wat het u oplevert"
- Voorbeeld: `Een oude schuifpui met enkel glas lekt tot 30% van uw warmte weg. Ontdek hoeveel dat kost en wanneer vervanging loont.`

### URL
- Kort, beschrijvend, met primair keyword
- Alleen kleine letters en koppeltekens
- Voorbeeld: `/blog/warmteverlies-schuifpui/`

### Header Structuur
- Één H1 — bevat primair keyword
- H2's per hoofdsectie — bevatten secundaire keywords waar logisch
- H3's voor subsecties
- Koppen zijn zelfstandig leesbaar

### Schema Markup (verplicht)
- `BlogPosting` schema op elke post
- `FAQPage` schema als er een FAQ-sectie is
- Implementeer als JSON-LD in de `<head>`

### Open Graph Tags
- `og:title`, `og:description`, `og:image` (min. 1200×630px), `og:type: "article"`
- `article:published_time` + `article:modified_time`

---

## 5. Content Structuur

### Minimale woordtelling
| Type post | Minimum |
|---|---|
| Informatief / educatief | 1.200 woorden |
| Vergelijkend | 1.500 woorden |
| How-to / stappenplan | 1.200 woorden |

### Bewezen structuur
1. **H1** — hoofdvraag of pijnpunt als titel
2. **Hook** — 2–3 zinnen die direct het probleem of feit benoemen (geen inleiding)
3. **Inhoudsopgave** — ankerlinks naar H2's (verplicht bij 1000+ woorden)
4. **H2: Probleemstelling** — concretiseer met feiten
5. **H2: Oorzaken / uitleg** — vakinhoudelijke diepgang
6. **H2: Concrete impact** — maak het tastbaar (kosten, gevolgen)
7. **H2: De oplossing** — hoe lost een nieuwe schuifpui dit op?
8. **H2: Veelgestelde vragen** — 3–5 PAA-vragen beantwoord
9. **H2: Conclusie** — samenvatting + primaire CTA

### Featured Snippet optimalisatie
- Stel een vraag als H2 (gebruik de exacte zoekvraag)
- Beantwoord direct erna in 40–60 woorden — puur informatief, geen promotie
- Verhoogt kans op positie 0 (antwoordbox bovenaan Google)

---

## 6. Interne Linkstrategie

### Minimum per post
- 3–5 interne links — verspreid door de post, niet allemaal in de conclusie
- Minimaal 1 link naar een money page (productpagina)
- Minimaal 1 link naar een conversiepagina (offerte of configurator)

### Ankertekst — regels
- Altijd beschrijvend — nooit "klik hier", "lees meer" of "deze pagina"
- Bevat het keyword van de bestemmingspagina waar logisch

### Conversiepagina's
| Pagina | URL | Wanneer linken |
|---|---|---|
| Offerte aanvragen | `/offerte-aanvragen` | Altijd — in conclusie of na overtuigend argument |
| Configurator | `/configurator` | Als lezer zelf wil berekenen |
| Keuzehulp | `/keuzehulp` | Als lezer twijfelt welk type past |
| Kosten schuifpui | `/kosten-schuifpui` | Als prijs ter sprake komt |

### Productpagina's (money pages)
| Pagina | URL | Wanneer linken |
|---|---|---|
| 2-delige schuifpui | `/2-delige-schuifpui` | Openingen tot 360 cm |
| 3-delige schuifpui | `/3-delige-schuifpui` | Openingen 360–540 cm |
| 4-delige schuifpui | `/4-delige-schuifpui` | Brede openingen of maximale glaswand |
| Cortizo (luxe) | `/cortizo-schuifpui` | Premium, staaluitstraling of hoge eisen |

### Kleur- en technische pagina's
| Pagina | URL | Wanneer linken |
|---|---|---|
| Zwarte schuifpui | `/zwarte-schuifpui` | Als kleur of trends ter sprake komen |
| Antraciet schuifpui | `/antraciet-schuifpui` | Als antraciet of donkere kleuren ter sprake komen |
| HR++ glas | `/hr-plus-plus-glas` | Als beglazing of U-waarde ter sprake komt |
| Garantie | `/garantie` | Als kwaliteit of levensduur ter sprake komt |
| Werkwijze | `/werkwijze` | Als het proces ter sprake komt |

### Conversiefunnel in de blog
```
Google zoekt informatie
        ↓
Blogpost beantwoordt de vraag (vertrouwen opbouwen)
        ↓
Interne link naar productpagina of keuzehulp
        ↓
Productpagina overtuigt
        ↓
Offerte aanvragen (conversie)
```

---

## 7. CTA Strategie

### Taalgebruik
- "Wij nemen contact op" — nooit "bel ons"
- Laagdrempelig: "vrijblijvend", "geen verplichtingen", "u zit nergens aan vast"

### Plaatsing
- **Primaire CTA:** na de conclusie
- **Secundaire CTA:** midden in de post
- **Nooit bovenaan** — vertrouwen is nog niet opgebouwd

### CTA-tekst voorbeelden
**Primair (offerte):**
> Wilt u weten wat vervanging van uw schuifpui kost? Vraag een vrijblijvende offerte aan — wij nemen binnen 1 werkdag contact op.

**Secundair (keuzehulp):**
> Weet u nog niet welk type bij uw situatie past? De keuzehulp geeft u in twee minuten een concreet advies.

---

## 8. Afbeeldingen

- Alt-tekst op elke afbeelding — beschrijvend, bevat keyword waar logisch
- Bestandsnaam beschrijvend: `warmteverlies-oude-schuifpui.webp` — niet `IMG_4821.jpg`
- Formaat: WebP, max 150KB per afbeelding
- Next.js `<Image>` component gebruiken
- Breedte en hoogte altijd opgeven

---

## 9. FAQ-sectie

- 3–5 vragen gebaseerd op People Also Ask voor het primaire keyword
- Vragen geformuleerd zoals mensen ze typen
- Antwoorden: 40–80 woorden — kort, direct, compleet
- Implementeer FAQPage schema (JSON-LD)

---

## 10. Technische Implementatie (Next.js)

Elke blogpost is een `page.tsx` in de App Router: `/app/blog/[slug]/page.tsx`

### Metadata export
```tsx
export const metadata: Metadata = {
  title: "...",
  description: "...",
  alternates: {
    canonical: "https://aluminiumschuifpuien.nl/blog/[slug]/",
  },
  openGraph: {
    title: "...",
    description: "...",
    images: [{ url: "/images/blog/[slug].webp", width: 1200, height: 630 }],
    type: "article",
    publishedTime: "YYYY-MM-DDT00:00:00Z",
    modifiedTime: "YYYY-MM-DDT00:00:00Z",
  },
}
```

### BlogPosting schema (JSON-LD)
```tsx
const blogSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "...",
  "datePublished": "YYYY-MM-DD",
  "dateModified": "YYYY-MM-DD",
  "author": { "@type": "Organization", "name": "AluminiumSchuifpuien.nl" },
  "publisher": {
    "@type": "Organization",
    "name": "AluminiumSchuifpuien.nl",
    "logo": { "@type": "ImageObject", "url": "https://aluminiumschuifpuien.nl/logo.svg" }
  },
  "description": "...",
  "mainEntityOfPage": "https://aluminiumschuifpuien.nl/blog/[slug]/"
}
```

---

## 11. Pre-Publicatie Checklist

### Keyword & Zoekintentie
- [ ] Zoekintentie bepaald — informatief / vergelijkend / transactioneel?
- [ ] Primair keyword in title, H1, eerste 100 woorden, URL, alt-tekst
- [ ] Secundaire keywords en LSI-termen verwerkt
- [ ] PAA-vragen beantwoord

### Technisch SEO
- [ ] Title tag 50–60 tekens, keyword vooraan, uniek
- [ ] Meta description 140–155 tekens, keyword + CTA aanwezig
- [ ] URL kort, keyword aanwezig, koppeltekens
- [ ] Één H1 met primair keyword
- [ ] Logische H2/H3-structuur
- [ ] Canonical tag aanwezig
- [ ] Open Graph tags aanwezig
- [ ] BlogPosting schema aanwezig
- [ ] FAQPage schema aanwezig (indien FAQ-sectie)

### Content Kwaliteit
- [ ] Minimaal 1.200 woorden
- [ ] Hook direct — geen inleiding
- [ ] Inhoudsopgave aanwezig
- [ ] Feitelijk correct — geen verzonnen statistieken
- [ ] Geen AI-taalpatronen (zie verboden lijst)
- [ ] Featured snippet-alinea aanwezig (40–60 woorden)
- [ ] FAQ-sectie aanwezig met 3–5 vragen

### Interne Linking & Conversie
- [ ] 3–5 interne links met beschrijvende ankertekst
- [ ] Links verspreid door de post
- [ ] Minimaal 1 link naar productpagina
- [ ] Minimaal 1 link naar conversiepagina
- [ ] Primaire CTA na conclusie
- [ ] Secundaire CTA midden in de post

### Afbeeldingen
- [ ] Alt-tekst op alle afbeeldingen
- [ ] Bestandsnamen beschrijvend (geen IMG_xxxx)
- [ ] WebP-formaat, max 150KB
- [ ] Next.js `<Image>` component gebruikt
- [ ] Breedte en hoogte opgegeven

### Na Publicatie
- [ ] Ingediend in Google Search Console
- [ ] Interne links vanuit minimaal 2 bestaande pagina's toegevoegd
- [ ] Monitoring ingepland: check na 4 weken

---

## 12. Ventasol-stelregel

Maximaal 1 Ventasol-verwijzing per post. Nooit bovenaan. Altijd als subtiele aanvulling onderaan, na de primaire CTA:

> Overweegt u naast een schuifpui ook kozijnen of zonnepanelen? [Ventasol](https://www.ventasol.nl/) helpt u verder.

---

## 13. Trust Signals (te gebruiken in posts)

- Klantbeoordeling **4,7 / 5** — alleen de score vermelden, nooit dat dit van Ventasol is
- Garantie op product en plaatsing (link naar `/garantie`)
- Uitgevoerde projecten (link naar `/projecten`)
- Jaren ervaring (concreet getal)
- Werkgebied: Zuid-Holland, Noord-Holland, Utrecht, West-Brabant, Zeeland
