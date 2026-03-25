'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMobileNav } from '@/lib/hooks/use-mobile-nav'

export interface NavItem {
  label: string
  href: string
  icon?: React.ReactNode
}

interface MobileNavProps {
  items: NavItem[]
  currentPath: string
}

export function MobileNav({ items, currentPath }: MobileNavProps) {
  const { isOpen, close } = useMobileNav()

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        onClick={close}
        aria-hidden="true"
      />
      {/* Drawer */}
      <nav
        className={cn(
          'fixed left-0 top-0 bottom-0 z-50 w-72 bg-background shadow-xl',
          'flex flex-col overflow-y-auto',
          'animate-in slide-in-from-left duration-300',
          'lg:hidden'
        )}
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-between border-b px-4 py-4">
          <span className="text-lg font-bold text-primary">Mission Control</span>
          <button
            onClick={close}
            className="rounded-full p-1.5 hover:bg-muted transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <ul className="flex flex-col gap-1 p-3">
          {items.map((item) => {
            const isActive = currentPath === item.href || currentPath.startsWith(item.href + '/')
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={close}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors min-h-[44px]',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {item.icon && <span className="h-5 w-5 shrink-0">{item.icon}</span>}
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}
