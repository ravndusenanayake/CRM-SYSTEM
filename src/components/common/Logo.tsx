import React from 'react';

interface LogoProps {
  variant?: 'sidebar' | 'header' | 'card';
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ variant = 'sidebar', showSubtitle = true }) => {
  return (
    <div className="flex items-center gap-2.5">
      {/* Wurth Red Screw Emblem */}
      <div className="h-8 w-8 shrink-0 bg-[#CC0000] rounded flex items-center justify-center p-1 shadow-xs">
        <svg viewBox="0 0 54 54" className="w-full h-full fill-white" xmlns="http://www.w3.org/2000/svg">
          {/* Top screw head */}
          <path d="M6 8 H22 V19 H32 V8 H48 V23 H6 Z" />
          {/* Bottom screw head */}
          <path d="M6 29 H22 V35 H32 V29 H48 C48 42 39 49 27 49 C15 49 6 42 6 29 Z" />
        </svg>
      </div>

      <div className="leading-tight">
        <div className="flex items-baseline gap-1">
          <span className="font-extrabold text-sm tracking-tight text-slate-900 font-sans">
            WÜRTH
          </span>
          <span className="text-xs font-semibold text-[#CC0000] tracking-wider uppercase">
            Lanka
          </span>
        </div>
        {showSubtitle && variant === 'sidebar' && (
          <div className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">
            Enterprise CRM
          </div>
        )}
      </div>
    </div>
  );
};
