import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: boolean
  paddingTop?: boolean
  paddingBottom?: boolean
}

export const Container = ({
  maxWidth = 'xl',
  padding = true,
  paddingTop = true,
  paddingBottom = true,
  className,
  children,
  ...props
}: ContainerProps) => {
  const maxWidths = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full',
  }

  const paddingStyles = padding ? 'px-4 sm:px-6 lg:px-8' : ''
  const paddingTopStyle = paddingTop ? 'pt-4' : ''
  const paddingBottomStyle = paddingBottom ? 'pb-8' : ''

  return (
    <div
      className={cn(
        'mx-auto',
        maxWidths[maxWidth],
        paddingStyles,
        paddingTopStyle,
        paddingBottomStyle,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export default Container
