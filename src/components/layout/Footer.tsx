import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerGrid}>
          <div className={styles.footerCol}>
            <h3>SimdaaLearn</h3>
            <Link href="/about" className={styles.footerLink}>About Us</Link>
            <Link href="/careers" className={styles.footerLink}>Careers</Link>
            <Link href="/contact" className={styles.footerLink}>Contact Us</Link>
            <Link href="/blog" className={styles.footerLink}>Blog</Link>
          </div>
          
          <div className={styles.footerCol}>
            <h3>For Students</h3>
            <Link href="/courses" className={styles.footerLink}>Explore Courses</Link>
            <Link href="/pricing" className={styles.footerLink}>Pricing</Link>
            <Link href="/scholarships" className={styles.footerLink}>Scholarships</Link>
            <Link href="/success-stories" className={styles.footerLink}>Success Stories</Link>
          </div>

          <div className={styles.footerCol}>
            <h3>For Instructors</h3>
            <Link href="/teach" className={styles.footerLink}>Teach on Simdaa</Link>
            <Link href="/instructor-guidelines" className={styles.footerLink}>Instructor Guidelines</Link>
            <Link href="/partner-program" className={styles.footerLink}>Partner Program</Link>
            <Link href="/resources" className={styles.footerLink}>Resources</Link>
          </div>

          <div className={styles.footerCol}>
            <h3>Legal & Support</h3>
            <Link href="/terms" className={styles.footerLink}>Terms of Service</Link>
            <Link href="/privacy" className={styles.footerLink}>Privacy Policy</Link>
            <Link href="/help" className={styles.footerLink}>Help Center</Link>
            <Link href="/sitemap" className={styles.footerLink}>Sitemap</Link>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <Link href="/" className={styles.logo}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--secondary)' }}>
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
            <span>
              Simdaa<span className="gradient-text">Learn</span>
            </span>
          </Link>
          <div className={styles.copyright}>
            &copy; {new Date().getFullYear()} SimdaaLearn, Inc. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
