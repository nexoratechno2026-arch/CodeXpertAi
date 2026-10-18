# CodeXpertAI — Technical SEO Implementation Guide

**Date:** 18 October 2026  
**Product:** CodeXpertAI  
**Creator & Publisher:** Nexora Techno  
**Official Brand Attribution:** A product of Nexora Techno (`https://nexoratechno.in`)  
**Status:** Implemented & Verified in Workspace  

---

## 1. Overview of Implemented Architecture

To achieve search discoverability while preserving application security and data privacy, CodeXpertAI integrates a comprehensive client-side and static indexing architecture:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          CodeXpertAI Client                            │
├────────────────────────────────┬───────────────────────────────────────┤
│          Public Routes         │           Protected Routes            │
│  (/, /about, /faq, /guides)    │      (/dashboard, /interview/...)     │
├────────────────────────────────┼───────────────────────────────────────┤
│  • Dynamic Title & Meta Tags   │  • Auto <meta name="robots"           │
│  • Canonical URLs              │    content="noindex, nofollow" />     │
│  • Open Graph & Twitter Cards  │  • Excluded from sitemap.xml          │
│  • Schema.org JSON-LD          │  • Disallowed in robots.txt           │
│  • Semantic HTML5 Elements     │  • Protected by Firebase Auth Guards  │
└────────────────────────────────┴───────────────────────────────────────┘
```

---

## 2. Core Components & Utilities

### 2.1 Centralized SEO Configuration (`src/lib/seo.ts`)
A dedicated configuration utility normalizes canonical URLs, builds image URLs, and defines Schema.org structured data generators:
- `SITE_CONFIG`: Stores standard brand attributes, primary descriptions, corporate URLs, and fallback domains.
- `getCanonicalUrl(path)`: Normalizes URLs, stripping extraneous trailing slashes (while retaining the root slash) to prevent duplicate content canonicalization issues.
- `getFullImageUrl(path)`: Resolves absolute URLs for social graph assets (`og:image`, `twitter:image`).
- `getOrganizationSchema()`: Produces valid Schema.org `Organization` metadata for Nexora Techno.
- `getWebSiteSchema()`: Produces Schema.org `WebSite` metadata linking CodeXpertAI to Nexora Techno as its publisher.
- `getSoftwareApplicationSchema()`: Produces Schema.org `SoftwareApplication` metadata with legitimate feature descriptions and $0.00 educational pricing.
- `getBreadcrumbSchema(items)`: Formats compliant 1-indexed `BreadcrumbList` schemas.
- `getFAQPageSchema(items)`: Formats `FAQPage` metadata mapping visible direct questions and answers.
- `getTechArticleSchema(props)`: Generates `TechArticle` structured data for curriculum guides.

### 2.2 Dynamic Head Manager (`src/components/seo/SEOHead.tsx`)
Because CodeXpertAI operates as a single-page application (SPA), the `SEOHead` component dynamically updates the DOM during client-side route transitions:
- Updates `document.title`.
- Injects or updates `<meta name="description">`.
- Sets `<link rel="canonical" href="...">`.
- Controls `<meta name="robots" content="index, follow" | "noindex, nofollow">`.
- Injects full Open Graph (`og:site_name`, `og:title`, `og:description`, `og:url`, `og:type`, `og:image`, `og:locale`).
- Injects Twitter Cards (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`).
- Injects structured JSON-LD in a managed `<script id="dynamic-seo-jsonld">` element with automatic cleanup on unmount.

### 2.3 Static Fallback in `index.html`
For crawlers, feed readers, and AI scrapers that do not evaluate client-side JavaScript, `index.html` provides:
- Static title: `CodeXpertAI — Coding Practice & AI Mock Interviews | A Product of Nexora Techno`.
- Static meta description summarizing the product.
- Pre-rendered Open Graph and Twitter Card tags.
- Pre-rendered root JSON-LD script containing `Organization`, `WebSite`, and `SoftwareApplication` records.
- Standard preconnect directives to Google Fonts (`fonts.googleapis.com` and `fonts.gstatic.com`).

