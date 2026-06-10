import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'purple'
  className?: string
}

const variants = {
  default: 'bg-[rgba(99,102,241,0.12)] text-indigo-300 border-[rgba(99,102,241,0.25)]',
  success: 'bg-[rgba(34,197,94,0.12)] text-emerald-400 border-[rgba(34,197,94,0.25)]',
  warning: 'bg-[rgba(234,179,8,0.12)] text-yellow-400 border-[rgba(234,179,8,0.25)]',
  error: 'bg-[rgba(239,68,68,0.12)] text-red-400 border-[rgba(239,68,68,0.25)]',
  purple: 'bg-[rgba(139,92,246,0.12)] text-violet-300 border-[rgba(139,92,246,0.25)]',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
