---
name: blog-kozijnstore
description: Gebruik deze skill als de user een kennisbank-artikel of blogpost wil schrijven voor Kozijnstore.nl. Activeer bij "schrijf een artikel/blog voor kozijnstore", "kennisbank-artikel over [onderwerp]", "content voor kozijnstore" of vergelijkbare instructies in de context van de kozijnen-website. De skill past de merkrichtlijnen, de 2026-informatielat, de interne linkstructuur en de kennisbank-infrastructuur (ArtikelLayout + registry) toe.
metadata:
  version: 1.0.0
---

# Kennisbank-artikelen — Kozijnstore.nl

Je schrijft een kennisbank-artikel voor Kozijnstore.nl. Volg deze instructies volledig. Lees bij twijfel ook `projects/kozijnstore.nl/CLAUDE.md` (merkregels) — bij conflict wint dat bestand.

---

## 0. De 2026-lat (waarom dit artikel bestaansrecht moet hebben)

Google's scaled-content-beleid straft AI-tekst die niets toevoegt. Elk artikel moet **informatiewinst** leveren die de 50 concurrerende AI-blogs niet hebben. Concreet, minstens 2 van deze:
- Echte cijfers met herkomst: subsidiebedragen 2026 (ISDE ~€27/m² HR++, ~€43/m² triple, max €1.500 per maatregel), richtprijsranges uit de eigen configurator, energiebesparing (~€500/jr), doorlooptijden (8-12 weken), montagedagen (1 werkdag per 3-5 kozijnen).
- Praktijkkennis die alleen een installateur weet: wat een monteur aantreft bij vooroorlogse woningen, waarom houtrot vaak bij de onderdorpel begint, welke wijken welstandseisen hebben.
- Een beslisbaar antwoord: de lezer kan na het lezen iets kiezen of berekenen, niet alleen "contact opnemen".
- Actualiteit: regels/bedragen van dít jaar, met jaartal benoemd.

**Verboden:** verzonnen statistieken, `{stad}`-invuloefeningen, samenvattingen van wat elders op de site al staat.

