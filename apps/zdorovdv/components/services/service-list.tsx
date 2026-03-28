"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ServiceCard } from "@/components/shared/service-card"
import type { ClinicService } from "@/types"

interface ServiceListProps {
  services: ClinicService[]
  onBook?: (service: ClinicService) => void
  onSelect?: (service: ClinicService) => void
}

export function ServiceList({ services, onBook, onSelect }: ServiceListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence mode="popLayout">
        {services.map((service) => (
          <motion.div
            key={service.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <ServiceCard service={service} onBook={onBook} onSelect={onSelect} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
