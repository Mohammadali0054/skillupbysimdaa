import Link from 'next/link';
import { getCartItems } from '@/app/actions';
import CheckoutForm from '@/components/CheckoutForm';

export default async function CheckoutPage() {
  const result = await getCartItems();
  const items = result.success && result.items ? result.items : [];
  const userEnrollmentCount = result.success && (result as any).userEnrollmentCount ? (result as any).userEnrollmentCount : 0;

  return (
    <div style={{ padding: '4rem 2rem', minHeight: '80vh', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Checkout</h2>
        <Link href="/cart" style={{ color: 'var(--accent-primary)' }}>← Back to Cart</Link>
      </div>

      <CheckoutForm cartItems={items} userEnrollmentCount={userEnrollmentCount} />
    </div>
  );
}
