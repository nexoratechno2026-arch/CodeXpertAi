/**
 * CodeXpertAI SEO, GEO & AEO Configuration & Schema.org JSON-LD Generators
 *
 * Product: CodeXpertAI
 * Brand Attribution: A product of Nexora Techno (https://nexoratechno.in)
 */

export interface SEOConfig {
  siteName: string;
  brandName: string;
  brandTagline: string;
  primaryDescription: string;
  corporateName: string;
  corporateUrl: string;
  defaultBaseUrl: string;
  defaultOgImage: string;
  twitterHandle: string;
}

export const SITE_CONFIG: SEOConfig = {
  siteName: 'CodeXpertAI',
  brandName: 'CodeXpertAI',
  brandTagline: 'Unified Coding Practice & AI Mock Interviews',
  primaryDescription:
    'Practice programming problems, execute code, review test results, track your submissions, and prepare for technical interviews with AI-guided mock interviews on CodeXpertAI, a product of Nexora Techno.',
  corporateName: 'Nexora Techno',
  corporateUrl: 'https://nexoratechno.in',
  defaultBaseUrl: (import.meta.env.VITE_SITE_URL as string) || 'https://nexoratechno-code.web.app',
  defaultOgImage: '/og-image.png',
  twitterHandle: '@CodeXpertAI',
};

/**
 * Returns normalized canonical URL without trailing slash (except root)
 */
export function getCanonicalUrl(path: string = '/'): string {
  const base = SITE_CONFIG.defaultBaseUrl.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (cleanPath === '/') {
    return `${base}/`;
  }
  return `${base}${cleanPath.replace(/\/+$/, '')}`;
}

/**
 * Returns full image URL for meta tags
 */
export function getFullImageUrl(imagePath: string = SITE_CONFIG.defaultOgImage): string {
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const base = SITE_CONFIG.defaultBaseUrl.replace(/\/+$/, '');
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${base}${cleanPath}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Schema.org Structured Data Generators
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Nexora Techno Corporate Organization Schema
 */
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_CONFIG.corporateUrl}/#organization`,
    name: SITE_CONFIG.corporateName,
    url: SITE_CONFIG.corporateUrl,
    logo: `${SITE_CONFIG.corporateUrl}/logo.png`,
    description: 'Technology solutions and innovative software engineering organization.',
    sameAs: [
      'https://www.linkedin.com/company/nexora-techno',
      'https://github.com/nexoratechno',
    ],
  };
}

/**
 * CodeXpertAI WebSite Schema
 */
export function getWebSiteSchema() {
  const siteUrl = getCanonicalUrl('/');
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}#website`,
    url: siteUrl,
    name: SITE_CONFIG.siteName,
    description: SITE_CONFIG.primaryDescription,
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.corporateName,
      url: SITE_CONFIG.corporateUrl,
    },
    inLanguage: 'en-US',
  };
}

/**
 * CodeXpertAI SoftwareApplication Schema
 */
export function getSoftwareApplicationSchema() {
  const siteUrl = getCanonicalUrl('/');
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${siteUrl}#software`,
    name: SITE_CONFIG.siteName,
    url: siteUrl,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web browser',
    description: SITE_CONFIG.primaryDescription,
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.corporateName,
      url: SITE_CONFIG.corporateUrl,
    },
    creator: {
      '@type': 'Organization',
      name: SITE_CONFIG.corporateName,
      url: SITE_CONFIG.corporateUrl,
    },
    offers: {
      '@type': 'Offer',
      price: '0.00',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    featureList: [
      'Monaco Editor with multi-language syntax highlighting',
      'Sandboxed code execution with isolated time and memory limits',
      'Automated unit test evaluations and submission tracking',
      'AI-guided technical mock interviews across 5 categories',
      'Objective rubric scoring with strengths and weaknesses analysis',
      'Personalized study plans and adaptive problem recommendations',
    ],
  };
}

/**
 * Schema.org BreadcrumbList Generator
 */
export interface BreadcrumbItem {
  name: string;
  item: string;
}

export function getBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: it.name,
      item: getCanonicalUrl(it.item),
    })),
  };
}

/**
 * Schema.org FAQPage Generator
 */
export interface FAQItem {
  question: string;
  answer: string;
}

export function getFAQPageSchema(items: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Schema.org TechArticle / Article Generator
 */
export interface ArticleSchemaProps {
  title: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified: string;
  authorName?: string;
}

export function getTechArticleSchema(props: ArticleSchemaProps) {
  const articleUrl = getCanonicalUrl(props.path);
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    headline: props.title,
    description: props.description,
    image: getFullImageUrl(SITE_CONFIG.defaultOgImage),
    datePublished: props.datePublished,
    dateModified: props.dateModified,
    author: {
      '@type': 'Organization',
      name: props.authorName || 'CodeXpertAI Curriculum Team',
      url: SITE_CONFIG.corporateUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.corporateName,
      url: SITE_CONFIG.corporateUrl,
      logo: {
        '@type': 'ImageObject',
        url: getFullImageUrl('/codexpertai-logo.png'),
      },
    },
    inLanguage: 'en-US',
  };
}
