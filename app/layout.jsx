import Script from 'next/script';
import { GA_MEASUREMENT_ID } from '@/lib/analytics';
import Providers from './providers';
import { Plus_Jakarta_Sans } from 'next/font/google';
import '@/index.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
  adjustFontFallback: true,
  variable: '--font-plus-jakarta',
});

const SITE_URL = 'https://sellsolar.pk';
const TITLE = 'Solar Plates, Inverters, Batteries in Pakistan | SellSolar';
const DESCRIPTION =
  'Pakistan #1 solar marketplace. Buy and sell used solar plates, hybrid inverters and lithium batteries. Check live prices and post free ads.';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: '%s | SellSolar',
  },
  description: DESCRIPTION,
  keywords: [
    'used solar',
    'used solar plates',
    'used solar for sale',
    'sell used solar',
    'buy used solar',
    'used solar panels Pakistan',
    'used solar inverter',
    'used solar batteries',
    'second hand solar plates',
    'used solar system for sale',
    'used solar Pakistan',
    'solar plates',
    'solar plate price in Pakistan',
    'solar plate',
    'solar plates rate today',
    'solar panel price Pakistan',
    'solar inverter price',
    'solar invertor Pakistan',
    'solar batteries',
    'solar battries',
    'solar authorised dealer',
    'solar authorized dealer in Pakistan',
    'authorized solar dealers',
    'verified solar dealers',
    'calculate solar load',
    'solar load calculator',
    'solar load calculator Pakistan',
    'calculate solar system load',
    'calculate home solar load',
    'lithium battery for solar',
    'tubular battery Pakistan',
    'solar price today',
    'solar plates Lahore',
    'solar plates Karachi',
    'solar plates Islamabad',
    'solar system price in Pakistan',
    'used solar plates',
    'used solar panels',
    'used solar Pakistan',
    'Tier 1 solar plates',
    'Longi solar plate price',
    'Jinko solar plates',
    'Canadian solar plates',
    'Inverex inverter price',
    'sell solar',
    'buy solar',
    'solar marketplace Pakistan',
  ],
  authors: [{ name: 'SellSolar' }],
  creator: 'SellSolar',
  publisher: 'SellSolar',
  applicationName: 'SellSolar',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  alternates: {
    canonical: '/',
    languages: {
      'en-PK': '/',
      'x-default': '/',
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || 'SellSolar_Google_Search_Console_Verify',
    other: {
      'msvalidate.01': [process.env.NEXT_PUBLIC_BING_VERIFICATION || 'SellSolar_Bing_Webmaster_Verify'],
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_PK',
    url: SITE_URL,
    siteName: 'SellSolar',
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: "SellSolar — Pakistan's #1 Used Solar Marketplace",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@sellsolarpk',
    creator: '@sellsolarpk',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: [{ url: '/favicon.ico', type: 'image/x-icon' }],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  category: 'marketplace',
  other: {
    'geo.region': 'PK-IS',
    'geo.placename': 'Islamabad, Pakistan',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#090d16' },
  ],
  colorScheme: 'light dark',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-PK" dir="ltr" className={`${plusJakarta.variable} ${plusJakarta.className}`} suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" sizes="any" />
        <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="preconnect" href="https://zgfycrnmivfybbclflwf.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://zgfycrnmivfybbclflwf.supabase.co" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {/* Google Analytics 4 (GA4) Tag for SEO Diagnostics & Traffic Attribution */}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
