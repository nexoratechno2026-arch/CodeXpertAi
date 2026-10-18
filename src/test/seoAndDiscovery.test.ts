import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  SITE_CONFIG,
  getCanonicalUrl,
  getFullImageUrl,
  getOrganizationSchema,
  getWebSiteSchema,
  getSoftwareApplicationSchema,
  getBreadcrumbSchema,
  getFAQPageSchema,
  getTechArticleSchema,
} from '@/lib/seo';
import { GUIDES, getGuideBySlug } from '@/features/guides/guidesData';
import { FAQ_ENTRIES } from '@/features/faq/FAQPage';

describe('SEO, GEO & AEO Implementation Test Suite', () => {
  describe('1. Brand & Entity Configuration', () => {
    it('accurately identifies CodeXpertAI as a product of Nexora Techno', () => {
      expect(SITE_CONFIG.siteName).toBe('CodeXpertAI');
      expect(SITE_CONFIG.brandName).toBe('CodeXpertAI');
      expect(SITE_CONFIG.corporateName).toBe('Nexora Techno');
      expect(SITE_CONFIG.corporateUrl).toBe('https://nexoratechno.in');
      expect(SITE_CONFIG.primaryDescription).toContain('product of Nexora Techno');
    });

    it('generates normalized canonical URLs without trailing slash (except root)', () => {
      expect(getCanonicalUrl('/')).toBe(`${SITE_CONFIG.defaultBaseUrl}/`);
      expect(getCanonicalUrl('/about')).toBe(`${SITE_CONFIG.defaultBaseUrl}/about`);
      expect(getCanonicalUrl('about/')).toBe(`${SITE_CONFIG.defaultBaseUrl}/about`);
      expect(getCanonicalUrl('/guides/technical-interview-prep/')).toBe(
        `${SITE_CONFIG.defaultBaseUrl}/guides/technical-interview-prep`
      );
    });

    it('generates fully qualified image URLs', () => {
      expect(getFullImageUrl('/og-image.png')).toBe(
        `${SITE_CONFIG.defaultBaseUrl}/og-image.png`
      );
      expect(getFullImageUrl('https://example.com/custom.jpg')).toBe(
        'https://example.com/custom.jpg'
      );
    });
  });

  describe('2. Schema.org JSON-LD Structured Data Generators', () => {
    it('produces valid Organization schema for Nexora Techno', () => {
      const org = getOrganizationSchema();
      expect(org['@context']).toBe('https://schema.org');
      expect(org['@type']).toBe('Organization');
      expect(org.name).toBe('Nexora Techno');
      expect(org.url).toBe('https://nexoratechno.in');
      expect(org['@id']).toBe('https://nexoratechno.in/#organization');
    });

    it('produces valid WebSite schema linking CodeXpertAI to Nexora Techno as publisher', () => {
      const site = getWebSiteSchema();
      expect(site['@context']).toBe('https://schema.org');
      expect(site['@type']).toBe('WebSite');
      expect(site.name).toBe('CodeXpertAI');
      expect(site.publisher.name).toBe('Nexora Techno');
      expect(site.publisher.url).toBe('https://nexoratechno.in');
    });

    it('produces valid SoftwareApplication schema with no fabricated ratings', () => {
      const app = getSoftwareApplicationSchema();
      expect(app['@context']).toBe('https://schema.org');
      expect(app['@type']).toBe('SoftwareApplication');
      expect(app.name).toBe('CodeXpertAI');
      expect(app.applicationCategory).toBe('EducationalApplication');
      expect(app.creator.name).toBe('Nexora Techno');
      expect(app.publisher.name).toBe('Nexora Techno');
      expect(app.offers.price).toBe('0.00');
      // Must not fabricate aggregate ratings or reviews
      expect((app as Record<string, unknown>).aggregateRating).toBeUndefined();
      expect((app as Record<string, unknown>).review).toBeUndefined();
    });

    it('produces valid BreadcrumbList with 1-based indexing', () => {
      const crumbs = getBreadcrumbSchema([
        { name: 'Home', item: '/' },
        { name: 'Guides', item: '/guides' },
        { name: 'Technical Interview Prep', item: '/guides/technical-interview-prep' },
      ]);
      expect(crumbs['@type']).toBe('BreadcrumbList');
      expect(crumbs.itemListElement).toHaveLength(3);
      expect(crumbs.itemListElement[0].position).toBe(1);
      expect(crumbs.itemListElement[1].position).toBe(2);
      expect(crumbs.itemListElement[2].position).toBe(3);
      expect(crumbs.itemListElement[0].item).toBe(`${SITE_CONFIG.defaultBaseUrl}/`);
    });

    it('produces valid FAQPage schema for FAQ items', () => {
      const faqSchema = getFAQPageSchema([
        { question: 'What is CodeXpertAI?', answer: 'A developer platform created by Nexora Techno.' },
      ]);
      expect(faqSchema['@type']).toBe('FAQPage');
      expect(faqSchema.mainEntity).toHaveLength(1);
      expect(faqSchema.mainEntity[0]['@type']).toBe('Question');
      expect(faqSchema.mainEntity[0].name).toBe('What is CodeXpertAI?');
      expect(faqSchema.mainEntity[0].acceptedAnswer['@type']).toBe('Answer');
      expect(faqSchema.mainEntity[0].acceptedAnswer.text).toBe(
        'A developer platform created by Nexora Techno.'
      );
    });

    it('produces valid TechArticle schema for educational guides', () => {
      const article = getTechArticleSchema({
        title: 'Interview Guide',
        description: 'Comprehensive preparation',
        path: '/guides/technical-interview-prep',
        datePublished: '2026-10-18',
        dateModified: '2026-10-18',
        authorName: 'Curriculum Team',
      });
      expect(article['@type']).toBe('TechArticle');
      expect(article.headline).toBe('Interview Guide');
      expect(article.publisher.name).toBe('Nexora Techno');
      expect(article.publisher.url).toBe('https://nexoratechno.in');
    });
  });

  describe('3. Public Files (robots.txt, sitemap.xml, llms.txt)', () => {
    const publicDir = path.resolve(__dirname, '../../public');

    it('robots.txt exists and protects authenticated routes while allowing public discovery', () => {
      const robotsPath = path.join(publicDir, 'robots.txt');
      expect(fs.existsSync(robotsPath)).toBe(true);

      const content = fs.readFileSync(robotsPath, 'utf-8');
      expect(content).toContain('User-agent: *');
      expect(content).toContain('Allow: /about');
      expect(content).toContain('Allow: /faq');
      expect(content).toContain('Allow: /guides');
      expect(content).toContain('Disallow: /dashboard');
      expect(content).toContain('Disallow: /codelab/workspace/*');
      expect(content).toContain('Disallow: /codelab/submissions');
      expect(content).toContain('Disallow: /interview/session/*');
      expect(content).toContain('Disallow: /interview/report/*');
      expect(content).toContain('Disallow: /admin');
      expect(content).toContain('Sitemap: https://nexoratechno-code.web.app/sitemap.xml');
    });

    it('sitemap.xml exists and contains only canonical public routes', () => {
      const sitemapPath = path.join(publicDir, 'sitemap.xml');
      expect(fs.existsSync(sitemapPath)).toBe(true);

      const xml = fs.readFileSync(sitemapPath, 'utf-8');
      expect(xml).toContain('<loc>https://nexoratechno-code.web.app/</loc>');
      expect(xml).toContain('<loc>https://nexoratechno-code.web.app/about</loc>');
      expect(xml).toContain('<loc>https://nexoratechno-code.web.app/faq</loc>');
      expect(xml).toContain('<loc>https://nexoratechno-code.web.app/guides</loc>');
      expect(xml).toContain('<loc>https://nexoratechno-code.web.app/guides/technical-interview-prep</loc>');
      expect(xml).toContain('<loc>https://nexoratechno-code.web.app/privacy</loc>');
      expect(xml).toContain('<loc>https://nexoratechno-code.web.app/terms</loc>');

      // Strict privacy assertions: NEVER index authenticated user routes
      expect(xml).not.toContain('/dashboard');
      expect(xml).not.toContain('/submissions');
      expect(xml).not.toContain('/report');
      expect(xml).not.toContain('/admin');
      expect(xml).not.toContain('/profile');
    });

    it('llms.txt exists with accurate Nexora Techno attribution', () => {
      const llmsPath = path.join(publicDir, 'llms.txt');
      expect(fs.existsSync(llmsPath)).toBe(true);

      const content = fs.readFileSync(llmsPath, 'utf-8');
      expect(content).toContain('# CodeXpertAI');
      expect(content).toContain('A product of Nexora Techno (https://nexoratechno.in)');
      expect(content).toContain('CodeLab');
      expect(content).toContain('InterviewAI');
    });

    it('Open Graph social preview asset exists in public folder', () => {
      const ogPngPath = path.join(publicDir, 'og-image.png');
      expect(fs.existsSync(ogPngPath)).toBe(true);
      const stat = fs.statSync(ogPngPath);
      expect(stat.size).toBeGreaterThan(1000);
    });
  });

  describe('4. Educational Content & FAQ Verification', () => {
    it('provides all 3 core engineering guides with original structured sections', () => {
      expect(GUIDES).toHaveLength(3);
      expect(getGuideBySlug('technical-interview-prep')).toBeDefined();
      expect(getGuideBySlug('effective-coding-practice')).toBeDefined();
      expect(getGuideBySlug('ai-mock-interview-guide')).toBeDefined();

      const guide1 = getGuideBySlug('technical-interview-prep')!;
      expect(guide1.content.sections.length).toBeGreaterThanOrEqual(4);
      expect(guide1.author).toContain('CodeXpertAI');
    });

    it('provides all 12 core FAQ entries with direct and detailed answers', () => {
      expect(FAQ_ENTRIES.length).toBeGreaterThanOrEqual(12);

      const requiredQuestions = [
        'what-is-codexpertai',
        'who-created-codexpertai',
        'is-codexpertai-a-product-of-nexora-techno',
        'what-is-codelab',
        'what-is-interviewai',
        'how-coding-practice-works',
        'can-users-execute-code-and-review-tests',
        'how-ai-mock-interviews-work',
        'supported-programming-languages',
        'is-user-account-required',
        'how-interview-feedback-generated',
        'contact-support-report-problem',
      ];

      for (const reqId of requiredQuestions) {
        const found = FAQ_ENTRIES.find((f) => f.id === reqId);
        expect(found).toBeDefined();
        expect(found?.directAnswer.length).toBeGreaterThan(15);
      }
    });
  });
});
