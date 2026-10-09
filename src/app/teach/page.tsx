import Link from 'next/link';
import styles from './teach.module.css';
import { fetchCareerOpportunities } from '@/app/actions';

export const metadata = {
  title: 'Teach on Simdaa | Instructor Careers',
  description: 'Become an instructor on Simdaa and change lives. Explore career opportunities and learn how you can teach with us.',
};

export default async function TeachPage() {
  const result = await fetchCareerOpportunities();
  const opportunities = result.success ? result.opportunities : [];
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Come teach with us</h1>
          <p>Become an instructor and change lives — including your own.</p>
          <Link href="/teach/apply" className={styles.ctaButton} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>Get Started</Link>
        </div>
      </div>

      {/* Benefits / Reasons to Start */}
      <section className={styles.reasons}>
        <h2>So many reasons to start</h2>
        <div className={styles.reasonsGrid}>
          <div className={styles.reasonCard}>
            <div className={styles.icon}>🎯</div>
            <h3>Teach your way</h3>
            <p>Publish the course you want, in the way you want, and always have control of your own content.</p>
          </div>
          <div className={styles.reasonCard}>
            <div className={styles.icon}>💡</div>
            <h3>Inspire learners</h3>
            <p>Teach what you know and help learners explore their interests, gain new skills, and advance their careers.</p>
          </div>
          <div className={styles.reasonCard}>
            <div className={styles.icon}>🏆</div>
            <h3>Get rewarded</h3>
            <p>Expand your professional network, build your expertise, and earn money on each paid enrollment.</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.stats}>
        <div className={styles.stat}>
          <h3>73M</h3>
          <p>Students</p>
        </div>
        <div className={styles.stat}>
          <h3>75+</h3>
          <p>Languages</p>
        </div>
        <div className={styles.stat}>
          <h3>1B</h3>
          <p>Enrollments</p>
        </div>
        <div className={styles.stat}>
          <h3>190+</h3>
          <p>Countries</p>
        </div>
      </section>

      {/* Careers Section for Instructor Job Opportunities */}
      <section className={styles.careers}>
        <div className={styles.careersContent}>
          <h2>Career Opportunities at Simdaa</h2>
          <p>Looking for a full-time role? We are hiring expert instructors to join our core team and build world-class curriculum.</p>
          
          <div className={styles.jobList}>
            {opportunities.length > 0 ? (
              opportunities.map((job: any) => (
                <div key={job.id} className={styles.jobCard}>
                  <div className={styles.jobInfo}>
                    <h3>{job.title}</h3>
                    <span className={styles.jobType}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px'}}>
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                      </svg>
                      {job.type}
                    </span>
                    {job.description && (
                      <p style={{ marginTop: '8px', fontSize: '0.9rem', color: '#6a6f73' }}>
                        {job.description}
                      </p>
                    )}
                  </div>
                  <Link href={`/teach/apply?jobId=${job.id}`} className={styles.applyButton} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    Apply Now
                  </Link>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', background: 'white', border: '1px solid #d1d7dc', borderRadius: '8px' }}>
                <h3 style={{ color: '#1c1d1f', marginBottom: '8px' }}>No openings right now</h3>
                <p style={{ color: '#6a6f73' }}>Check back later for new instructor opportunities at Simdaa.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Bottom Call to Action */}
      <section className={styles.bottomCta}>
        <h2>Become an instructor today</h2>
        <p>Join one of the world's largest online learning marketplaces.</p>
        <Link href="/teach/apply" className={styles.ctaButtonLarge} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>Get Started</Link>
      </section>
    </div>
  );
}
