import type { HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  className?: string
}

export const Card = ({ className, ...props }: CardProps) => {
  return (
    <div
      data-slot="card"
      className={cn(
        'bg-card',
        'text-card-foreground',
        'flex',
        'flex-col',
        'gap-6',
        'rounded-xl',
        'border',
        className
      )}
      {...props}
    />
  )
}

export default Card
