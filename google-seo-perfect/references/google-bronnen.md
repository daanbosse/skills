# Google-bronnen — directe quotes per onderwerp

Voor als Javi (of een klant) vraagt "waarom dit?" — hier staat per stelling de letterlijke Google-quote met URL.

---

## AI Search = SEO

> "The best practices for SEO remain relevant for AI features in Google Search (such as AI Overviews and AI Mode). There are no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary."

Bron: https://developers.google.com/search/docs/appearance/ai-features

> "From Google Search's perspective, optimizing for generative AI search is optimizing for the search experience, and thus still SEO."

Bron: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide

---

## Mythes ontkracht door Google zelf

### llms.txt
> "You don't need to create new machine readable files, AI text files, markup, or Markdown to appear in generative AI search."

Bron: AI Optimization Guide (mei 2026)

### Chunking
> "There's no requirement to break your content into tiny pieces for AI to better understand it."

Bron: AI Optimization Guide

### Aparte AI-schrijfstijl
> "You don't need to write in a specific way just for generative AI search."

Bron: AI Optimization Guide

### Speciale AI-schema
> "Structured data isn't required for generative AI search, and there's no special schema.org markup you need to add."

Bron: AI Optimization Guide

### Long-tail keyword pagina's
> "AI systems can understand synonyms and general meanings... you don't have to worry that you don't have enough long-tail keywords."

Bron: AI Optimization Guide

### Brand mentions kunstmatig pushen
> "Seeking inauthentic 'mentions' across the web isn't as helpful as it might seem."

Bron: AI Optimization Guide

---

## Spam-categorieën (relevante voor nichesites)

### Scaled content abuse
> "Scaled content abuse is when many pages are generated for the primary purpose of manipulating search rankings and not helping users... Using generative AI tools to generate many pages without adding user value."

Bron: https://developers.google.com/search/docs/essentials/spam-policies

### Doorway abuse
> "Doorways are sites or pages created to rank for specific, similar search queries. They lead users to intermediate pages that are not as useful as the final destination."

Voorbeelden Google geeft: meerdere domeinen per regio die naar één pagina trechteren.

Bron: Spam policies

### Hidden text
Verboden: wit op wit, off-screen positioning, font-size 0, opacity 0. Wat wél mag: accordions, tabs, tooltips, screen-reader-only tekst.

Bron: Spam policies

### Thin affiliation
Affiliate-pagina's met letterlijk gekopieerde merchant-beschrijvingen zonder eigen test/review/vergelijking.

Bron: Spam policies

---

## E-E-A-T

> "Trust is most important. The other aspects... contribute to trust but aren't necessarily all required."

E-E-A-T is **geen direct ranking-signaal**:
> "No, it's not [a ranking factor]."

Bron: SEO Starter Guide + Quality Rater Guidelines

---

## Core Web Vitals

| Metric | Drempel |
|---|---|
| LCP | < 2,5 sec |
| INP | < 200 ms |
| CLS | < 0,1 |

Gemeten op 75e percentiel, gesplitst mobile/desktop.

> "Achieve good Core Web Vitals for success with Search."

Maar ook: goed scoren "doesn't guarantee that your pages will rank at the top". Eén signaal van vele.

Bron: https://developers.google.com/search/docs/appearance/core-web-vitals

---

## Indexering — minimum eisen

1. Googlebot niet geblokkeerd.
2. HTTP 200 success.
3. Ondersteund bestandstype, geen spam.

> "Just because a page meets these requirements doesn't mean that a page will be indexed; indexing isn't guaranteed."

Bron: Search Essentials → Technical requirements

---

## Structured data

> "Markup [should be] for content that's visible to users."

Verborgen markup = overtreding.

> "Fewer but complete and accurate recommended properties" werkt beter dan onvolledige uitgebreide markup.

Bron: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data

---

## AI-content

> "Appropriate use of AI or automation is not against our guidelines."

Probleem = schaal-zonder-waarde, niet AI op zich. Voor AI-gegenereerde product-images: gebruik IPTC `DigitalSourceType` metadata met `TrainedAlgorithmicMedia`.

Bron: https://developers.google.com/search/docs/fundamentals/using-gen-ai-content + feb 2023 blog

---

## Page experience

Google's self-assessment voor page experience:
- Goede CWV?
- HTTPS?
- Mobiel goed?
- Geen intrusive interstitials?
- Hoofdcontent duidelijk gescheiden?
- Geen overdaad aan ads?

Bron: https://developers.google.com/search/docs/appearance/page-experience

---

## Wat NIET werkt (uit SEO Starter Guide, "things not to focus on")

| Tactiek | Quote |
|---|---|
| Meta keywords tag | "Google Search doesn't use the keywords meta tag." |
| Keyword-rijke domeinnaam | "Hardly any effect beyond appearing in breadcrumbs." |
| TLD-keuze | "Usually a low impact signal." |
| Woordaantal | "There's no magical word count target." |
| Heading-volgorde H1>H2>H3 | "It doesn't matter if you're using them out of order." |

Bron: https://developers.google.com/search/docs/fundamentals/seo-starter-guide

---

## Crawler-controle voor AI

| Bot | Wat | Blokkeren effect |
|---|---|---|
| Googlebot | Search-index + AI Overviews + AI Mode | Geen Search EN geen AI |
| Google-Extended | Trainen van Gemini + grounding andere Gemini-producten | AI Overviews onveranderd |
| GoogleOther | R&D | Beperkt effect |
| Google-CloudVertexBot | Vertex AI Agents (alleen opt-in) | Alleen als je opt-in hebt |

Bron: https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers
