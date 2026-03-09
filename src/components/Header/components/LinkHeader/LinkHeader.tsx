import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../../Button'
import { cn } from '../../../../utils/cn'

interface LinkHeaderProps {
  to: string
  children: ReactNode
  isActive: boolean
  icon?: ReactNode
}

const LinkHeader = ({ to, children, isActive, icon }: LinkHeaderProps) => {
  return (
    <Link to={to}>
      <Button
        variant="ghost"
        className={cn(
          isActive ? 'text-green-500 bg-gray-800' : 'text-gray-300',
          'hover:text-white',
          'hover:bg-gray-800',
          'dark:hover:bg-gray-900',
          !isActive && 'dark:text-gray-300'
        )}
        title={typeof children === 'string' ? children : undefined}
      >
        {icon && <span className={cn('md:mr-2')}>{icon}</span>}
        <span className="hidden md:inline">{children}</span>
      </Button>
    </Link>
  )
}

export default LinkHeader