---

## 3. Crawl Governance (`robots.txt` & `sitemap.xml`)

### 3.1 `public/robots.txt`
Declares clear crawl rules for general web search bots and dedicated AI discovery crawlers:
- **Allowed Public Surfaces:** `/`, `/about`, `/faq`, `/guides`, `/guides/*`, `/privacy`, `/terms`, `/login`, `/signup`, and static asset extensions (`.js`, `.css`, `.png`, `.jpg`, `.svg`, `.ico`).
- **Disallowed Private Surfaces:**
  - `/dashboard`, `/dashboard/*`
  - `/codelab/problems/*`
  - `/codelab/workspace/*`
  - `/codelab/submissions`, `/codelab/submissions/*`
  - `/codelab/challenges`
  - `/interview/setup`, `/interview/simulator`
  - `/interview/live`, `/interview/live/*`
  - `/interview/session/*`, `/interview/report/*`
  - `/learning-paths`
  - `/profile`, `/profile/*`
  - `/admin`, `/admin/*`
- **AI Agents Configured:** `Google-Extended`, `GPTBot`, `ClaudeBot`, and `PerplexityBot` are granted access to public educational and marketing surfaces while strictly disallowed from authenticated student workspaces.
- **Sitemap Declaration:** `Sitemap: https://nexoratechno-code.web.app/sitemap.xml`.

### 3.2 `public/sitemap.xml`
The XML sitemap lists only verified canonical public URLs:
1. `https://nexoratechno-code.web.app/` (Priority: 1.0, Weekly)
2. `https://nexoratechno-code.web.app/about` (Priority: 0.9, Monthly)
3. `https://nexoratechno-code.web.app/faq` (Priority: 0.8, Weekly)
4. `https://nexoratechno-code.web.app/guides` (Priority: 0.8, Weekly)
5. `https://nexoratechno-code.web.app/guides/technical-interview-prep` (Priority: 0.8, Monthly)
6. `https://nexoratechno-code.web.app/guides/effective-coding-practice` (Priority: 0.8, Monthly)
7. `https://nexoratechno-code.web.app/guides/ai-mock-interview-guide` (Priority: 0.8, Monthly)
8. `https://nexoratechno-code.web.app/privacy` (Priority: 0.5, Monthly)
9. `https://nexoratechno-code.web.app/terms` (Priority: 0.5, Monthly)

---

## 4. Performance & Core Web Vitals

To support optimal Core Web Vitals (LCP, INP, CLS) without altering the visual design:
1. **Manual Chunk Splitting in `vite.config.ts`:**
   - `vendor-react`: Isolated core framework bundle (`react`, `react-dom`, `react-router-dom`).
   - `vendor-firebase`: Separated authentication and Firestore libraries.
   - `vendor-monaco`: Separated Monaco editor (~14 KB loader chunk) loaded only when code editing is active.
   - `vendor-icons`: Separated Lucide icon library.
2. **Asset Caching via `firebase.json`:**
   - Immutable 1-year cache headers (`Cache-Control: public, max-age=31536000, immutable`) for all hashed `.js` and `.css` bundles.
   - Strict `no-cache, no-store, must-revalidate` for `index.html` to ensure immediate deployment rollouts.
3. **Typography & Layout Stability:**
   - Preconnect links for Google Fonts reduce font network latency.
   - System fallback font stacks prevent Cumulative Layout Shift (CLS) during webfont hydration.

---

## 5. Security & Isolation Invariants

1. **Authentication Safety:** No private test cases, hidden assertions, student code submissions, or interview transcripts are exposed in any public metadata, sitemaps, or robots files.
2. **Corporate Site Isolation:** `https://nexoratechno.in` is strictly referenced as the parent creator/publisher via standard outbound hyperlinks (`rel="noopener noreferrer"`). No DNS records, server configurations, or codebase assets of `nexoratechno.in` have been modified.
