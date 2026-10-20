import React, { useEffect } from 'react';
import { SITE_CONFIG, getCanonicalUrl, getFullImageUrl } from '@/lib/seo';

export interface SEOHeadProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  noindex?: boolean;
  ogType?: 'website' | 'article';
  ogImage?: string;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

/**
 * SEOHead - Dynamic Meta, Canonical & Structured Data Manager
 *
 * Updates document head for SPA navigation without heavy external dependencies.
 * Ensures consistent canonical URLs, social preview tags, and crawl directives.
 */
export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description = SITE_CONFIG.primaryDescription,
  canonicalPath = '/',
  noindex = false,
  ogType = 'website',
  ogImage = SITE_CONFIG.defaultOgImage,
  jsonLd,
}) => {
  const fullTitle = title
    ? (title.includes(SITE_CONFIG.siteName) ? title : `${title} – ${SITE_CONFIG.siteName}`)
    : `${SITE_CONFIG.siteName} – ${SITE_CONFIG.brandTagline}`;

  const canonicalUrl = getCanonicalUrl(canonicalPath);
  const fullOgImage = getFullImageUrl(ogImage);

  useEffect(() => {
    // 1. Update Document Title
    document.title = fullTitle;

    // Helper to set or create meta tag by name or property
    const setMetaTag = (attr: 'name' | 'property', key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // 2. Primary Meta Tags
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');

    // 3. Canonical Link Tag
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // 4. Open Graph Meta Tags
    setMetaTag('property', 'og:site_name', SITE_CONFIG.siteName);
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:image', fullOgImage);
    setMetaTag('property', 'og:locale', 'en_US');

    // 5. Twitter Card Meta Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', fullOgImage);

    // 6. Structured Data Injection (JSON-LD)
    const jsonLdId = 'dynamic-seo-jsonld';
    let scriptTag = document.getElementById(jsonLdId) as HTMLScriptElement | null;
    if (jsonLd) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = jsonLdId;
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(jsonLd);
    } else if (scriptTag) {
      scriptTag.remove();
    }

    // Cleanup on unmount or route change
    return () => {
      if (scriptTag && document.head.contains(scriptTag)) {
        scriptTag.remove();
      }
    };
  }, [fullTitle, description, canonicalUrl, noindex, ogType, fullOgImage, jsonLd]);

  return null;
};
