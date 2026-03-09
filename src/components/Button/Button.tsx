import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  icon?: ReactNode
  bold?: boolean
  fullWidth?: boolean
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  icon,
  bold = false,
  fullWidth = false,
  ...props
}: ButtonProps) => {
  const baseStyles =
    'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center'

  const variants = {
    primary:
      'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500',
    secondary:
      'bg-neutral-200 text-neutral-900 hover:bg-neutral-300 focus:ring-neutral-500',
    outline:
      'border-2 border-primary-500 text-primary-500 hover:bg-primary-50 focus:ring-primary-500',
    ghost:
      'text-neutral-700 hover:bg-neutral-100 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white focus:ring-neutral-500',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  const fontWeight = bold ? 'font-semibold' : 'font-medium'
  const width = fullWidth ? 'w-full' : ''

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        fontWeight,
        width,
        className
      )}
      {...props}
    >
      {icon && <span className="mr-3">{icon}</span>}
      {children}
    </button>
  )
}

export default Button
