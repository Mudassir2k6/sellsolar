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
const TITLE = 'Solar Plates Price in Pakistan, Inverters & Solar Batteries | SellSolar';
const DESCRIPTION =
  "Pakistan's #1 solar marketplace. Check daily solar plate price in Pakistan, live solar panel rates per watt, solar inverters & batteries. Buy and sell new or used solar plates, inverters, and complete systems.";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: '%s | SellSolar',
  },
  description: DESCRIPTION,
  keywords: [
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
        alt: "SellSolar — Pakistan's solar marketplace",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
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
        <link rel="preconnect" href="https://zgfycrnmivfybbclflwf.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://zgfycrnmivfybbclflwf.supabase.co" />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
