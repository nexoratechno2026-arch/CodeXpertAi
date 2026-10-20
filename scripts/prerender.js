/**
 * CodeXpertAI Static Prerendering Script
 * 
 * Generates static HTML for all public indexable routes into the dist/ directory.
 * Ensures search crawlers and LLM indexing bots receive complete semantic HTML,
 * route-specific titles, unique meta descriptions, canonical links, and Schema.org JSON-LD.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');

if (!fs.existsSync(distDir)) {
  console.error('[Prerender] Error: dist directory not found. Please run vite build first.');
  process.exit(1);
}

const templatePath = path.join(distDir, 'index.html');
const baseTemplate = fs.readFileSync(templatePath, 'utf-8');

const DOMAIN = 'https://www.codexpertai.in';
const OG_IMAGE = `${DOMAIN}/og-image.png`;
const LOGO_URL = `${DOMAIN}/codexpertai-logo.png`;
const CORP_URL = 'https://nexoratechno.in';

const ORG_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${CORP_URL}/#organization`,
  name: 'Nexora Techno',
  url: CORP_URL,
  logo: `${CORP_URL}/logo.png`,
  description: 'Technology solutions and software engineering enterprise.',
  sameAs: [
    'https://www.instagram.com/codexpertai_nt/',
    'https://www.linkedin.com/company/nexora-techno',
    'https://github.com/nexoratechno'
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'support@codexpertai.in',
    contactType: 'customer support',
    availableLanguage: ['English']
  }
};

const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${DOMAIN}/#website`,
  url: `${DOMAIN}/`,
  name: 'CodeXpertAI',
  description: 'Practice coding problems and prepare for technical interviews with CodeXpertAI. Improve your programming skills and build confidence for your next opportunity.',
  publisher: {
    '@type': 'Organization',
    name: 'Nexora Techno',
    url: CORP_URL
  },
  sameAs: [
    'https://www.instagram.com/codexpertai_nt/'
  ],
  inLanguage: 'en-US'
};

const SOFTWARE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  '@id': `${DOMAIN}/#software`,
  name: 'CodeXpertAI',
  url: `${DOMAIN}/`,
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web browser',
  description: 'Practice coding problems and prepare for technical interviews with CodeXpertAI. Improve your programming skills and build confidence for your next opportunity.',
  creator: {
    '@type': 'Organization',
    name: 'Nexora Techno',
    url: CORP_URL
  },
  publisher: {
    '@type': 'Organization',
    name: 'Nexora Techno',
    url: CORP_URL
  },
  offers: {
    '@type': 'Offer',
    price: '0.00',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock'
  },
  featureList: [
    'Monaco Editor with multi-language syntax highlighting',
    'Sandboxed code execution with isolated time and memory limits',
    'Automated unit test evaluations and submission tracking',
    'AI-guided technical mock interviews across 5 categories',
    'Objective rubric scoring with strengths and weaknesses analysis',
    'Personalized study plans and adaptive problem recommendations'
  ]
};

function createBreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.path.startsWith('http') ? item.path : `${DOMAIN}${item.path}`
    }))
  };
}

const ROUTES = [
  {
    path: '/',
    outputPath: 'index.html',
    title: 'CodeXpertAI – Coding Practice & AI Mock Interviews',
    description: 'Practice coding problems and prepare for technical interviews with CodeXpertAI. Improve your programming skills and build confidence for your next opportunity.',
    canonical: `${DOMAIN}/`,
    schemas: [ORG_SCHEMA, WEBSITE_SCHEMA, SOFTWARE_SCHEMA],
    noindex: false
  },
  {
    path: '/about',
    outputPath: 'about/index.html',
    title: 'About CodeXpertAI – Developer Practice Platform by Nexora Techno',
    description: 'Discover CodeXpertAI, an engineering practice and AI mock interview platform developed by Nexora Techno for students, developers, and job seekers.',
    canonical: `${DOMAIN}/about`,
    schemas: [
      createBreadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }]),
      SOFTWARE_SCHEMA
    ],
    noindex: false,
    content: `
      <main style="max-width: 1000px; margin: 0 auto; padding: 48px 24px;">
        <nav aria-label="Breadcrumb" style="margin-bottom: 24px; color: #71717A; font-size: 14px;">
          <a href="/" style="color: #60A5FA; text-decoration: none;">Home</a> / <span style="color: #E4E4E7;">About</span>
        </nav>
        <article>
          <header style="margin-bottom: 36px;">
            <p style="color: #60A5FA; font-weight: 600; font-size: 13px; text-transform: uppercase;">Product Overview • Created by Nexora Techno</p>
            <h1 style="color: #FFFFFF; font-size: 36px; margin: 8px 0 16px 0;">About CodeXpertAI</h1>
            <p style="color: #A1A1AA; font-size: 18px; line-height: 1.6;">
              CodeXpertAI is a unified developer platform combining structured coding practice with AI-guided mock interviews, engineered by Nexora Techno for serious software engineering preparation.
            </p>
          </header>
          <section style="margin-top: 32px; background: #18181B; border: 1px solid #27272A; border-radius: 8px; padding: 28px;">
            <h2 style="color: #60A5FA; font-size: 22px; margin-top: 0;">What is CodeXpertAI?</h2>
            <p style="color: #D4D4D8; font-size: 15px; line-height: 1.7;">
              CodeXpertAI is a browser-based developer platform built to bridge the gap between algorithmic problem-solving practice and authentic technical mock interviews. Instead of forcing developers to juggle disconnected coding sites, spreadsheets, and arbitrary AI chatbots, CodeXpertAI integrates hands-on coding execution and interactive mock interview evaluations into a unified student record.
            </p>
          </section>
          <section style="margin-top: 24px; background: #18181B; border: 1px solid #27272A; border-radius: 8px; padding: 28px;">
            <h2 style="color: #60A5FA; font-size: 22px; margin-top: 0;">Who Created CodeXpertAI?</h2>
            <p style="color: #D4D4D8; font-size: 15px; line-height: 1.7;">
              CodeXpertAI was designed, engineered, and published by <strong>Nexora Techno</strong>. CodeXpertAI is an official software product under the Nexora Techno umbrella, an innovative technology solutions and software engineering enterprise.
            </p>
            <p style="color: #D4D4D8; font-size: 15px; line-height: 1.7;">
              Official website: <a href="https://nexoratechno.in" target="_blank" rel="noopener noreferrer" style="color: #60A5FA;">https://nexoratechno.in</a>
            </p>
          </section>
          <section style="margin-top: 24px; background: #18181B; border: 1px solid #27272A; border-radius: 8px; padding: 28px;">
            <h2 style="color: #60A5FA; font-size: 22px; margin-top: 0;">Who is CodeXpertAI Designed For?</h2>
            <ul style="color: #D4D4D8; font-size: 15px; line-height: 1.8;">
              <li><strong>Computer Science Students & Self-Taught Learners:</strong> Building foundations in data structures, algorithms, and SQL syntax.</li>
              <li><strong>Aspiring Software Engineers:</strong> Rehearsing live coding, architecture design, and STAR behavioral interview scenarios.</li>
              <li><strong>Experienced Software Developers:</strong> Sharpening core algorithmic efficiency and reviewing system design fundamentals.</li>
            </ul>
          </section>
          <section style="margin-top: 24px; background: #18181B; border: 1px solid #27272A; border-radius: 8px; padding: 28px;">
            <h2 style="color: #60A5FA; font-size: 22px; margin-top: 0;">Supported Programming Languages</h2>
            <p style="color: #D4D4D8; font-size: 15px; line-height: 1.7;">
              CodeLab supports Python 3.10+, JavaScript (Node.js 20+), TypeScript 5.x, Java (OpenJDK 17+), C++ (GCC 12 / C++20), Go 1.21+, and ANSI SQL with isolated execution time and memory limits.
            </p>
          </section>
        </article>
      </main>
    `
  },
  {
    path: '/faq',
    outputPath: 'faq/index.html',
    title: 'Frequently Asked Questions – CodeXpertAI',
    description: 'Find answers to common questions about CodeXpertAI, CodeLab coding challenges, InterviewAI mock interview simulations, and platform features.',
    canonical: `${DOMAIN}/faq`,
    schemas: [
      createBreadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'FAQ', path: '/faq' }]),
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What is CodeXpertAI?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'CodeXpertAI is a unified developer platform that combines structured coding practice with AI-guided technical mock interviews, developed and maintained by Nexora Techno.'
            }
          },
          {
            '@type': 'Question',
            name: 'Who created CodeXpertAI?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'CodeXpertAI was created and published by Nexora Techno, an innovative technology solutions and software engineering enterprise.'
            }
          },
          {
            '@type': 'Question',
            name: 'What is CodeLab?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'CodeLab is CodeXpertAI\'s interactive coding workspace featuring Monaco Editor, sandboxed multi-language code compilation, and automated test evaluation across 14 algorithmic domains.'
            }
          },
          {
            '@type': 'Question',
            name: 'What is InterviewAI?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'InterviewAI is CodeXpertAI\'s intelligent technical mock interview simulator covering Technical Concepts, Live Coding, System Architecture, SQL, and STAR Behavioral categories with real-time feedback.'
            }
          },
          {
            '@type': 'Question',
            name: 'Can users execute code and review test results?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. CodeXpertAI provides true server-side sandboxed code compilation and execution with granular test results, stdout output, memory usage, and runtime execution metrics.'
            }
          }
        ]
      }
    ],
    noindex: false,
    content: `
      <main style="max-width: 1000px; margin: 0 auto; padding: 48px 24px;">
        <nav aria-label="Breadcrumb" style="margin-bottom: 24px; color: #71717A; font-size: 14px;">
          <a href="/" style="color: #60A5FA; text-decoration: none;">Home</a> / <span style="color: #E4E4E7;">FAQ</span>
        </nav>
        <header style="margin-bottom: 36px;">
          <p style="color: #60A5FA; font-weight: 600; font-size: 13px; text-transform: uppercase;">Knowledge Base • Official Answers</p>
          <h1 style="color: #FFFFFF; font-size: 36px; margin: 8px 0 16px 0;">Frequently Asked Questions</h1>
          <p style="color: #A1A1AA; font-size: 18px; line-height: 1.6;">
            Direct answers to common questions about CodeXpertAI, CodeLab coding challenges, InterviewAI simulations, and Nexora Techno attribution.
          </p>
        </header>
        <section style="display: flex; flexDirection: column; gap: 20px;">
          <div style="background: #18181B; border: 1px solid #27272A; border-radius: 8px; padding: 24px;">
            <h2 style="color: #60A5FA; font-size: 18px; margin: 0 0 10px 0;">What is CodeXpertAI?</h2>
            <p style="color: #D4D4D8; font-size: 14px; line-height: 1.6; margin: 0;">CodeXpertAI is a unified developer platform that combines structured coding practice with AI-guided technical mock interviews into a single environment.</p>
          </div>
          <div style="background: #18181B; border: 1px solid #27272A; border-radius: 8px; padding: 24px;">
            <h2 style="color: #60A5FA; font-size: 18px; margin: 0 0 10px 0;">Who created CodeXpertAI?</h2>
            <p style="color: #D4D4D8; font-size: 14px; line-height: 1.6; margin: 0;">CodeXpertAI was created and published by Nexora Techno, an innovative technology solutions and software engineering enterprise.</p>
          </div>
          <div style="background: #18181B; border: 1px solid #27272A; border-radius: 8px; padding: 24px;">
            <h2 style="color: #60A5FA; font-size: 18px; margin: 0 0 10px 0;">What is CodeLab?</h2>
            <p style="color: #D4D4D8; font-size: 14px; line-height: 1.6; margin: 0;">CodeLab provides hands-on algorithmic coding practice across 14 topic domains with Monaco Editor, isolated sandboxed execution, and comprehensive test suite evaluations.</p>
          </div>
          <div style="background: #18181B; border: 1px solid #27272A; border-radius: 8px; padding: 24px;">
            <h2 style="color: #60A5FA; font-size: 18px; margin: 0 0 10px 0;">What is InterviewAI?</h2>
            <p style="color: #D4D4D8; font-size: 14px; line-height: 1.6; margin: 0;">InterviewAI simulates authentic technical hiring interviews across 5 categories (Technical Concepts, Live Coding, System Architecture, SQL, and STAR Behavioral) with real-time feedback and diagnostic scoring.</p>
          </div>
          <div style="background: #18181B; border: 1px solid #27272A; border-radius: 8px; padding: 24px;">
            <h2 style="color: #60A5FA; font-size: 18px; margin: 0 0 10px 0;">Can users execute code and review test results?</h2>
            <p style="color: #D4D4D8; font-size: 14px; line-height: 1.6; margin: 0;">Yes. CodeXpertAI provides true server-side sandboxed compilation and execution with granular test results, stdout capture, and runtime metrics across 7 programming languages.</p>
          </div>
        </section>
      </main>
    `
  },
  {
    path: '/guides',
    outputPath: 'guides/index.html',
    title: 'Engineering & Technical Interview Guides – CodeXpertAI',
    description: 'Explore in-depth technical interview guides, algorithmic problem-solving strategies, and system design frameworks for software engineers.',
    canonical: `${DOMAIN}/guides`,
    schemas: [createBreadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Guides', path: '/guides' }])],
    noindex: false,
    content: `
      <main style="max-width: 1000px; margin: 0 auto; padding: 48px 24px;">
        <nav aria-label="Breadcrumb" style="margin-bottom: 24px; color: #71717A; font-size: 14px;">
          <a href="/" style="color: #60A5FA; text-decoration: none;">Home</a> / <span style="color: #E4E4E7;">Guides</span>
        </nav>
        <header style="margin-bottom: 36px;">
          <p style="color: #60A5FA; font-weight: 600; font-size: 13px; text-transform: uppercase;">Technical Resources • Evidence-Grounded Preparation</p>
          <h1 style="color: #FFFFFF; font-size: 36px; margin: 8px 0 16px 0;">Engineering &amp; Interview Guides</h1>
          <p style="color: #A1A1AA; font-size: 18px; line-height: 1.6;">
            In-depth architectural frameworks, algorithmic problem-solving strategies, and interview communication methodologies curated by the CodeXpertAI curriculum team.
          </p>
        </header>
        <section style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px;">
          <article style="background: #18181B; border: 1px solid #27272A; border-radius: 8px; padding: 24px;">
            <p style="color: #60A5FA; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">Interview Preparation</p>
            <h2 style="font-size: 20px; margin: 0 0 12px 0;"><a href="/guides/technical-interview-prep" style="color: #FFFFFF; text-decoration: none;">How to Prepare for Technical Coding Interviews: A Structured Framework</a></h2>
            <p style="color: #A1A1AA; font-size: 14px; line-height: 1.6;">A practical methodology for mastering algorithmic problem decomposition, Big-O complexity trade-offs, and live technical communication under observation.</p>
            <a href="/guides/technical-interview-prep" style="color: #3B82F6; font-weight: 600; font-size: 14px; text-decoration: none;">Read Guide &rarr;</a>
          </article>
          <article style="background: #18181B; border: 1px solid #27272A; border-radius: 8px; padding: 24px;">
            <p style="color: #60A5FA; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">Coding Practice</p>
            <h2 style="font-size: 20px; margin: 0 0 12px 0;"><a href="/guides/effective-coding-practice" style="color: #FFFFFF; text-decoration: none;">How to Practise Programming Problems Effectively & Interpret Test Results</a></h2>
            <p style="color: #A1A1AA; font-size: 14px; line-height: 1.6;">Learn how to decode execution sandbox error codes (TLE, MLE, WA), eliminate knowledge gaps systematically, and practice with high return on investment.</p>
            <a href="/guides/effective-coding-practice" style="color: #3B82F6; font-weight: 600; font-size: 14px; text-decoration: none;">Read Guide &rarr;</a>
          </article>
          <article style="background: #18181B; border: 1px solid #27272A; border-radius: 8px; padding: 24px;">
            <p style="color: #60A5FA; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">AI Interview Insights</p>
            <h2 style="font-size: 20px; margin: 0 0 12px 0;"><a href="/guides/ai-mock-interview-guide" style="color: #FFFFFF; text-decoration: none;">Mastering AI-Guided Technical & Behavioral Mock Interviews</a></h2>
            <p style="color: #A1A1AA; font-size: 14px; line-height: 1.6;">Understand how AI interview engines evaluate candidates, how to structure STAR responses, and how to turn diagnostic session reports into career progress.</p>
            <a href="/guides/ai-mock-interview-guide" style="color: #3B82F6; font-weight: 600; font-size: 14px; text-decoration: none;">Read Guide &rarr;</a>
          </article>
        </section>
      </main>
    `
  },
  {
    path: '/guides/technical-interview-prep',
    outputPath: 'guides/technical-interview-prep/index.html',
    title: 'How to Prepare for Technical Coding Interviews: A Structured Framework – CodeXpertAI',
    description: 'A practical, step-by-step methodology for mastering algorithmic problem solving, time complexity trade-offs, and live technical communication.',
    canonical: `${DOMAIN}/guides/technical-interview-prep`,
    schemas: [
      createBreadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Guides', path: '/guides' },
        { name: 'Technical Interview Prep', path: '/guides/technical-interview-prep' }
      ]),
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: 'How to Prepare for Technical Coding Interviews: A Structured Framework',
        description: 'A practical, step-by-step methodology for mastering algorithmic problem solving, time complexity trade-offs, and live technical communication.',
        image: OG_IMAGE,
        datePublished: '2026-10-18',
        dateModified: '2026-10-18',
        author: {
          '@type': 'Organization',
          name: 'CodeXpertAI Technical Curriculum Team',
          url: CORP_URL
        },
        publisher: {
          '@type': 'Organization',
          name: 'Nexora Techno',
          url: CORP_URL,
          logo: { '@type': 'ImageObject', url: LOGO_URL }
        },
        inLanguage: 'en-US'
      }
    ],
    noindex: false
  },
  {
    path: '/guides/effective-coding-practice',
    outputPath: 'guides/effective-coding-practice/index.html',
    title: 'How to Practise Programming Problems Effectively & Interpret Test Results – CodeXpertAI',
    description: 'Learn how to break down complex challenges, diagnose failed test assertions, and use execution feedback to systematically eliminate knowledge gaps.',
    canonical: `${DOMAIN}/guides/effective-coding-practice`,
    schemas: [
      createBreadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Guides', path: '/guides' },
        { name: 'Effective Coding Practice', path: '/guides/effective-coding-practice' }
      ]),
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: 'How to Practise Programming Problems Effectively & Interpret Test Results',
        description: 'Learn how to break down complex challenges, diagnose failed test assertions, and use execution feedback to systematically eliminate knowledge gaps.',
        image: OG_IMAGE,
        datePublished: '2026-10-18',
        dateModified: '2026-10-18',
        author: {
          '@type': 'Organization',
          name: 'CodeXpertAI Technical Curriculum Team',
          url: CORP_URL
        },
        publisher: {
          '@type': 'Organization',
          name: 'Nexora Techno',
          url: CORP_URL,
          logo: { '@type': 'ImageObject', url: LOGO_URL }
        },
        inLanguage: 'en-US'
      }
    ],
    noindex: false
  },
  {
    path: '/guides/ai-mock-interview-guide',
    outputPath: 'guides/ai-mock-interview-guide/index.html',
    title: 'Mastering AI-Guided Technical & Behavioral Mock Interviews – CodeXpertAI',
    description: 'How AI interview engines evaluate candidates, how to structure STAR responses, and how to turn diagnostic session reports into career progress.',
    canonical: `${DOMAIN}/guides/ai-mock-interview-guide`,
    schemas: [
      createBreadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Guides', path: '/guides' },
        { name: 'AI Mock Interview Guide', path: '/guides/ai-mock-interview-guide' }
      ]),
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: 'Mastering AI-Guided Technical & Behavioral Mock Interviews',
        description: 'How AI interview engines evaluate candidates, how to structure STAR responses, and how to turn diagnostic session reports into career progress.',
        image: OG_IMAGE,
        datePublished: '2026-10-18',
        dateModified: '2026-10-18',
        author: {
          '@type': 'Organization',
          name: 'CodeXpertAI Technical Curriculum Team',
          url: CORP_URL
        },
        publisher: {
          '@type': 'Organization',
          name: 'Nexora Techno',
          url: CORP_URL,
          logo: { '@type': 'ImageObject', url: LOGO_URL }
        },
        inLanguage: 'en-US'
      }
    ],
    noindex: false
  },
  {
    path: '/privacy',
    outputPath: 'privacy/index.html',
    title: 'Privacy Policy – CodeXpertAI',
    description: 'Read the official CodeXpertAI privacy policy by Nexora Techno. Understand how we collect, store, and protect student and developer data.',
    canonical: `${DOMAIN}/privacy`,
    schemas: [createBreadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Privacy Policy', path: '/privacy' }])],
    noindex: false
  },
  {
    path: '/terms',
    outputPath: 'terms/index.html',
    title: 'Terms and Conditions – CodeXpertAI',
    description: 'Review the official terms of service and conditions for CodeXpertAI, a product of Nexora Techno. Guidelines for coding practice and interview simulations.',
    canonical: `${DOMAIN}/terms`,
    schemas: [createBreadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Terms and Conditions', path: '/terms' }])],
    noindex: false
  },
  {
    path: '/404',
    outputPath: '404.html',
    title: 'Page Not Found (404) – CodeXpertAI',
    description: 'The page you requested could not be found on CodeXpertAI. Please verify the URL or return to our homepage.',
    canonical: `${DOMAIN}/`,
    schemas: [],
    noindex: true,
    content: `
      <main style="max-width: 600px; margin: 80px auto; padding: 24px; text-align: center;">
        <h1 style="color: #EF4444; font-size: 48px; margin: 0 0 16px 0;">404</h1>
        <h2 style="color: #FFFFFF; font-size: 24px; margin: 0 0 16px 0;">Page Not Found</h2>
        <p style="color: #A1A1AA; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">The requested page does not exist on CodeXpertAI. Please verify the URL or return to our homepage.</p>
        <a href="/" style="display: inline-block; background-color: #3B82F6; color: #FFFFFF; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">Return to Homepage</a>
      </main>
    `
  }
];

console.log('[Prerender] Starting static HTML generation for public routes...');

for (const route of ROUTES) {
  let html = baseTemplate;

  // 1. Replace Title
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${route.title}</title>`);

  // 2. Replace Meta Description
  html = html.replace(
    /<meta name="description" content="[\s\S]*?" \/>/i,
    `<meta name="description" content="${route.description}" />`
  );

  // 3. Replace Canonical Link
  html = html.replace(
    /<link rel="canonical" href="[\s\S]*?" \/>/i,
    `<link rel="canonical" href="${route.canonical}" />`
  );

  // 4. Update Open Graph Meta Tags
  html = html.replace(
    /<meta property="og:title" content="[\s\S]*?" \/>/i,
    `<meta property="og:title" content="${route.title}" />`
  );
  html = html.replace(
    /<meta property="og:description" content="[\s\S]*?" \/>/i,
    `<meta property="og:description" content="${route.description}" />`
  );
  html = html.replace(
    /<meta property="og:url" content="[\s\S]*?" \/>/i,
    `<meta property="og:url" content="${route.canonical}" />`
  );

  // 5. Update Twitter Meta Tags
  html = html.replace(
    /<meta name="twitter:title" content="[\s\S]*?" \/>/i,
    `<meta name="twitter:title" content="${route.title}" />`
  );
  html = html.replace(
    /<meta name="twitter:description" content="[\s\S]*?" \/>/i,
    `<meta name="twitter:description" content="${route.description}" />`
  );

  // 6. Handle Robots noindex
  if (route.noindex) {
    if (html.includes('<meta name="robots"')) {
      html = html.replace(/<meta name="robots" content=".*?" \/>/i, '<meta name="robots" content="noindex, nofollow" />');
    } else {
      html = html.replace('</head>', '  <meta name="robots" content="noindex, nofollow" />\n  </head>');
    }
  }

  // 7. Update JSON-LD Script
  if (route.schemas && route.schemas.length > 0) {
    const jsonLdContent = JSON.stringify(route.schemas, null, 2);
    html = html.replace(
      /<script id="root-seo-jsonld" type="application\/ld\+json">[\s\S]*?<\/script>/i,
      `<script id="root-seo-jsonld" type="application/ld+json">\n${jsonLdContent}\n    </script>`
    );
  }

  // 8. Inject Pre-rendered Content into #root if specified
  if (route.content) {
    const headerMarkup = `
      <header role="banner" style="padding: 16px 24px; border-bottom: 1px solid #27272A; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <a href="/" style="display: flex; align-items: center; gap: 12px; text-decoration: none;">
            <img src="/codexpertai-logo.png" alt="CodeXpertAI Logo" width="32" height="32" style="border-radius: 4px;" />
            <div>
              <strong style="color: #FFFFFF; font-size: 18px;">CodeXpert<span style="color: #3B82F6;">AI</span></strong>
              <div style="color: #A1A1AA; font-size: 11px;">A product of Nexora Techno</div>
            </div>
          </a>
        </div>
        <nav aria-label="Main Navigation">
          <a href="/about" style="color: #E4E4E7; margin-right: 16px; text-decoration: none;">About</a>
          <a href="/faq" style="color: #E4E4E7; margin-right: 16px; text-decoration: none;">FAQ</a>
          <a href="/guides" style="color: #E4E4E7; margin-right: 16px; text-decoration: none;">Guides</a>
          <a href="/login" style="color: #60A5FA; text-decoration: none;">Sign In</a>
        </nav>
      </header>
    `;

    const footerMarkup = `
      <footer role="contentinfo" style="border-top: 1px solid #27272A; padding: 32px 24px; margin-top: 64px; text-align: center; color: #71717A; font-size: 13px;">
        <p>CodeXpertAI — A unified developer platform created by <a href="https://nexoratechno.in" target="_blank" rel="noopener noreferrer" style="color: #60A5FA;">Nexora Techno</a>.</p>
        <p style="margin: 8px 0;">
          Email Support: <a href="mailto:support@codexpertai.in" style="color: #60A5FA;">support@codexpertai.in</a> &bull;
          Instagram: <a href="https://www.instagram.com/codexpertai_nt/" target="_blank" rel="noopener noreferrer" style="color: #F472B6;">@codexpertai_nt</a>
        </p>
        <p>
          <a href="/about" style="color: #A1A1AA; margin: 0 8px;">About</a> |
          <a href="/faq" style="color: #A1A1AA; margin: 0 8px;">FAQ</a> |
          <a href="/guides" style="color: #A1A1AA; margin: 0 8px;">Guides</a> |
          <a href="/privacy" style="color: #A1A1AA; margin: 0 8px;">Privacy Policy</a> |
          <a href="/terms" style="color: #A1A1AA; margin: 0 8px;">Terms</a>
        </p>
      </footer>
    `;

    const fullRootMarkup = `<div id="root">\n${headerMarkup}\n${route.content}\n${footerMarkup}\n    </div>`;
    html = html.replace(/<div id="root">[\s\S]*?<\/div>/i, fullRootMarkup);
  }

  // Write file
  const fullOutputPath = path.join(distDir, route.outputPath);
  const targetDir = path.dirname(fullOutputPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  fs.writeFileSync(fullOutputPath, html, 'utf-8');
  console.log(`[Prerender] Generated: dist/${route.outputPath} (${route.canonical})`);
}

console.log('[Prerender] Successfully prerendered all public routes!');
