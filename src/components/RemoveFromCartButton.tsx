'use client';

import { useState } from 'react';
import { removeFromCart } from '@/app/actions';

export default function RemoveFromCartButton({ courseId }: { courseId: number }) {
  const [loading, setLoading] = useState(false);

  const handleRemove = async () => {
    setLoading(true);
    await removeFromCart(courseId);
    setLoading(false);
  };

  return (
    <button 
      onClick={handleRemove} 
      disabled={loading}
      className="btn"
      style={{ 
        padding: '0.5rem 1rem', 
        background: 'transparent', 
        border: '1px solid #ff4d4f', 
        color: '#ff4d4f', 
        borderRadius: '8px',
        cursor: loading ? 'not-allowed' : 'pointer'
      }}
    >
      {loading ? 'Removing...' : 'Remove'}
    </button>
  );
}
