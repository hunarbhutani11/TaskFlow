import { cn } from '../../utils/cn';
import { getAvatarColor, getInitials } from '../../utils/avatar';

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
};

export default function Avatar({ name, size = 'md', className }) {
  const colorClass = getAvatarColor(name);
  const initials = getInitials(name);

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold text-white',
        'ring-2 ring-slate-800 shadow-sm',
        colorClass,
        sizeClasses[size],
        className
      )}
      title={name}
    >
      {initials}
    </div>
  );
}
