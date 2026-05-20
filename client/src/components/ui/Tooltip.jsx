import { useState } from 'react';
import { cn } from '../../utils/cn';

export default function Tooltip({ children, content, position = 'top', className }) {
  const [show, setShow] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div
          className={cn(
            'absolute z-50 px-2.5 py-1.5 text-xs font-medium',
            'bg-slate-800 text-slate-200 border border-slate-700 rounded-lg shadow-xl',
            'whitespace-nowrap animate-fade-in pointer-events-none',
            positionClasses[position],
            className
          )}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </div>
  );
}
