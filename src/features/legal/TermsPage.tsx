import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Calendar, Printer } from 'lucide-react';
import { SEOHead } from '@/components/seo/SEOHead';
import { getBreadcrumbSchema } from '@/lib/seo';
import styles from './LegalPage.module.css';

export const TermsPage: React.FC = () => {
  const handlePrint = () => {
    window.print();
  };

  const breadcrumbs = getBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Terms and Conditions', item: '/terms' },
  ]);

  return (
    <div className={styles.pageContainer}>
      <SEOHead
        title="Terms and Conditions — CodeXpertAI"
        description="Official terms of service and conditions for CodeXpertAI, a product of Nexora Techno. Guidelines for platform usage, code execution, and interview simulations."
        canonicalPath="/terms"
        jsonLd={[breadcrumbs]}
      />
      <div className={styles.innerWrap}>
        {/* Breadcrumb Navigation */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link to="/" className={styles.breadcrumbLink}>Home</Link>
          <span>/</span>
          <span>Legal</span>
          <span>/</span>
          <span style={{ color: 'var(--color-text-primary)' }}>Terms and Conditions</span>
        </nav>

        {/* Hero Header Card */}
        <header className={styles.headerCard}>
          <div className={styles.badgeRow}>
            <div className={styles.badge}>
              <FileText size={14} />
              <span>Terms of Service</span>
            </div>
            <div className={styles.updatedDate}>
              <Calendar size={14} />
              <span><strong>Last Updated:</strong> 17 October 2026</span>
            </div>
          </div>

          <h1 className={styles.title}>
            CODEXPERT AI — <span className={styles.titleHighlight}>TERMS AND CONDITIONS</span>
          </h1>

          <p className={styles.subtitle}>
            The agreement governing your access to and use of Codexpert AI, CodeLab, Interview AI, and all associated educational software features.
          </p>

          <div className={styles.navTabs}>
            <Link to="/privacy" className={styles.tabLink}>Privacy Policy</Link>
            <span className={`${styles.tabLink} ${styles.tabLinkActive}`}>Terms and Conditions</span>
            <button type="button" onClick={handlePrint} className={styles.printBtn} title="Print or save as PDF">
              <Printer size={14} />
              <span>Print Terms</span>
            </button>
          </div>
        </header>

        {/* 2-Column Layout */}
        <div className={styles.layoutGrid}>
          {/* Table of Contents Sticky Sidebar */}
          <aside className={styles.tocSidebar} aria-label="Table of Contents">
            <div className={styles.tocTitle}>Terms Sections</div>
            <nav>
              <ul className={styles.tocList}>
                <li><a href="#acceptance" className={styles.tocLink}>1. Acceptance of Terms</a></li>
                <li><a href="#eligibility" className={styles.tocLink}>2. Eligibility & Accounts</a></li>
                <li><a href="#services" className={styles.tocLink}>3. Platform Services</a></li>
                <li><a href="#educational" className={styles.tocLink}>4. Educational Purpose</a></li>
                <li><a href="#acceptable-use" className={styles.tocLink}>5. Acceptable Use</a></li>
                <li><a href="#submissions" className={styles.tocLink}>6. Submissions & AI</a></li>
                <li><a href="#ai-content" className={styles.tocLink}>7. AI-Generated Content</a></li>
                <li><a href="#ip" className={styles.tocLink}>8. Intellectual Property</a></li>
                <li><a href="#third-party-terms" className={styles.tocLink}>9. Third-Party Services</a></li>
                <li><a href="#availability" className={styles.tocLink}>10. Availability & Changes</a></li>
                <li><a href="#fees" className={styles.tocLink}>11. Fees & Payments</a></li>
                <li><a href="#termination" className={styles.tocLink}>12. Suspension & Termination</a></li>
                <li><a href="#disclaimers" className={styles.tocLink}>13. Disclaimers & Liability</a></li>
                <li><a href="#indemnity" className={styles.tocLink}>14. Indemnity</a></li>
                <li><a href="#privacy-link" className={styles.tocLink}>15. Privacy</a></li>
                <li><a href="#changes-terms" className={styles.tocLink}>16. Changes to Terms</a></li>
                <li><a href="#governing-law" className={styles.tocLink}>17. Governing Law & Disputes</a></li>
                <li><a href="#contact-terms" className={styles.tocLink}>18. Contact Information</a></li>
              </ul>
            </nav>
          </aside>

          {/* Main Legal Content */}
          <main className={styles.contentBody}>
            {/* Section 1 */}
            <section id="acceptance" className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>01</span>
                <h2 className={styles.sectionTitle}>Acceptance of Terms</h2>
              </div>
              <p className={styles.paragraph}>
                Welcome to Codexpert AI, an educational technology platform offering coding practice, programming learning resources, and AI-powered interview preparation through CodeLab and Interview AI.
              </p>
              <div className={styles.calloutBox}>
                By accessing or using the platform, you agree to these Terms and Conditions. If you do not agree, you must stop using the services.
              </div>
            </section>

            {/* Section 2 */}
            <section id="eligibility" className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>02</span>
                <h2 className={styles.sectionTitle}>Eligibility and Accounts</h2>
              </div>
              <p className={styles.paragraph}>
                Users must provide accurate information when registering and maintain the confidentiality of their account credentials.
              </p>
              <p className={styles.paragraph}>
                You are responsible for activities carried out through your account. You must notify us if you suspect unauthorized access.
              </p>
              <p className={styles.paragraph}>
                If you are a minor, your use of the platform must comply with applicable legal requirements, including any required parental or guardian consent.
              </p>
              <p className={styles.paragraph}>
                We may suspend or restrict accounts involved in fraud, abuse, security violations, or breaches of these Terms, subject to applicable law.
              </p>
            </section>

            {/* Section 3 */}
            <section id="services" className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>03</span>
                <h2 className={styles.sectionTitle}>Platform Services</h2>
              </div>
              <p className={styles.paragraph}>
                Codexpert AI may provide:
              </p>
              <ul className={styles.list}>
                <li>Programming tutorials and learning resources</li>
                <li>Coding problems and assessments</li>
                <li>Code execution and automated test results</li>
                <li>Technical interview practice</li>
                <li>AI-powered voice and text interviews</li>
                <li>HR and behavioral interview simulations</li>
                <li>Progress tracking, scoring, and feedback</li>
                <li>Additional learning tools introduced over time</li>
              </ul>
              <p className={styles.paragraph}>
                Features may change, be added, or be discontinued as the platform develops.
              </p>
            </section>

            {/* Section 4 */}
            <section id="educational" className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>04</span>
                <h2 className={styles.sectionTitle}>Educational Purpose and No Guarantee</h2>
              </div>
              <p className={styles.paragraph}>
                Codexpert AI is intended for education, skill development, and interview preparation.
              </p>
              <p className={styles.paragraph}>
                We do not guarantee:
              </p>
              <ul className={styles.list}>
                <li>Employment, internships, or placement</li>
                <li>Selection by any company</li>
                <li>A particular interview score or assessment result</li>
                <li>The correctness of every AI-generated response</li>
                <li>Uninterrupted availability of every feature</li>
              </ul>
              <div className={styles.calloutBox}>
                Hiring outcomes depend on many factors beyond our control. AI interview feedback is a practice aid and is not a substitute for an employer's actual hiring assessment.
              </div>
            </section>

            {/* Section 5 */}
            <section id="acceptable-use" className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>05</span>
                <h2 className={styles.sectionTitle}>Acceptable Use</h2>
              </div>
              <p className={styles.paragraph}>
                You agree not to:
              </p>
              <ul className={styles.list}>
                <li>Use the platform for unlawful activities</li>
                <li>Attempt to access another user's account or private information</li>
                <li>Disrupt, damage, or overload the platform</li>
                <li>Bypass authentication, access controls, or security measures</li>
                <li>Upload malware or harmful code</li>
                <li>Abuse code execution or hosting resources</li>
                <li>Scrape, copy, or systematically extract platform content without authorization</li>
                <li>Reverse engineer or exploit the platform except where applicable law permits</li>
                <li>Impersonate another person or misrepresent your qualifications</li>
                <li>Use the platform to harass, threaten, or harm others</li>
              </ul>
              <p className={styles.paragraph}>
                We may investigate suspected violations and take reasonable action to protect users and the platform.
              </p>
            </section>

            {/* Section 6 */}
            <section id="submissions" className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>06</span>
                <h2 className={styles.sectionTitle}>Coding Submissions and AI Interviews</h2>
              </div>
              <p className={styles.paragraph}>
                You retain ownership of code, answers, and other content you independently create, subject to any third-party rights.
              </p>
              <p className={styles.paragraph}>
                You grant Codexpert AI permission to process and use submitted content as reasonably necessary to provide the features you request, including code execution, interview evaluation, speech transcription, and feedback generation.
              </p>
              <p className={styles.paragraph}>
                You must have the right to submit any content you upload. Do not submit confidential source code belonging to an employer, client, or another person without permission.
              </p>
              <p className={styles.paragraph}>
                Code execution may be subject to technical limitations, time limits, resource limits, and security restrictions.
              </p>
            </section>

            {/* Section 7 */}
            <section id="ai-content" className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>07</span>
                <h2 className={styles.sectionTitle}>AI-Generated Content</h2>
              </div>
              <p className={styles.paragraph}>
                AI-generated questions, explanations, interview feedback, and scores may contain errors or omissions.
              </p>
              <p className={styles.paragraph}>
                You are responsible for reviewing outputs before relying on them. Do not treat AI-generated results as guaranteed professional advice, official certifications, or a prediction of an employer's hiring decision.
              </p>
              <div className={styles.calloutBox}>
                Users must not rely on automated scores as the sole basis for consequential decisions about themselves or others.
              </div>
            </section>

            {/* Section 8 */}
            <section id="ip" className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>08</span>
                <h2 className={styles.sectionTitle}>Intellectual Property</h2>
              </div>
              <p className={styles.paragraph}>
                The platform's branding, design, original educational content, software, interfaces, and other materials are owned by Codexpert AI or its licensors unless otherwise stated.
              </p>
              <p className={styles.paragraph}>
                You may use platform materials for personal learning and permitted educational purposes.
              </p>
              <p className={styles.paragraph}>
                You may not reproduce, redistribute, sell, publish, or commercially exploit platform content without permission, except where permitted by law or an applicable license.
              </p>
              <p className={styles.paragraph}>
                Third-party names, trademarks, and referenced technologies belong to their respective owners. Their appearance does not imply endorsement or partnership.
              </p>
            </section>

            {/* Section 9 */}
            <section id="third-party-terms" className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>09</span>
                <h2 className={styles.sectionTitle}>Third-Party Services and Links</h2>
              </div>
              <p className={styles.paragraph}>
                The platform may integrate or link to third-party services, including authentication providers, AI services, hosting providers, and payment processors.
              </p>
              <p className={styles.paragraph}>
                Those services may have separate terms and privacy policies. Codexpert AI is not responsible for third-party services outside its reasonable control.
              </p>
            </section>

            {/* Section 10 */}
            <section id="availability" className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>10</span>
                <h2 className={styles.sectionTitle}>Availability and Changes</h2>
              </div>
              <p className={styles.paragraph}>
                We aim to provide a reliable service but do not guarantee that the platform will always be available, uninterrupted, or error-free.
              </p>
              <p className={styles.paragraph}>
                We may perform maintenance, update features, impose reasonable usage limits, or temporarily suspend services for security, technical, or operational reasons.
              </p>
            </section>

            {/* Section 11 */}
            <section id="fees" className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>11</span>
                <h2 className={styles.sectionTitle}>Fees and Payments</h2>
              </div>
              <p className={styles.paragraph}>
                If paid courses, subscriptions, or other paid features are introduced, applicable prices, payment terms, renewal conditions, and cancellation or refund rules will be displayed before purchase.
              </p>
              <p className={styles.paragraph}>
                Payments may be processed by third-party payment providers. Their terms may also apply.
              </p>
              <p className={styles.paragraph}>
                No fee is payable for a feature expressly identified as free, unless the applicable offer clearly states otherwise.
              </p>
            </section>

            {/* Section 12 */}
            <section id="termination" className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>12</span>
                <h2 className={styles.sectionTitle}>Suspension and Termination</h2>
              </div>
              <p className={styles.paragraph}>
                You may stop using the platform at any time.
              </p>
              <p className={styles.paragraph}>
                We may suspend or terminate access where reasonably necessary because of a material breach of these Terms, security risks, unlawful activity, or discontinuation of a service, subject to applicable law.
              </p>
              <p className={styles.paragraph}>
                Where appropriate, we may provide notice and an opportunity to resolve a breach.
              </p>
            </section>

            {/* Section 13 */}
            <section id="disclaimers" className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>13</span>
                <h2 className={styles.sectionTitle}>Disclaimers and Limitation of Liability</h2>
              </div>
              <p className={styles.paragraph}>
                To the extent permitted by applicable law, the platform is provided on an “as available” basis without guarantees that every feature or AI output will be accurate or uninterrupted.
              </p>
              <p className={styles.paragraph}>
                Codexpert AI will not be liable for indirect or consequential losses arising from use of the platform to the extent such exclusion is legally permitted.
              </p>
              <p className={styles.paragraph}>
                Nothing in these Terms excludes liability that cannot lawfully be excluded, including any rights or remedies that users are entitled to under applicable consumer protection law.
              </p>
            </section>

            {/* Section 14 */}
            <section id="indemnity" className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>14</span>
                <h2 className={styles.sectionTitle}>Indemnity</h2>
              </div>
              <p className={styles.paragraph}>
                To the extent permitted by applicable law, you are responsible for claims and losses caused by your unlawful use of the platform, infringement of third-party rights, or material violation of these Terms.
              </p>
              <p className={styles.paragraph}>
                This clause does not remove any non-waivable rights you may have under applicable law.
              </p>
            </section>

            {/* Section 15 */}
            <section id="privacy-link" className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>15</span>
                <h2 className={styles.sectionTitle}>Privacy</h2>
              </div>
              <p className={styles.paragraph}>
                Your use of the platform is also governed by the Codexpert AI <Link to="/privacy" style={{ color: '#60A5FA', textDecoration: 'underline' }}>Privacy Policy</Link>, which explains how personal information is handled.
              </p>
            </section>

            {/* Section 16 */}
            <section id="changes-terms" className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>16</span>
                <h2 className={styles.sectionTitle}>Changes to These Terms</h2>
              </div>
              <p className={styles.paragraph}>
                We may revise these Terms when our platform or legal obligations change. Updated Terms will be published with a revised date.
              </p>
              <p className={styles.paragraph}>
                Where required by law, we will provide notice or obtain consent. Continued use after an update takes effect will be subject to applicable legal requirements.
              </p>
            </section>

            {/* Section 17 */}
            <section id="governing-law" className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>17</span>
                <h2 className={styles.sectionTitle}>Governing Law and Disputes</h2>
              </div>
              <p className={styles.paragraph}>
                These Terms are subject to the laws of India, to the extent applicable.
              </p>
              <p className={styles.paragraph}>
                Disputes will be handled by the competent courts or dispute-resolution forums having jurisdiction under applicable law. Nothing in this section removes mandatory consumer rights or statutory remedies.
              </p>
            </section>

            {/* Section 18 */}
            <section id="contact-terms" className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>18</span>
                <h2 className={styles.sectionTitle}>Contact Information</h2>
              </div>
              <p className={styles.paragraph}>
                For questions about these Terms, contact us using the details below:
              </p>

              <div className={styles.contactGrid}>
                <div className={styles.contactItem}>
                  <div className={styles.contactLabel}>Platform</div>
                  <div className={styles.contactValue}>Codexpert AI</div>
                </div>

                <div className={styles.contactItem}>
                  <div className={styles.contactLabel}>Email Support</div>
                  <div className={styles.contactValue}>
                    <a href="mailto:support@codexpertai.com" className={styles.contactLink}>
                      support@codexpertai.com
                    </a>
                  </div>
                </div>

                <div className={styles.contactItem}>
                  <div className={styles.contactLabel}>Official Website</div>
                  <div className={styles.contactValue}>
                    <a href="https://codexpertai.com" target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
                      https://codexpertai.com
                    </a>
                  </div>
                </div>

                <div className={styles.contactItem}>
                  <div className={styles.contactLabel}>Business / Legal Entity</div>
                  <div className={styles.contactValue}>
                    Codexpert AI Technologies
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};
