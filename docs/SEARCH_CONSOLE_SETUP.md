# CodeXpertAI — Search Console & Analytics Setup Runbook

**Date:** 18 October 2026  
**Product:** CodeXpertAI  
**Creator & Publisher:** Nexora Techno (`https://nexoratechno.in`)  
**Status:** Architecture Ready — Requires Owner Account Action  

---

## 1. Overview & Service Status

| Service | Workspace Integration Status | Action Required by Owner |
| :--- | :--- | :--- |
| **Google Search Console (GSC)** | Ready for verification | Domain ownership verification (DNS TXT record or HTML meta tag) |
| **Bing Webmaster Tools** | Ready for verification | Import from verified Google Search Console account |
| **Sitemap Submission** | Generated (`/sitemap.xml`) | Submit URL in Google Search Console interface |
| **Google Analytics 4 (GA4)** | Unconfigured (Pending Approval) | Provide Measurement ID (`G-XXXXXXXXXX`) and privacy consent review |

> **Notice:** In accordance with strict compliance and privacy rules, external tracking scripts (GA4, GTM) have not been injected without explicit owner authorization and cookie consent policy review.

---

## 2. Google Search Console (GSC) Setup Guide

### Step 1: Add Property in Google Search Console
1. Log in to [Google Search Console](https://search.google.com/search-console) with your authorized Nexora Techno Google Workspace administrator account.
2. Choose property type:
   - **Recommended:** **URL prefix** (`https://nexoratechno-code.web.app` or your final production custom domain, e.g. `https://learn.nexoratechno.in`).

### Step 2: Verification Methods
- **Method A (HTML Tag — Recommended for Web App):**
  1. In GSC, select **HTML tag** under Other verification methods.
  2. Copy the `meta` tag content (e.g. `<meta name="google-site-verification" content="XYZ..." />`).
  3. Add this tag into the `<head>` of `index.html` or set via `VITE_GSC_VERIFICATION_TOKEN` in `.env`.
- **Method B (DNS TXT Record — Recommended for Custom Domain):**
  1. Add the provided `google-site-verification` TXT record to your domain DNS settings.
  2. Click **Verify** in GSC.

### Step 3: Submit XML Sitemap
1. Once property ownership is verified, navigate to **Sitemaps** in the left sidebar.
2. In the "Add a new sitemap" input, enter:
   ```
   sitemap.xml
   ```
3. Click **Submit**. Verify that the status reports **Success** and that 9 discovered URLs are registered.

---

## 3. Recommended Measurement & Performance Plan

Once Google Search Console begins processing data (typically 48–72 hours post-submission), track the following core KPIs:

### 3.1 Organic Search Performance
- **Total Impressions:** Measure overall platform visibility across brand and informational developer queries.
- **Organic Clicks:** Track actual click-through volume to landing and educational guide pages.
- **Average CTR (Click-Through Rate):** Evaluate meta description and title effectiveness (target: 3–6% across high-intent queries).
- **Search Queries:** Identify whether queries match our candidate topic clusters (`CodeXpertAI`, `coding practice with tests`, `AI mock interview`).

### 3.2 Index Coverage & Crawl Health
- **Indexed Pages:** Confirm all 9 canonical URLs (`/`, `/about`, `/faq`, `/guides`, `/guides/*`, `/privacy`, `/terms`) are indexed without warnings.
- **Excluded by 'noindex' tag:** Confirm that `/dashboard`, `/admin`, and internal routes are appropriately flagged as "Excluded by 'noindex' tag" without search console errors.
- **Crawl Stats:** Verify average response time remains < 250ms on Firebase Hosting edge CDN.

### 3.3 Core Web Vitals Monitoring
- Review the **Page Experience** and **Core Web Vitals** report in GSC for Mobile and Desktop:
  - **LCP (Largest Contentful Paint):** Target ≤ 2.5s.
  - **INP (Interaction to Next Paint):** Target ≤ 200ms.
  - **CLS (Cumulative Layout Shift):** Target ≤ 0.1.

---

## 4. Optional Google Analytics 4 (GA4) Integration Plan

If the product owner approves implementing Google Analytics:
1. Create a GA4 Web Data Stream for CodeXpertAI.
2. Implement an opt-in consent banner adhering to EU/UK GDPR and applicable privacy regulations.
3. Configure non-PII conversion events:
   - `student_signup_click`: Triggered when a user clicks "Create Student Account".
   - `guide_read_complete`: Triggered when a user scrolls through a technical guide.
   - `faq_expand`: Triggered when an FAQ accordion item is inspected.
4. **Never send student code submissions, mock interview audio transcripts, or user email addresses to Google Analytics.**
