import { cn } from '../../utils/cn';

export default function Spinner({ size = 'md', className }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-slate-700 border-t-primary-500',
          sizeClasses[size]
        )}
      />
    </div>
  );
}