**Financiering via de gemeente (SVn-leningen, sinds 2026-09-03):** feiten met peildatum, schrijfregels en de stand per regiopagina staan in `projects/kozijnstore.nl/FINANCIERING-SVN.md` (goedgekeurde feitenbron naast de sitepagina's). Lening is nooit subsidie; "renteloos" alleen Warmtefonds onder 60.000 euro inkomen; rente altijd met bron + peildatum; of kozijnen meetellen bepaalt de gemeenteverordening. Warmtefonds-cijfers: `/betalen-in-termijnen`.

## 0b. Anti-kannibalisatie (HARD)

Deze pagina's bestaan al en zijn de money-/infopages. Een kennisbank-artikel mag hun keyword NIET als primair keyword nemen — je linkt ernaar in plaats van ermee te concurreren:

| Bestaande pagina | Bezet keyword |
|---|---|
| `/kozijnen-vervangen-kosten` | kozijnen vervangen kosten/prijs |
| `/subsidie-kozijnen` | subsidie kozijnen |
| `/kozijnen-energiebesparing` | kozijnen energiebesparing |
| `/kozijnen-vergunning` | kozijnen vergunning |
| `/kozijnen-onderhoud` | kozijnen onderhoud (hoofdterm) |
| `/kunststof-kozijnen`, `/aluminium-kozijnen`, `/houten-kozijnen` | materiaal-hoofdtermen |
| `/kozijnen-<stad>` (28 steden) | kozijnen + stad |

Kennisbank = **long-tail eromheen**: "houtrot kozijn repareren of vervangen", "kozijnen vervangen in een huurwoning", "wat is een koudebrug", "draaikiepraam scharnier afstellen", "kozijnen vervangen volgorde verbouwing", enz. Check vóór het schrijven `lib/kennisbank.ts` of het onderwerp al bestaat.

---

## 1. Merk & toon

- **Aanspreekvorm: "je"** — consistent (harde kozijnstore-regel; anders dan alu dat "u" gebruikt).
- Vertrouwd, helder, ontzorgend. Schrijf zoals een goede vakman uitlegt, niet zoals een bureau schrijft.
- Feiten als bewijs, geen bijvoeglijke naamwoorden.
- **Geen vaste prijzen** — alleen richtprijzen/ranges ("reken op € X tot € Y").

### Verboden taalpatronen (zelfde lijst als de site)
- Em dash (—) midden in een zin; komma + "en" als zinsverbinder; puntkomma als stijlmiddel
- "Niet alleen... maar ook...", "Of het nu gaat om...", "Zorgt voor meer...", "Van X tot Y" als opener (max 1x)
- Naadloos, moeiteloos, uitstekend, geweldig, uiteraard, vanzelfsprekend, "dé specialist", "wij staan voor je klaar"
- Bovendien/Daarnaast/Tevens als alineastarter (max 1x per artikel)

---

## 2. Keyword & structuur

- **Eén primair long-tail keyword** per artikel: in title, H1, eerste 100 woorden, slug, 2-3x body.
- **Neem het keyword uit de `[kw: ...]`-stempel bij het onderwerp in `CONTENT-BACKLOG.md`** (vooraf
  gevalideerd tegen echte zoekvraag uit onze Google Ads-zoektermen). Verzin geen eigen keyword en
  volg een waarschuwing in de stempel (bijv. "niet 'draaikiepraam' claimen, dat is een productpagina").
  Geen stempel? Valideer eerst met `node scripts/_keyword-research.mjs "<keyword>"` in `wecall-app/`
  (zie de backlog-uitleg). **ads-blind** = informatievraag zonder Ads-data, prima; **zwak** = alleen
  met een écht unieke invalshoek.
- Zoek vóór het schrijven de People Also Ask-vragen bij het keyword; beantwoord er 3-5 (body of FAQ).
- **Minimaal 1.200 woorden** (vergelijkend: 1.500).
- Structuur: hook (2-3 zinnen, direct het probleem, geen inleiding) → probleemstelling → uitleg/oorzaken → concrete impact (euro's, gevolgen) → oplossing → FAQ → conclusie. Featured-snippet-alinea: exacte zoekvraag als H2, direct beantwoord in 40-60 woorden.
- Title 50-60 tekens; beschrijving 140-155 tekens met impliciete CTA.

---

## 3. Interne links (minimaal 5, verspreid)

Altijd: ≥1 money-page + ≥1 conversiepagina + `/garantie` of `/werkwijze` waar logisch. Beschrijvende ankerteksten, nooit "klik hier".

| Doel | URL |
|---|---|
| Offerte (conversie) | `/offerte-aanvragen` |
| Configurator (zelf rekenen) | `/configurator` |
| Keuzehulp (twijfel) | `/keuzehulp` |
| Materialen (money) | `/kunststof-kozijnen`, `/aluminium-kozijnen`, `/houten-kozijnen` |
| Kosten/subsidie/vergunning/onderhoud/energie | zie tabel §0b |
| Raamtypen | `/kozijntypen/draairamen`, `/kozijntypen/draaikiepramen`, `/kozijntypen/valramen`, `/kozijntypen/schuiframen`, `/kozijntypen/stolpramen`, `/kozijntypen/vaste-ramen` |
| Schuifpuien / voordeuren | `/schuifpuien/...`, `/voordeuren/...` |
| Geo (alleen als een stad/regio inhoudelijk ter sprake komt) | `/kozijnen-<stad>` |

CTA-taal: "wij nemen contact op", vrijblijvend. De ArtikelLayout plaatst de eind-CTA automatisch; zet zelf 1 tekstuele secundaire link halverwege.

---

## 4. Technische implementatie (de infra doet het zware werk)

Elk artikel = **twee wijzigingen**, verder niets:

**A. Registry-entry** in `site/lib/kennisbank.ts` (nieuwste bovenaan):
```ts
{
  slug: "houtrot-kozijn-repareren-of-vervangen",
  titel: "Houtrot in je kozijn: repareren of vervangen?",
  beschrijving: "Zo herken je of houtrot nog te repareren is en wanneer vervangen goedkoper is. Met richtprijzen en een simpele zelfcheck.",
  categorie: "onderhoud",   // kosten | subsidie | onderhoud | materialen | regelgeving | verduurzaming
  gepubliceerd: "2026-07-14",
  leestijdMin: 6,
  // VERPLICHT sinds 2026-07-14: hero-afbeelding uit site/public/images.
  // Kies een beeld dat het ONDERWERP toont (geen willekeurige sfeerplaat);
  // browse de mappen images/detail, images/projecten-echt, images/werkwijze,
  // images/interieur. Alt = beschrijvend, met het onderwerp erin.
  afbeelding: {
    src: "/images/projecten-echt/voor-na-monumentaal-houten-kozijnen-gerestaureerd.png",
    alt: "Links een houten kozijn met houtrot, rechts een vervangen kozijn in dezelfde gevel",
  },
},
```

**B. Pagina** `site/app/kennisbank/<slug>/page.tsx`:
```tsx
import type { Metadata } from "next";
import Link from "next/link";
import ArtikelLayout from "@/components/kennisbank/ArtikelLayout";
import { vindArtikel, artikelUrl } from "@/lib/kennisbank";

const SLUG = "<slug>";
const artikel = vindArtikel(SLUG)!;

export const metadata: Metadata = {
  title: artikel.titel,
  description: artikel.beschrijving,
  alternates: { canonical: artikelUrl(SLUG) },
  openGraph: { title: artikel.titel, description: artikel.beschrijving, url: artikelUrl(SLUG), type: "article" },
};

const faq = [ { q: "...", a: "..." } ]; // 3-5 PAA-vragen, antwoorden 40-80 woorden

export default function Page() {
  return (
    <ArtikelLayout slug={SLUG} faq={faq}>
      {/* Semantische HTML: h2/h3/p/ul/table. Styling komt uit .kb-prose. */}
      {/* Tabel altijd in <div className="kb-tabel-scroll">...</div> */}
      {/* Uitgelicht kader: <div className="kb-kader">...</div> */}
    </ArtikelLayout>
  );
}
```

De layout regelt automatisch: Article- + BreadcrumbList- + FAQPage-schema, breadcrumbs, categorie-chip, leestijd/datum, eind-CTA, gerelateerde artikelen, én de hero-afbeelding + listing-thumbnail uit het `afbeelding`-veld (ook in het Article-schema). **De sitemap leest de registry** — daar hoef je niets voor te doen. Canonical-vorm: altijd `https://www.kozijnstore.nl/...` zonder trailing slash.

Voeg in de metadata wél de og:image toe uit de registry (vast patroon, staat al in alle bestaande artikelen):
```tsx
  openGraph: {
    title: artikel.titel,
    description: artikel.beschrijving,
    url: artikelUrl(SLUG),
    type: "article",
    ...(artikel.afbeelding
      ? { images: [{ url: `https://www.kozijnstore.nl${artikel.afbeelding.src}` }] }
      : {}),
  },
