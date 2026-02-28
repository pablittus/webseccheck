import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Analytics from '@/components/Analytics'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://webseccheck.com'),
  title: {
    default: 'WebSecCheck — Free Website Security Scanner',
    template: '%s | WebSecCheck',
  },
  description: 'Free instant website security scan. Check SSL, headers, DNS, cookies & more against OWASP Top 10. Get your security score in 30 seconds.',
  keywords: ['website security scanner', 'free security scan', 'OWASP top 10', 'SSL checker', 'security headers check', 'web vulnerability scanner', 'website security audit'],
  authors: [{ name: 'WebSecCheck' }],
  creator: 'WebSecCheck',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://webseccheck.com',
    siteName: 'WebSecCheck',
    title: 'WebSecCheck — Free Website Security Scanner',
    description: 'Free instant website security scan against OWASP Top 10. Get your security score in 30 seconds.',
    images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: 'WebSecCheck Security Scanner' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WebSecCheck — Free Website Security Scanner',
    description: 'Free instant website security scan against OWASP Top 10.',
    images: ['/og-image.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large' as const,
      'max-video-preview': -1,
    },
  },
  alternates: {
    canonical: 'https://webseccheck.com',
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
  manifest: '/site.webmanifest',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'WebSecCheck',
  url: 'https://webseccheck.com',
  description: 'Free website security scanner with OWASP Top 10 checks',
  applicationCategory: 'SecurityApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
}

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'WebSecCheck',
  url: 'https://webseccheck.com',
  logo: 'https://webseccheck.com/favicon.svg',
  description: 'Enterprise-grade web security scanning powered by AI.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body className={`${inter.className} bg-cyber-darkblue text-gray-200 antialiased`}>
        <Header />
        <Analytics />
        <main className="pt-16 min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
