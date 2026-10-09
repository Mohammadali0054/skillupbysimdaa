'use client';

import { useState } from 'react';
import { addToCart, addToWishlist } from '@/app/actions';
import { useRouter } from 'next/navigation';

export default function CourseActions({ courseId }: { courseId: number }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAddToCart = async () => {
    setLoading(true);
    const result = await addToCart(courseId);
    if (result.success) {
      alert('Added to cart!');
    } else {
      if (result.error === 'Not logged in') {
        router.push('/login');
      } else {
        alert(result.error);
      }
    }
    setLoading(false);
  };

  const handleAddToWishlist = async () => {
    setLoading(true);
    const result = await addToWishlist(courseId);
    if (result.success) {
      alert('Added to wishlist!');
    } else {
      if (result.error === 'Not logged in') {
        router.push('/login');
      } else {
        alert(result.error);
      }
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
      <button 
        onClick={handleAddToCart} 
        disabled={loading}
        className="btn btn-primary" 
        style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', flex: 1 }}
      >
        Add to Cart
      </button>
      <button 
        onClick={handleAddToWishlist} 
        disabled={loading}
        className="btn" 
        style={{ 
          padding: '0.5rem 1rem', 
          fontSize: '0.9rem', 
          backgroundColor: 'transparent',
          border: '1px solid var(--accent-primary)',
          color: 'var(--accent-primary)',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        ♥
      </button>
    </div>
  );
}
