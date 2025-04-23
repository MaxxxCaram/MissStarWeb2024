'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { t } = useTranslation('common');
  const router = useRouter();
  const { locale } = router;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const changeLanguage = (newLocale: string) => {
    router.push(router.pathname, router.asPath, { locale: newLocale });
  };

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-pink-600">
            Miss Star
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-pink-600">
              {t('header.home')}
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-pink-600">
              {t('header.about')}
            </Link>
            <Link href="/contestants" className="text-gray-700 hover:text-pink-600">
              {t('header.contestants')}
            </Link>
            <Link href="/events" className="text-gray-700 hover:text-pink-600">
              {t('header.events')}
            </Link>
            <Link href="/sponsors" className="text-gray-700 hover:text-pink-600">
              {t('header.sponsors')}
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-pink-600">
              {t('header.contact')}
            </Link>
            <Link
              href="/register"
              className="bg-pink-600 text-white px-6 py-2 rounded-full hover:bg-pink-700 transition-colors"
            >
              {t('header.register')}
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <select
              value={locale}
              onChange={(e) => changeLanguage(e.target.value)}
              className="bg-transparent border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>

            {/* Register Button */}
            <Link
              href="/register"
              className="hidden md:block bg-pink-600 text-white px-6 py-2 rounded-full hover:bg-pink-700 transition-colors"
            >
              {t('header.register')}
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-700"
              onClick={toggleMenu}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4">
            <div className="flex flex-col space-y-4">
              <Link href="/" className="text-gray-700 hover:text-pink-600">
                {t('header.home')}
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-pink-600">
                {t('header.about')}
              </Link>
              <Link href="/contestants" className="text-gray-700 hover:text-pink-600">
                {t('header.contestants')}
              </Link>
              <Link href="/events" className="text-gray-700 hover:text-pink-600">
                {t('header.events')}
              </Link>
              <Link href="/sponsors" className="text-gray-700 hover:text-pink-600">
                {t('header.sponsors')}
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-pink-600">
                {t('header.contact')}
              </Link>
              <Link
                href="/register"
                className="bg-pink-600 text-white px-6 py-2 rounded-full hover:bg-pink-700 transition-colors text-center"
              >
                {t('header.register')}
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
} 