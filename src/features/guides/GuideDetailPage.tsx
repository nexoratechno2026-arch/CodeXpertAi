import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Clock, Calendar, User, ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import { SEOHead } from '@/components/seo/SEOHead';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getBreadcrumbSchema, getTechArticleSchema } from '@/lib/seo';
import { getGuideBySlug } from './guidesData';
import styles from './Guides.module.css';

export const GuideDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const guide = slug ? getGuideBySlug(slug) : undefined;

  if (!guide) {
    return <Navigate to="/guides" replace />;
  }

  const breadcrumbData = getBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Guides', item: '/guides' },
    { name: guide.title, item: `/guides/${guide.slug}` },
  ]);

  const articleSchema = getTechArticleSchema({
    title: guide.title,
    description: guide.excerpt,
    path: `/guides/${guide.slug}`,
    datePublished: guide.datePublished,
    dateModified: guide.dateModified,
    authorName: guide.author,
  });

  return (
    <div className={styles.guidesPage}>
      <SEOHead
        title={`${guide.title} — CodeXpertAI Guide`}
        description={guide.excerpt}
        canonicalPath={`/guides/${guide.slug}`}
        ogType="article"
        jsonLd={[breadcrumbData, articleSchema]}
      />

      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/guides">Guides</Link>
          <span>/</span>
          <span style={{ color: 'var(--color-text-primary)' }}>{guide.category}</span>
        </nav>

        <article className={styles.articleContainer}>
          {/* Header */}
          <header className={styles.articleHeader}>
            <Link
              to="/guides"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--color-text-tertiary)',
                textDecoration: 'none',
                fontSize: '0.8125rem',
                marginBottom: '1rem',
              }}
            >
              <ArrowLeft size={14} /> Back to all guides
            </Link>

            <div className={styles.badgeRow}>
              <Badge variant="accent" size="sm">{guide.category}</Badge>
              <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Educational Guide</span>
            </div>

            <h1 className={styles.title} style={{ margin: '0.5rem 0' }}>
              {guide.title}
            </h1>

            <div className={styles.articleMeta}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <User size={13} />
                {guide.author}
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={13} />
                Updated {new Date(guide.dateModified).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={13} />
                {guide.readTime}
              </span>
            </div>
          </header>

          {/* Article Body */}
          <div className={styles.articleBody}>
            <p style={{ fontSize: '1.125rem', color: 'var(--color-text-primary)', fontWeight: 500, lineHeight: 1.7, marginBottom: '2rem' }}>
              {guide.content.lead}
            </p>

            {guide.content.sections.map((section, idx) => (
              <section key={idx} style={{ marginBottom: '2.5rem' }}>
                <h2>{section.heading}</h2>

                {section.paragraphs.map((para, pIdx) => (
                  <p key={pIdx}>{para}</p>
                ))}

                {section.keyTakeaway && (
                  <div className={styles.calloutBox}>
                    <strong>Key Architectural Takeaway:</strong> {section.keyTakeaway}
                  </div>
                )}
              </section>
            ))}

            {/* Related Practice CTA */}
            <div
              style={{
                marginTop: '3rem',
                padding: '24px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border-default)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1.0625rem', color: '#F5F5F5', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={18} color="#3B82F6" />
                Apply These Concepts in Practice
              </h3>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#9CA3AF', lineHeight: 1.6 }}>
                CodeXpertAI provides structured algorithmic challenges in CodeLab and realistic technical simulations in InterviewAI. Rehearse with real compilers and AI feedback.
              </p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
                <Link to="/codelab" style={{ textDecoration: 'none' }}>
                  <Button variant="primary" size="sm" rightIcon={<ArrowRight size={14} />}>
                    Practice in CodeLab
                  </Button>
                </Link>
                <Link to="/interview" style={{ textDecoration: 'none' }}>
                  <Button variant="secondary" size="sm">
                    Rehearse in InterviewAI
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};
