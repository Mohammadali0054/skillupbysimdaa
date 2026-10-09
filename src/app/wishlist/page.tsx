import Link from 'next/link';
import { getWishlistItems } from '@/app/actions';

export default async function WishlistPage() {
  const result = await getWishlistItems();
  const items = result.success && result.items ? result.items : [];

  return (
    <div style={{ padding: '4rem 2rem', minHeight: '80vh', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>My Wishlist</h2>
        <Link href="/courses" style={{ color: 'var(--accent-primary)' }}>← Back to Courses</Link>
      </div>

      {items.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>Your wishlist is empty.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {items.map((item: any) => (
            <div key={item.id} className="glass-card" style={{ display: 'flex', gap: '1rem', padding: '1rem', alignItems: 'center' }}>
              <img 
                src={item.course.thumbnailUrl || 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=200&q=80'} 
                alt={item.course.title} 
                style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
              />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{item.course.title}</h3>
                <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>₹{item.course.price.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
