import { cn } from '../../utils/cn';

export default function PageWrapper({ children, className }) {
  return (
    <div className={cn('animate-fade-in', className)}>
      {children}
    </div>
  );
}
