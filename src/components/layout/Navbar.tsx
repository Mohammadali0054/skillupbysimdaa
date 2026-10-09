import Link from 'next/link';
import styles from './Navbar.module.css';
import { getCurrentUser, logout } from '@/app/actions';
import SearchBar from './SearchBar';


export default async function Navbar() {
  const result = await getCurrentUser();
  const user = result.success ? result.user : null;

  return (
    <nav className={styles.navbar}>
      <div className={`${styles.navContainer} container`}>
        {/* Left Section: Logo and Links */}
        <div className={styles.leftSection}>
          <Link href="/" className={styles.logo}>
            <img src="/logo.png" alt="Simdaa Logo" style={{ height: '36px' }} />
          </Link>

          <div className={styles.navLinks}>
            <Link href="/courses" className={styles.navLink}>
              Categories
            </Link>
            {user && (
              <>
                <Link href="/my-courses" className={styles.navLink}>
                  My Courses
                </Link>
                <Link href="/my-certificates" className={styles.navLink}>
                  My Certificates
                </Link>
              </>
            )}
            <Link href="/teach" className={styles.navLink}>
              Teach on Simdaa
            </Link>
          </div>
        </div>

        {/* Middle Section: Search */}
        <SearchBar />


        {/* Right Section: Auth & Cart */}
        <div className={styles.rightSection}>
          <Link href="/wishlist" className={styles.iconButton} aria-label="Wishlist" style={{ marginRight: '0.5rem' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </Link>
          <Link href="/cart" className={styles.iconButton} aria-label="Cart">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
          </Link>
          
          {user ? (
            <div className={styles.userMenu}>
              <div className={styles.avatar}>
                {user.fullName ? user.fullName.charAt(0) : (user.email ? user.email.charAt(0) : 'U')}
              </div>
              <span className={styles.welcomeText}>
                Hi, {user.fullName ? user.fullName.split(' ')[0] : (user.role === 'admin' ? 'Admin' : 'User')}
              </span>
              {user.role === 'admin' && (
                <Link href="/admin" className={styles.navLink}>
                  Dashboard
                </Link>
              )}
              <Link href="/settings" className={styles.navLink}>
                Settings
              </Link>
              <form action={async () => {
                'use server';
                const { logout } = await import('@/app/actions');
                await logout();
              }}>
                <button type="submit" className={styles.loginBtn}>
                  Log out
                </button>
              </form>
            </div>
          ) : (
            <>
              <Link href="/login" className={styles.loginBtn}>
                Log in
              </Link>
              <Link href="/signup" className={styles.signupBtn}>
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
