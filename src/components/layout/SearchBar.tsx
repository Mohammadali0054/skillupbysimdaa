'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { searchCourses } from '@/app/actions';
import styles from './Navbar.module.css';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search effect
  useEffect(() => {
    const fetchResults = async () => {
      if (query.length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      const res = await searchCourses(query);
      if (res.success) {
        setResults(res.results || []);
        setIsOpen(true);
      }
      setIsLoading(false);
    };

    const debounceTimer = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  return (
    <div className={styles.searchBar} ref={searchRef} style={{ position: 'relative' }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)' }}>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        type="text"
        className={styles.searchInput}
        placeholder="Search for courses, categories..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => { if (query.length >= 2) setIsOpen(true); }}
      />
      {isLoading && (
        <div style={{ position: 'absolute', right: '15px' }}>
           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
             <path d="M21 12a9 9 0 1 1-6.219-8.56" />
           </svg>
           <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          width: '400px', // Expand beyond the input's width
          marginTop: '8px',
          background: 'var(--bg-primary, #ffffff)',
          border: '1px solid var(--glass-border, #e1e1e1)',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          overflow: 'hidden'
        }}>
          {results.length > 0 ? (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {results.map((course) => (
                <li key={course.id} style={{ borderBottom: '1px solid var(--glass-border, #e1e1e1)' }}>
                  <Link 
                    href={`/courses`} 
                    onClick={() => { setQuery(''); setIsOpen(false); }}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      padding: '10px 15px',
                      textDecoration: 'none',
                      color: 'var(--text-primary)',
                      gap: '12px',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary, #f8fafc)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <img 
                      src={course.thumbnailUrl || 'https://via.placeholder.com/40'} 
                      alt={course.title} 
                      style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {course.title}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {course.category}
                      </span>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--accent-primary)', fontSize: '0.95rem', paddingLeft: '8px' }}>
                      ₹{course.price}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ padding: '15px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              No courses found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
