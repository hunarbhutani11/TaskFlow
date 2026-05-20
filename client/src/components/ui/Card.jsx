import { cn } from '../../utils/cn';

export default function Card({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'bg-slate-900/60 backdrop-blur-sm border border-slate-800/60 rounded-xl',
        'transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn('px-5 py-4 border-b border-slate-800/60', className)}>
      {children}
    </div>
  );
}

export function CardBody({ children, className }) {
  return (
    <div className={cn('px-5 py-4', className)}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className }) {
  return (
    <div className={cn('px-5 py-3 border-t border-slate-800/60', className)}>
      {children}
    </div>
  );
}
