'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { NAV_LINKS } from '@/constants';
import { canViewMap, fetchMe, logout, type SessionUser } from '@/lib/api';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchMe()
      .then((next) => {
        if (!cancelled) setUser(next);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function signOut() {
    logout();
    setUser(null);
    setIsOpen(false);
  }

  return (
    <nav className="sticky top-0 z-50 bg-earth-900 border-b border-earth-700">
      <div className="section-container h-14 flex items-center justify-between">

        {/* Wordmark */}
        <Link href="/" className="flex items-center gap-3 no-underline">
          <span className="text-xs font-sans font-medium uppercase tracking-brand text-earth-400">
            Research Initiative
          </span>
          <span className="text-earth-600 text-sm">·</span>
          <span className="text-brand font-serif font-semibold text-white tracking-snug">
            SPADE-AI
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="relative inline-block px-3 py-1 text-nav font-sans no-underline transition-colors duration-150"
              style={{ color: hovered === link.name ? '#ffffff' : '#9ca3af' }}
              onMouseEnter={() => setHovered(link.name)}
              onMouseLeave={() => setHovered(null)}
            >
              {link.name}
              <span
                className="absolute bottom-0 left-3 right-3 h-px bg-white transition-transform duration-200 origin-left"
                style={{ transform: hovered === link.name ? 'scaleX(1)' : 'scaleX(0)' }}
              />
            </Link>
          ))}
          {ready && user && canViewMap(user.role) && (
            <Link
              href="/maps/jessore"
              className="relative inline-block px-3 py-1 text-nav font-sans no-underline transition-colors duration-150"
              style={{ color: hovered === 'Jessore data' ? '#ffffff' : '#9ca3af' }}
              onMouseEnter={() => setHovered('Jessore data')}
              onMouseLeave={() => setHovered(null)}
            >
              Jessore data
              <span
                className="absolute bottom-0 left-3 right-3 h-px bg-white transition-transform duration-200 origin-left"
                style={{ transform: hovered === 'Jessore data' ? 'scaleX(1)' : 'scaleX(0)' }}
              />
            </Link>
          )}
          {ready && user && (
            <>
              <Link
                href="/profile"
                className="relative inline-block px-3 py-1 text-nav font-sans no-underline transition-colors duration-150"
                style={{ color: hovered === 'Profile' ? '#ffffff' : '#9ca3af' }}
                onMouseEnter={() => setHovered('Profile')}
                onMouseLeave={() => setHovered(null)}
              >
                Profile
                <span
                  className="absolute bottom-0 left-3 right-3 h-px bg-white transition-transform duration-200 origin-left"
                  style={{ transform: hovered === 'Profile' ? 'scaleX(1)' : 'scaleX(0)' }}
                />
              </Link>
            </>
          )}
          {ready && (user ? (
            <button
              type="button"
              onClick={signOut}
              className="ml-2 inline-block px-3 py-1 text-nav font-sans text-white border border-earth-600 bg-transparent cursor-pointer"
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/login"
              className="ml-2 inline-block px-3 py-1 text-nav font-sans no-underline text-white border border-earth-600"
            >
              Sign in
            </Link>
          ))}
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-1.5 text-earth-400 bg-transparent border-none cursor-pointer"
          aria-label="Toggle menu"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
            />
          </svg>
        </button>

      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-earth-700 bg-earth-800">
          <div className="section-container py-3 flex flex-col">
            {NAV_LINKS.map((link, i) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`text-nav font-sans text-earth-300 no-underline py-2.5 ${
                  i < NAV_LINKS.length - 1 ? "border-b border-earth-700" : ""
                }`}
              >
                {link.name}
              </Link>
            ))}
            {ready && user && canViewMap(user.role) && (
              <Link
                href="/maps/jessore"
                onClick={() => setIsOpen(false)}
                className="text-nav font-sans text-earth-300 no-underline py-2.5 border-t border-earth-700"
              >
                Jessore data
              </Link>
            )}
            {ready && user && (
              <>
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="text-nav font-sans text-earth-300 no-underline py-2.5 border-t border-earth-700"
                >
                  Profile
                </Link>
              </>
            )}
            {ready && (user ? (
              <button
                type="button"
                onClick={signOut}
                className="text-nav font-sans text-white text-left bg-transparent border-none cursor-pointer py-2.5"
              >
                Sign out
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="text-nav font-sans text-white no-underline py-2.5"
              >
                Sign in
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}