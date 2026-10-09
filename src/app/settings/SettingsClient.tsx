"use client";

import { useState } from 'react';
import { updateUserDetails, changeUserPassword } from '@/app/actions';

export default function SettingsClient({ user }: { user: any }) {
  const [email, setEmail] = useState(user.email);
  const [emailLoading, setEmailLoading] = useState(false);
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email === user.email) return;
    
    setEmailLoading(true);
    const result = await updateUserDetails(user.id, user.email, email);
    setEmailLoading(false);
    
    if (result.success) {
      alert('Email updated successfully!');
      // Refresh page to sync new session
      window.location.reload();
    } else {
      alert(result.error || 'Failed to update email');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return alert('Passwords do not match');
    }
    if (newPassword.length < 6) {
      return alert('Password must be at least 6 characters');
    }

    setPasswordLoading(true);
    const result = await changeUserPassword(user.id, newPassword);
    setPasswordLoading(false);

    if (result.success) {
      alert('Password changed successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      alert(result.error || 'Failed to change password');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Update Email Section */}
      <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px' }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Update Email Address</h3>
        <form onSubmit={handleUpdateEmail} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
            />
          </div>
          <button 
            type="submit" 
            disabled={emailLoading || email === user.email}
            className="btn btn-primary"
            style={{ alignSelf: 'flex-start', marginTop: '0.5rem', opacity: (emailLoading || email === user.email) ? 0.6 : 1 }}
          >
            {emailLoading ? 'Updating...' : 'Update Email'}
          </button>
        </form>
      </div>

      {/* Change Password Section */}
      <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px' }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Change Password</h3>
        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>New Password</label>
            <input 
              type="password" 
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Confirm New Password</label>
            <input 
              type="password" 
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
            <button 
              type="submit" 
              disabled={passwordLoading || !newPassword || !confirmPassword}
              className="btn btn-primary"
              style={{ opacity: (passwordLoading || !newPassword || !confirmPassword) ? 0.6 : 1 }}
            >
              {passwordLoading ? 'Changing...' : 'Change Password'}
            </button>
            <a href="/reset-password" style={{ color: 'var(--accent-primary)', fontSize: '0.9rem', textDecoration: 'none' }}>
              Forgot Password?
            </a>
          </div>
        </form>
      </div>

    </div>
  );
}
