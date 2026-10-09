'use client';

import { useState } from 'react';
import { validateCouponCode, processCheckout } from '@/app/actions';
import { useRouter } from 'next/navigation';

export default function CheckoutForm({ cartItems, userEnrollmentCount = 0 }: { cartItems: any[], userEnrollmentCount?: number }) {
  const router = useRouter();
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [appliedCouponId, setAppliedCouponId] = useState<number | undefined>(undefined);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card', 'upi'
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [upiId, setUpiId] = useState('');

  const getCoursePrice = (course: any) => {
    if (course.discountedPrice !== null && course.discountEndsAt !== null && new Date(course.discountEndsAt) > new Date()) {
      return course.discountedPrice;
    }
    return course.price;
  };

  const subtotal = cartItems.reduce((sum, item) => sum + getCoursePrice(item.course), 0);
  
  let currentEnrollmentCount = userEnrollmentCount;
  let totalAutomatedDiscountAmt = 0;
  let totalCouponDiscountAmt = 0;

  cartItems.forEach(item => {
    const base = getCoursePrice(item.course);
    let autoPercent = 0;
    if (currentEnrollmentCount > 0 && currentEnrollmentCount % 5 === 0) {
      autoPercent = 50;
    }
    currentEnrollmentCount++;
    
    const finalPercent = Math.min(100, discountPercent + autoPercent);
    totalAutomatedDiscountAmt += (base * autoPercent) / 100;
    
    const effectiveCouponPercent = finalPercent - autoPercent;
    totalCouponDiscountAmt += (base * effectiveCouponPercent) / 100;
  });

  const totalDiscountAmount = totalAutomatedDiscountAmt + totalCouponDiscountAmt;
  const total = subtotal - totalDiscountAmount;

  const handleApplyCoupon = async () => {
    setLoading(true);
    setMessage('');
    
    if (!couponCode.trim()) {
      setMessage('Please enter a coupon code.');
      setLoading(false);
      return;
    }

    const result = await validateCouponCode(couponCode);
    if (result.success && result.discountPercent) {
      setDiscountPercent(result.discountPercent);
      setAppliedCouponId(result.couponId);
      setMessage(`Coupon applied! ${result.discountPercent}% off.`);
    } else {
      setMessage(`Error: ${result.error}`);
      setDiscountPercent(0);
      setAppliedCouponId(undefined);
    }
    setLoading(false);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 2) {
      val = val.substring(0, 2) + '/' + val.substring(2, 4);
    }
    setExpiryDate(val);
  };

  const handlePayment = async () => {
    setMessage('');
    
    // Validation (only if total > 0)
    if (total > 0) {
      if (paymentMethod === 'card') {
        if (!cardNumber.trim() || !expiryDate.trim() || !cvv.trim()) {
          setMessage('Error: Please fill in all credit card details.');
          return;
        }
      } else if (paymentMethod === 'upi') {
        if (!upiId.trim()) {
          setMessage('Error: Please enter your UPI ID.');
          return;
        }
      }
    }

    setPaymentProcessing(true);

    // Simulate payment gateway delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const courseIds = cartItems.map(item => item.course.id);
    const result = await processCheckout(courseIds, appliedCouponId);

    if (result.success) {
      alert('Payment successful! You are now enrolled.');
      router.push('/courses'); // Redirect back to courses, or to a dashboard
    } else {
      setMessage(`Payment failed: ${result.error}`);
    }
    setPaymentProcessing(false);
  };

  if (cartItems.length === 0) {
    return <p>Your cart is empty. Nothing to checkout.</p>;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
      
      {/* Left Column: Payment Details */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        {total > 0 ? (
          <>
            <h3>Payment Method</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Select how you'd like to pay. This is a secure, encrypted connection.
            </p>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="radio" name="paymentMethod" value="card" checked={paymentMethod === 'card'} onChange={(e) => setPaymentMethod(e.target.value)} />
                Credit/Debit Card
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="radio" name="paymentMethod" value="upi" checked={paymentMethod === 'upi'} onChange={(e) => setPaymentMethod(e.target.value)} />
                UPI
              </label>
            </div>

            {paymentMethod === 'card' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Card Number *</label>
                  <input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="XXXX XXXX XXXX XXXX" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} required />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Expiry Date *</label>
                    <input type="text" value={expiryDate} onChange={handleExpiryChange} maxLength={5} placeholder="MM/YY" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} required />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>CVV *</label>
                    <input type="text" value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="123" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} required />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'upi' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>UPI ID *</label>
                  <input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="username@bank" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} required />
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>Free Enrollment</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              No payment is required for this enrollment. Click the button on the right to complete your registration instantly.
            </p>
          </div>
        )}

        {message && <p style={{ marginTop: '1rem', color: message.includes('Error') || message.includes('failed') ? 'red' : 'green' }}>{message}</p>}
      </div>

      {/* Right Column: Order Summary */}
      <div className="glass-card" style={{ padding: '2rem', height: 'fit-content' }}>
        <h3>Order Summary</h3>
        <div style={{ margin: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {cartItems.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{item.course.title}</span>
              <span>₹{getCoursePrice(item.course).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input 
              type="text" 
              placeholder="Coupon code" 
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} 
            />
            <button 
              onClick={handleApplyCoupon} 
              disabled={loading}
              className="btn" 
              style={{ padding: '0.75rem 1rem', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', borderRadius: '8px', cursor: 'pointer' }}
            >
              Apply
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          {totalCouponDiscountAmt > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'green' }}>
              <span>Coupon Discount ({discountPercent}%)</span>
              <span>-₹{totalCouponDiscountAmt.toFixed(2)}</span>
            </div>
          )}
          {totalAutomatedDiscountAmt > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#ec4899', fontWeight: 600 }}>
              <span>✨ Milestone Reward (50% Off)</span>
              <span>-₹{totalAutomatedDiscountAmt.toFixed(2)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
            <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>Total</span>
            <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>₹{total.toFixed(2)}</span>
          </div>
        </div>

        <button 
          onClick={handlePayment} 
          disabled={paymentProcessing}
          className="btn btn-primary" 
          style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
        >
          {paymentProcessing ? 'Processing...' : total > 0 ? `Pay ₹${total.toFixed(2)}` : 'Enroll Now for Free'}
        </button>
      </div>
    </div>
  );
}
