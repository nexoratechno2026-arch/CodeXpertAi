import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';
import { SEOHead } from '@/components/seo/SEOHead';
import { Badge } from '@/components/ui/Badge';
import { getBreadcrumbSchema } from '@/lib/seo';
import { GUIDES } from './guidesData';
import styles from './Guides.module.css';

export const GuidesHubPage: React.FC = () => {
  const breadcrumbData = getBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Guides', item: '/guides' },
  ]);

  return (
    <div className={styles.guidesPage}>
      <SEOHead
        title="Engineering &amp; Technical Interview Guides – CodeXpertAI"
        description="Explore in-depth technical interview guides, algorithmic problem-solving strategies, and system design frameworks for software engineers."
        canonicalPath="/guides"
        jsonLd={[breadcrumbData]}
      />

      <div className="container">
        {/* Breadcrumbs */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span style={{ color: 'var(--color-text-primary)' }}>Guides</span>
        </nav>

        {/* Header Card */}
        <header className={styles.headerCard}>
          <div className={styles.badgeRow}>
            <Badge variant="accent" size="sm">Technical Resources</Badge>
            <Badge variant="default" size="sm">Evidence-Grounded Preparation</Badge>
          </div>
          <h1 className={styles.title}>
            Engineering &amp; <span className={styles.titleAccent}>Interview Guides</span>
          </h1>
          <p className={styles.subtitle}>
            In-depth architectural frameworks, algorithmic problem-solving strategies, and interview communication methodologies curated by the CodeXpertAI curriculum team.
          </p>
        </header>

        {/* Guides Grid */}
        <div className={styles.guidesGrid}>
          {GUIDES.map((guide) => (
            <Link key={guide.slug} to={`/guides/${guide.slug}`} className={styles.guideCard}>
              <div className={styles.cardMeta}>
                <Badge variant="default" size="sm">{guide.category}</Badge>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} />
                  {guide.readTime}
                </span>
              </div>

              <h2 className={styles.cardTitle}>{guide.title}</h2>
              <p className={styles.cardExcerpt}>{guide.excerpt}</p>

              <div className={styles.cardFooter}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BookOpen size={14} />
                  Read Full Guide
                </span>
                <ArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