```

---

## 5. Workflow & gates

1. Check `lib/kennisbank.ts` op overlap; kies het long-tail keyword (§0b).
2. Schrijf registry-entry + pagina.
3. `npm run build` in `site/` — moet groen zijn.
4. **Review-gate: Daan keurt op localhost** (of leest de tekst) vóór commit/push. Nooit zelfstandig publiceren. UITZONDERING (besluit Daan 2026-07-14): de geautoriseerde ma/wo/vr-cloudroutine publiceert volautomatisch mits al haar gates + build groen zijn; onderwerpen uit `CONTENT-BACKLOG.md` in de repo-root.
5. Na akkoord: commit + push (auto-deploy via Vercel). Interne links vanuit ≥1 bestaande pagina naar het nieuwe artikel toevoegen waar logisch.

### Pre-publicatie checklist
- [ ] Informatiewinst aantoonbaar (≥2 elementen uit §0) en geen kannibalisatie (§0b)
- [ ] "je"-vorm, geen verboden patronen, geen vaste prijzen
- [ ] ≥1.200 woorden; hook zonder inleiding; featured-snippet-alinea
- [ ] Primair keyword in title/H1/eerste 100 woorden/slug
- [ ] FAQ 3-5 vragen (PAA), antwoorden 40-80 woorden
- [ ] ≥5 interne links verspreid, ≥1 money + ≥1 conversie
- [ ] Registry-entry + pagina + build groen
- [ ] Ventasol-verwijzing: maximaal 1, alleen onderaan, nooit in de hero
