import { cn } from '../../utils/cn';

export default function StatCard({ title, value, icon: Icon, trend, color = 'primary', className }) {
  const colorMap = {
    primary: {
      bg: 'bg-primary-500/10',
      icon: 'text-primary-400',
      border: 'border-primary-500/20',
    },
    success: {
      bg: 'bg-emerald-500/10',
      icon: 'text-emerald-400',
      border: 'border-emerald-500/20',
    },
    warning: {
      bg: 'bg-amber-500/10',
      icon: 'text-amber-400',
      border: 'border-amber-500/20',
    },
    danger: {
      bg: 'bg-rose-500/10',
      icon: 'text-rose-400',
      border: 'border-rose-500/20',
    },
  };

  const colors = colorMap[color] || colorMap.primary;

  return (
    <div
      className={cn(
        'bg-slate-900/60 backdrop-blur-sm border rounded-xl p-5',
        'hover:bg-slate-900/80 transition-all duration-200',
        colors.border,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-100">{value}</p>
          {trend !== undefined && (
            <p className={cn(
              'text-xs font-medium mt-1',
              trend >= 0 ? 'text-emerald-400' : 'text-rose-400'
            )}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last week
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', colors.bg)}>
          <Icon className={cn('w-6 h-6', colors.icon)} />
        </div>
      </div>
    </div>
  );
}
