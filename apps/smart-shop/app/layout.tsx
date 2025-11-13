import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { getSiteConfig } from '@/lib/content'
import { Toaster } from '@/components/ui/toaster'
import { AIChatWidget } from '@/components/ai-chat-widget'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteConfig()

  return {
    title: {
      default: site.seo?.defaultTitle || site.name,
      template: site.seo?.titleTemplate || `%s | ${site.name}`,
    },
    description: site.seo?.description || site.description,
    keywords: site.seo?.keywords,
    openGraph: {
      title: site.seo?.defaultTitle || site.name,
      description: site.seo?.description || site.description,
      url: site.url,
      siteName: site.name,
      images: site.seo?.ogImage ? [{ url: site.seo.ogImage }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: site.seo?.defaultTitle || site.name,
      description: site.seo?.description || site.description,
      images: site.seo?.ogImage ? [site.seo.ogImage] : [],
    },
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {children}
        <Toaster />
        <AIChatWidget />
      </body>
    </html>
  )
}
