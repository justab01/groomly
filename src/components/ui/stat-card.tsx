import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>
  iconBg: string
  label: string
  value: string | number
  subtext?: string
  trend?: string
  trendUp?: boolean
  animateCount?: boolean
  className?: string
}

export function StatCard({
  icon: Icon,
  iconBg,
  label,
  value,
  subtext,
  trend,
  trendUp,
  animateCount,
  className,
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const numericValue = typeof value === 'number' ? value : parseFloat(value.replace(/[^0-9.]/g, '')) || 0

  useEffect(() => {
    if (animateCount && typeof value === 'number') {
      const duration = 1000
      const steps = 60
      const increment = numericValue / steps
      let current = 0
      const timer = setInterval(() => {
        current += increment
        if (current >= numericValue) {
          setDisplayValue(numericValue)
          clearInterval(timer)
        } else {
          setDisplayValue(Math.floor(current))
        }
      }, duration / steps)
      return () => clearInterval(timer)
    }
  }, [animateCount, numericValue, value])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('bg-white rounded-xl border border-gray-200 p-5', className)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br', iconBg)}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        {trend && (
          <span
            className={cn(
              'text-xs font-medium px-2 py-1 rounded-full',
              trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            )}
          >
            {trend}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900">
        {animateCount && typeof value === 'number' ? displayValue : value}
      </div>
      <div className="text-sm text-gray-600">{label}</div>
      {subtext && <div className="text-xs text-gray-500 mt-1">{subtext}</div>}
    </motion.div>
  )
}