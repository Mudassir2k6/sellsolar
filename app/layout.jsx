import Providers from './providers';
import { Plus_Jakarta_Sans } from 'next/font/google';
import '@/index.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta',
});

const SITE_URL = 'https://sellsolar.pk';
const TITLE = 'Solar Price, Used Solar & Inverters Pakistan | SellSolar';
const DESCRIPTION =
  'Sell & buy used solar panels, inverters and batteries in Pakistan. Check solar price today and find verified sellers in Lahore, Karachi and Islamabad.';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: '%s | SellSolar',
  },
  description: DESCRIPTION,
  keywords: [
    'solar Pakistan',
    'solar price Pakistan',
    'used solar',
    'used solar panels',
    'solar inverter price',
    'solar batteries',
    'lithium battery Pakistan',
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
    { media: '(prefers-color-scheme: light)', color: '#eab308' },
    { media: '(prefers-color-scheme: dark)', color: '#eab308' },
  ],
  colorScheme: 'light dark',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-PK" dir="ltr" className={plusJakarta.variable} suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
