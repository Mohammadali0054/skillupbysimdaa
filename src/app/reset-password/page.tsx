"use client";

import { useState } from 'react';
import { generateLoginOtp, verifyLoginOtp, updatePasswordByEmail } from '@/app/actions';
import styles from '../login/login.module.css';

export default function ResetPasswordPage() {
  const [step, setStep] = useState(1); // 1 = Email, 2 = OTP, 3 = New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await generateLoginOtp(email);
    setLoading(false);
    
    if (result.success) {
      setStep(2);
    } else {
      alert(result.error || 'Failed to send OTP');
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await verifyLoginOtp(email, otp);
    setLoading(false);
    
    if (result.success) {
      setStep(3);
    } else {
      alert(result.error || 'Invalid OTP');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return alert('Passwords do not match');
    }
    if (newPassword.length < 6) {
      return alert('Password must be at least 6 characters');
    }

    setLoading(true);
    const result = await updatePasswordByEmail(email, newPassword);
    setLoading(false);

    if (result.success) {
      alert('Password reset successful! Redirecting to login...');
      window.location.href = '/login';
    } else {
      alert(result.error || 'Failed to reset password');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <form 
        className={styles.loginForm} 
        onSubmit={step === 1 ? handleEmailSubmit : step === 2 ? handleOtpSubmit : handlePasswordSubmit}
      >
        <h1 className={styles.title}>Reset Password</h1>
        
        {step === 1 && (
          <>
            <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
              Enter your email address and we'll send you an OTP to verify your identity.
            </p>
            <div className={styles.inputGroup}>
              <label>Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.input}
              />
            </div>
            <button type="submit" disabled={loading} className={styles.button}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
              Enter the 6-digit OTP sent to {email}
            </p>
            <div className={styles.inputGroup}>
              <label>OTP Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
                className={styles.input}
                style={{ textAlign: 'center', letterSpacing: '0.25rem', fontSize: '1.2rem' }}
              />
            </div>
            <button type="submit" disabled={loading || otp.length < 6} className={styles.button}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
              Create a new secure password for your account.
            </p>
            <div className={styles.inputGroup}>
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className={styles.input}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={styles.input}
              />
            </div>
            <button type="submit" disabled={loading} className={styles.button}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </>
        )}

        {step === 1 && (
          <p className={styles.loginLink} style={{ marginTop: '1.5rem' }}>
            Remembered your password? <a href="/login">Log in</a>
          </p>
        )}
      </form>
    </div>
  );
}
