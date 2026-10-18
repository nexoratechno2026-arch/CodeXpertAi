import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Calendar, Printer } from 'lucide-react';
import styles from './LegalPage.module.css';

export const PrivacyPolicyPage: React.FC = () => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.innerWrap}>
        {/* Breadcrumb Navigation */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link to="/" className={styles.breadcrumbLink}>Home</Link>
          <span>/</span>
          <span>Legal</span>
          <span>/</span>
          <span style={{ color: 'var(--color-text-primary)' }}>Privacy Policy</span>
        </nav>

        {/* Hero Header Card */}
        <header className={styles.headerCard}>
          <div className={styles.badgeRow}>
            <div className={styles.badge}>
              <Shield size={14} />
              <span>Official Legal Policy</span>
            </div>
            <div className={styles.updatedDate}>
              <Calendar size={14} />
              <span><strong>Last Updated:</strong> 17 October 2026</span>
            </div>
          </div>

          <h1 className={styles.title}>
            CODEXPERT AI — <span className={styles.titleHighlight}>PRIVACY POLICY</span>
          </h1>

          <p className={styles.subtitle}>
            How Codexpert AI collects, uses, stores, processes, and protects personal information when you access our platform, CodeLab, Interview AI, and related educational services.
          </p>

          <div className={styles.navTabs}>
            <span className={`${styles.tabLink} ${styles.tabLinkActive}`}>Privacy Policy</span>
            <Link to="/terms" className={styles.tabLink}>Terms and Conditions</Link>
            <button type="button" onClick={handlePrint} className={styles.printBtn} title="Print or save as PDF">
              <Printer size={14} />
              <span>Print Policy</span>
            </button>
          </div>
        </header>

        {/* 2-Column Layout */}
        <div className={styles.layoutGrid}>
          {/* Table of Contents Sticky Sidebar */}
          <aside className={styles.tocSidebar} aria-label="Table of Contents">
            <div className={styles.tocTitle}>Contents</div>
            <nav>
              <ul className={styles.tocList}>
                <li><a href="#intro" className={styles.tocLink}>1. Introduction</a></li>
                <li><a href="#info-collect" className={styles.tocLink}>2. Information We Collect</a></li>
                <li><a href="#how-we-use" className={styles.tocLink}>3. How We Use Information</a></li>
                <li><a href="#ai-processing" className={styles.tocLink}>4. AI Processing</a></li>
                <li><a href="#third-party" className={styles.tocLink}>5. Third-Party Services</a></li>
                <li><a href="#data-sharing" className={styles.tocLink}>6. Data Sharing</a></li>
                <li><a href="#data-retention" className={styles.tocLink}>7. Data Retention</a></li>
                <li><a href="#data-security" className={styles.tocLink}>8. Data Security</a></li>
                <li><a href="#cookies" className={styles.tocLink}>9. Cookies & Analytics</a></li>
                <li><a href="#children" className={styles.tocLink}>10. Children's Privacy</a></li>
                <li><a href="#rights" className={styles.tocLink}>11. Your Privacy Rights</a></li>
                <li><a href="#international" className={styles.tocLink}>12. International Processing</a></li>
                <li><a href="#changes" className={styles.tocLink}>13. Changes to Policy</a></li>
                <li><a href="#contact" className={styles.tocLink}>14. Contact Us</a></li>
              </ul>
            </nav>
          </aside>

          {/* Main Legal Content */}
          <main className={styles.contentBody}>
            {/* Section 1 */}
            <section id="intro" className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>01</span>
                <h2 className={styles.sectionTitle}>Introduction</h2>
              </div>
              <p className={styles.paragraph}>
                Welcome to Codexpert AI. Codexpert AI is an educational technology platform designed to help college students and freshers improve their programming, coding, technical knowledge, SQL skills, and interview performance.
              </p>
              <p className={styles.paragraph}>
                This Privacy Policy explains how Codexpert AI collects, uses, stores, processes, and protects personal information when users access our website, CodeLab, Interview AI, and related services.
              </p>
              <div className={styles.calloutBox}>
                By using the platform, you acknowledge that you have read this Privacy Policy.
              </div>
            </section>

            {/* Section 2 */}
            <section id="info-collect" className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>02</span>
                <h2 className={styles.sectionTitle}>Information We Collect</h2>
              </div>
              <p className={styles.paragraph}>
                Depending on the features you use, we may collect the following information:
              </p>

              <h3 className={styles.subSectionTitle}>A. Account Information</h3>
              <ul className={styles.list}>
                <li>Full name</li>
                <li>Email address</li>
                <li>Login and authentication details</li>
                <li>Profile information voluntarily provided by you</li>
                <li>Account preferences and settings</li>
              </ul>

              <h3 className={styles.subSectionTitle}>B. Learning and Coding Information</h3>
              <ul className={styles.list}>
                <li>Coding submissions and solutions</li>
                <li>Programming language preferences</li>
                <li>Practice history and completed challenges</li>
                <li>Interview questions and responses</li>
                <li>Assessment scores, progress, and feedback</li>
                <li>Course activity and learning progress</li>
              </ul>

              <h3 className={styles.subSectionTitle}>C. Voice and Text Interview Information</h3>
              <p className={styles.paragraph}>
                If you use Interview AI, we may process:
              </p>
              <ul className={styles.list}>
                <li>Questions asked during interview sessions</li>
                <li>Answers submitted through text</li>
                <li>Voice recordings or audio data, if recording is enabled</li>
                <li>Transcribed speech, where speech-to-text is used</li>
                <li>AI-generated feedback, scores, and interview reports</li>
              </ul>
              <p className={styles.paragraph}>
                Voice recordings will only be collected or retained according to the recording features and settings disclosed to you.
              </p>

              <h3 className={styles.subSectionTitle}>D. Technical Information</h3>
              <p className={styles.paragraph}>
                We may collect technical information such as:
              </p>
              <ul className={styles.list}>
                <li>Browser and device information</li>
                <li>IP address and security logs</li>
                <li>Login timestamps</li>
                <li>Usage analytics and error reports</li>
                <li>Cookies or similar technologies, where used</li>
              </ul>
              <p className={styles.paragraph}>
                We aim to collect only information reasonably necessary to operate and improve the platform.
              </p>
            </section>

            {/* Section 3 */}
            <section id="how-we-use" className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>03</span>
                <h2 className={styles.sectionTitle}>How We Use Your Information</h2>
              </div>
              <p className={styles.paragraph}>
                We may use collected information to:
              </p>
              <ul className={styles.list}>
                <li>Create and manage user accounts</li>
                <li>Authenticate users and secure access</li>
                <li>Provide coding practice and interview simulations</li>
                <li>Evaluate answers and provide AI-generated feedback</li>
                <li>Track learning progress and assessment history</li>
                <li>Improve platform functionality and reliability</li>
                <li>Respond to support requests</li>
                <li>Detect fraud, abuse, and security incidents</li>
                <li>Communicate important service updates</li>
                <li>Comply with applicable legal obligations</li>
              </ul>
              <p className={styles.paragraph}>
                We will not use personal information for unrelated purposes without an appropriate legal basis or required consent.
              </p>
            </section>

            {/* Section 4 */}
            <section id="ai-processing" className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>04</span>
                <h2 className={styles.sectionTitle}>Artificial Intelligence Processing</h2>
              </div>
              <p className={styles.paragraph}>
                Codexpert AI may use artificial intelligence to generate interview questions, evaluate responses, explain programming concepts, and provide personalized learning recommendations.
              </p>
              <p className={styles.paragraph}>
                Your submitted information may be processed by third-party AI, speech-to-text, or text-to-speech providers when these services are used.
              </p>
              <div className={styles.calloutBox}>
                We will disclose relevant processing practices where required. Please do not submit passwords, financial information, confidential employer information, or other sensitive information in interview responses or code submissions.
              </div>
              <p className={styles.paragraph}>
                AI-generated evaluations may be inaccurate and should be treated as learning guidance rather than guaranteed hiring decisions or professional certification.
              </p>
            </section>

            {/* Section 5 */}
            <section id="third-party" className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>05</span>
                <h2 className={styles.sectionTitle}>Third-Party Services</h2>
              </div>
              <p className={styles.paragraph}>
                Codexpert AI may rely on third-party providers for services such as:
              </p>
              <ul className={styles.list}>
                <li>Authentication and account management</li>
                <li>Database hosting and storage</li>
                <li>AI model processing</li>
                <li>Voice recognition and speech generation</li>
                <li>Website hosting and performance monitoring</li>
                <li>Payment processing, if paid features are introduced</li>
              </ul>
              <p className={styles.paragraph}>
                These providers may process information according to their own privacy policies and contractual obligations.
              </p>
              <p className={styles.paragraph}>
                We do not control the independent privacy practices of third-party services. Users should review the relevant provider policies where appropriate.
              </p>
            </section>

            {/* Section 6 */}
            <section id="data-sharing" className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>06</span>
                <h2 className={styles.sectionTitle}>Data Sharing</h2>
              </div>
              <p className={styles.paragraph}>
                We do not sell personal information as a business practice.
              </p>
              <p className={styles.paragraph}>
                We may share information:
              </p>
              <ul className={styles.list}>
                <li>With service providers necessary to operate the platform</li>
                <li>When you explicitly choose to share your profile or results</li>
                <li>When required by law or a valid legal request</li>
                <li>To protect the rights, security, and integrity of the platform</li>
                <li>During a business restructuring, where legally permitted and subject to appropriate safeguards</li>
              </ul>
              <p className={styles.paragraph}>
                We will not disclose private interview reports to employers or educational institutions unless you authorize the disclosure or it is otherwise lawfully permitted.
              </p>
            </section>

            {/* Section 7 */}
            <section id="data-retention" className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>07</span>
                <h2 className={styles.sectionTitle}>Data Retention</h2>
              </div>
              <p className={styles.paragraph}>
                We retain information for as long as reasonably necessary to provide the services, maintain learning history, resolve disputes, ensure security, and comply with legal obligations.
              </p>
              <p className={styles.paragraph}>
                Retention periods may vary by information type and service provider.
              </p>
              <p className={styles.paragraph}>
                You may request account deletion or deletion of eligible personal information using the contact details below. Some information may need to be retained where required by law or for legitimate security and legal purposes.
              </p>
            </section>

            {/* Section 8 */}
            <section id="data-security" className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>08</span>
                <h2 className={styles.sectionTitle}>Data Security</h2>
              </div>
              <p className={styles.paragraph}>
                We use reasonable technical and organizational safeguards intended to protect information against unauthorized access, alteration, disclosure, or destruction.
              </p>
              <p className={styles.paragraph}>
                No internet-based system can guarantee absolute security. Users are responsible for protecting their login credentials and reporting suspected unauthorized access.
              </p>
            </section>

            {/* Section 9 */}
            <section id="cookies" className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>09</span>
                <h2 className={styles.sectionTitle}>Cookies and Analytics</h2>
              </div>
              <p className={styles.paragraph}>
                We may use cookies, local storage, or analytics technologies to maintain sessions, remember preferences, measure platform performance, and improve usability.
              </p>
              <p className={styles.paragraph}>
                You can manage cookies through your browser settings where supported. Disabling certain technologies may affect platform functionality.
              </p>
            </section>

            {/* Section 10 */}
            <section id="children" className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>10</span>
                <h2 className={styles.sectionTitle}>Children's Privacy</h2>
              </div>
              <p className={styles.paragraph}>
                Codexpert AI is designed primarily for college students, freshers, and other eligible learners.
              </p>
              <p className={styles.paragraph}>
                Users who are minors must use the platform in accordance with applicable law and any required parent or guardian consent. We do not knowingly collect children's personal information in violation of applicable law.
              </p>
              <p className={styles.paragraph}>
                If you believe a child has provided information unlawfully, contact us so we can review the request.
              </p>
            </section>

            {/* Section 11 */}
            <section id="rights" className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>11</span>
                <h2 className={styles.sectionTitle}>Your Privacy Rights</h2>
              </div>
              <p className={styles.paragraph}>
                Subject to applicable law, you may be able to:
              </p>
              <ul className={styles.list}>
                <li>Request access to your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of eligible information</li>
                <li>Withdraw consent where processing relies on consent</li>
                <li>Request information about how your data is processed</li>
                <li>Raise a privacy complaint</li>
              </ul>
              <p className={styles.paragraph}>
                We may need to verify your identity before acting on a request.
              </p>
            </section>

            {/* Section 12 */}
            <section id="international" className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>12</span>
                <h2 className={styles.sectionTitle}>International Data Processing</h2>
              </div>
              <p className={styles.paragraph}>
                Some service providers may process information on servers located outside your state or country. Where applicable, such processing will be subject to relevant legal requirements and safeguards.
              </p>
            </section>

            {/* Section 13 */}
            <section id="changes" className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>13</span>
                <h2 className={styles.sectionTitle}>Changes to This Policy</h2>
              </div>
              <p className={styles.paragraph}>
                We may update this Privacy Policy as our services, technologies, or legal obligations change.
              </p>
              <p className={styles.paragraph}>
                The updated version will be published on the platform with a revised “Last Updated” date. Where legally required, we will provide additional notice or obtain consent.
              </p>
            </section>

            {/* Section 14 */}
            <section id="contact" className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>14</span>
                <h2 className={styles.sectionTitle}>Contact Us</h2>
              </div>
              <p className={styles.paragraph}>
                For privacy questions, data requests, or complaints, contact:
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
                  <div className={styles.contactLabel}>Privacy Contact / Grievance Officer</div>
                  <div className={styles.contactValue}>
                    <a href="mailto:grievance@codexpertai.com" className={styles.contactLink}>
                      grievance@codexpertai.com
                    </a>
                  </div>
                </div>
              </div>

              <div className={styles.calloutBox} style={{ marginTop: 'var(--space-6)' }}>
                By using Codexpert AI, you agree to the processing practices described in this Privacy Policy, subject to applicable law and any consent required for specific processing activities.
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};
