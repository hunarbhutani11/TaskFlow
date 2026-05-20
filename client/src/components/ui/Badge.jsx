import { cn } from '../../utils/cn';

const variantMap = {
  default: 'bg-slate-800/80 text-slate-300 border-slate-700/50',
  primary: 'bg-primary-600/20 text-primary-300 border-primary-500/30',
  success: 'bg-emerald-600/20 text-emerald-300 border-emerald-500/30',
  warning: 'bg-amber-600/20 text-amber-300 border-amber-500/30',
  danger: 'bg-rose-600/20 text-rose-300 border-rose-500/30',
};

export default function Badge({ children, variant = 'default', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        'transition-colors duration-200',
        variantMap[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
