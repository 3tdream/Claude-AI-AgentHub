import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'UXI Entry Course — Основы UX/UI дизайна',
  description: 'Интерактивный курс для изучения основ UX/UI дизайна',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="ltr">
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
