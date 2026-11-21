import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface TooltipProps {
  content: React.ReactNode;
  children?: React.ReactNode;
  iconOnly?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  iconOnly = false,
  position = 'bottom',
  align = 'start',
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const getPositionClasses = () => {
    let pos = '';
    if (position === 'top') {
      pos = 'bottom-full mb-2';
    } else if (position === 'left') {
      pos = 'right-full mr-2 top-1/2 -translate-y-1/2';
    } else if (position === 'right') {
      pos = 'left-full ml-2 top-1/2 -translate-y-1/2';
    } else {
      // bottom
      pos = 'top-full mt-2';
    }

    if (position === 'top' || position === 'bottom') {
      if (align === 'start') {
        pos += ' left-0';
      } else if (align === 'end') {
        pos += ' right-0';
      } else {
        pos += ' left-1/2 -translate-x-1/2';
      }
    }

    return pos;
  };

  const titleString = typeof content === 'string' ? content : undefined;

  return (
    <span
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {iconOnly ? (
        <button
          type="button"
          aria-label="More information"
          title={titleString}
          className="text-slate-400 hover:text-sky-600 transition-colors p-1 inline-flex items-center justify-center cursor-help rounded-full hover:bg-slate-100 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      ) : (
        <span title={titleString} className="inline-flex items-center cursor-help">
          {children}
        </span>
      )}

      {isVisible && (
        <span
          role="tooltip"
          className={`absolute z-[100] pointer-events-none w-72 sm:w-80 p-3 text-xs font-normal text-slate-800 bg-white border border-slate-200 rounded-lg shadow-xl shadow-slate-900/10 leading-relaxed text-left animate-in fade-in duration-100 ${getPositionClasses()}`}
        >
          {content}
        </span>
      )}
    </span>
  );
};
