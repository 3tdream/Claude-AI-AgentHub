"use client"

import { useEffect, useState, useRef } from "react"
import { motion, useInView } from "framer-motion"
import { useLanguageStore } from "@/lib/use-language-store"
import { translations } from "@/lib/translations"

interface StatItemProps {
  value: number
  suffix: string
  label: string
  prefix?: string
  delay?: number
}

function StatItem({ value, suffix, label, prefix = '', delay = 0 }: StatItemProps) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    const timeout = setTimeout(() => {
      const duration = 1500
      const steps = 40
      const increment = value / steps
      let current = 0
      const interval = setInterval(() => {
        current += increment
        if (current >= value) {
          setCount(value)
          clearInterval(interval)
        } else {
          setCount(Math.floor(current))
        }
      }, duration / steps)
      return () => clearInterval(interval)
    }, delay)
    return () => clearTimeout(timeout)
  }, [isInView, value, delay])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: delay / 1000 }}
      className="text-center"
    >
      <div className="text-4xl md:text-5xl font-bold text-primary">
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="mt-2 text-muted-foreground">{label}</div>
    </motion.div>
  )
}

export function StatsSection() {
  const { language } = useLanguageStore()
  const t = translations[language]

  const stats = [
    { value: 20, suffix: '+', label: t.stats.years, delay: 0 },
    { value: 10000, suffix: '+', label: t.stats.procedures, delay: 150 },
    { value: 15, suffix: '+', label: t.stats.specialists, delay: 300 },
    { value: 98, suffix: '%', label: t.stats.satisfaction, delay: 450 },
  ]

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <StatItem key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  )
}
