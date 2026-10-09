'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { submitInstructorApplication } from '@/app/actions';
import styles from './apply.module.css';

function ApplyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    const formData = new FormData(e.currentTarget);
    if (jobId) {
      formData.append('jobId', jobId);
    }

    const result = await submitInstructorApplication(formData);
    
    if (result.success) {
      setMessage('Application submitted successfully! We will get back to you soon.');
      setTimeout(() => {
        router.push('/teach');
      }, 3000);
    } else {
      setError(result.error || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div className={styles.formCard}>
      <h1>Apply to Teach</h1>
      <p>Fill out the form below and we'll be in touch.</p>

      {message && <div className={styles.message}>{message}</div>}
      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Full Name</label>
          <input type="text" id="name" name="name" required />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="age">Age</label>
          <input type="number" id="age" name="age" required min="18" />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email">Email Address</label>
          <input type="email" id="email" name="email" required />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="phoneNo">Phone Number</label>
          <input type="tel" id="phoneNo" name="phoneNo" required />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="linkedinLink">LinkedIn Profile Link (Optional)</label>
          <input type="url" id="linkedinLink" name="linkedinLink" />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="githubLink">GitHub Profile Link (Optional)</label>
          <input type="url" id="githubLink" name="githubLink" />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="resume">Resume (PDF)</label>
          <input type="file" id="resume" name="resume" accept="application/pdf" required />
        </div>

        <button type="submit" disabled={loading} className={styles.submitBtn}>
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
}

export default function ApplyPage() {
  return (
    <div className={styles.container}>
      <Suspense fallback={<div>Loading form...</div>}>
        <ApplyForm />
      </Suspense>
    </div>
  );
}
