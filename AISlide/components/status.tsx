"use client"

import { useEffect } from 'react'
import { toast } from 'sonner'

interface StatusDisplayProps {
  status: string
}

export function StatusDisplay({ status }: StatusDisplayProps) {
  useEffect(() => {
    if (status.startsWith("Error")) {
      toast.error("Error", {
        description: status,
        duration: 3000,
      })
    } 
    else if (status.startsWith("Session established")) {
        toast.success("Connected", {
            description: status,
            duration: 5000,
        })
    }
    else {
      toast.info("Status Update", {
        description: status,
        duration: 3000,
      })
    }
  }, [status])
  return null
}
