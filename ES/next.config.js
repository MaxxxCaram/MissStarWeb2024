/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'es',
    localeDetection: false,
  },
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig
