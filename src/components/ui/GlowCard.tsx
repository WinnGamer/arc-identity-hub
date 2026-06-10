'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface GlowCardProps {
  children: React.ReactNode
  className?: string
  glow?: boolean
}

export function GlowCard({ children, className, glow = false }: GlowCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'relative rounded-2xl border p-6',
        'bg-[rgba(15,15,30,0.85)] backdrop-blur-md',
        'border-[rgba(99,102,241,0.18)]',
        glow && 'shadow-[0_0_40px_rgba(99,102,241,0.15)]',
        className
      )}
    >
      {children}
    </motion.div>
  )
}
