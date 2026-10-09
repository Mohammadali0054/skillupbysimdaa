import Link from 'next/link';
import { getCartItems } from '@/app/actions';
import RemoveFromCartButton from '@/components/RemoveFromCartButton';

export default async function CartPage() {
  const result = await getCartItems();
  const items = result.success && result.items ? result.items : [];
  const userEnrollmentCount = result.success && (result as any).userEnrollmentCount ? (result as any).userEnrollmentCount : 0;

  const getCoursePrice = (course: any) => {
    if (course.discountedPrice !== null && course.discountEndsAt !== null && new Date(course.discountEndsAt) > new Date()) {
      return course.discountedPrice;
    }
    return course.price;
  };

  let currentEnrollmentCount = userEnrollmentCount;
  const cartTotal = items.reduce((sum: number, item: any) => {
    const base = getCoursePrice(item.course);
    let automatedDiscount = 0;
    if (currentEnrollmentCount > 0 && currentEnrollmentCount % 5 === 0) {
      automatedDiscount = 50;
    }
    currentEnrollmentCount++;
    return sum + (base * (1 - automatedDiscount / 100));
  }, 0);

  return (
    <div style={{ padding: '4rem 2rem', minHeight: '80vh', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>My Cart</h2>
        <Link href="/courses" style={{ color: 'var(--accent-primary)' }}>← Back to Courses</Link>
      </div>

      {items.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>Your cart is empty.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {items.map((item: any) => (
            <div key={item.id} className="glass-card" style={{ display: 'flex', gap: '1rem', padding: '1rem', alignItems: 'center' }}>
              <img 
                src={item.course.thumbnailUrl || 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=200&q=80'} 
                alt={item.course.title} 
                style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
              />
              <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{item.course.title}</h3>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>₹{getCoursePrice(item.course).toFixed(2)}</span>
                </div>
                <RemoveFromCartButton courseId={item.course.id} />
              </div>
            </div>
          ))}
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderTop: '1px solid var(--glass-border)' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>
              Total: ₹{cartTotal.toFixed(2)}
            </span>
            <Link href="/checkout" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', textDecoration: 'none' }}>Proceed to Checkout</Link>
          </div>
        </div>
      )}
    </div>
  );
}
