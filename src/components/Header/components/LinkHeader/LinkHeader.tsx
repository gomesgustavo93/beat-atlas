import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../Button';
import { cn } from '../../../../utils/cn';

interface LinkHeaderProps {
    to: string;
    children: ReactNode;
    isActive: boolean;
    icon?: ReactNode;
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
            >
                {icon && <span className="mr-2">{icon}</span>}
                {children}
            </Button>
        </Link>
    );
};

export default LinkHeader;