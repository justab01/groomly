import { PawPrint } from 'lucide-react'
import Link from 'next/link'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  linkToHome?: boolean
  className?: string
}

export function Logo({ size = 'md', showText = true, linkToHome = false, className = '' }: LogoProps) {
  const sizes = {
    sm: { icon: 'h-6 w-6', text: 'text-lg' },
    md: { icon: 'h-8 w-8', text: 'text-xl' },
    lg: { icon: 'h-10 w-10', text: 'text-2xl' },
  }

  const content = (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${sizes[size].icon} bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center`}>
        <PawPrint className={`${size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'} text-white`} />
      </div>
      {showText && (
        <span className={`${sizes[size].text} font-bold text-gray-900`}>Groomly</span>
      )}
    </div>
  )

  if (linkToHome) {
    return <Link href="/">{content}</Link>
  }

  return content
}