import React from 'react';

export const MainIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <filter id="blueGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <g filter="url(#blueGlow)">
      <path d="M32 8L12 18V46L32 56L52 46V18L32 8Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
      <path d="M32 8V32L12 18M32 32L52 18M32 32V56" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" opacity="0.5"/>
      <rect x="24" y="24" width="16" height="16" rx="2" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 28L24 35M52 28L40 35M32 15L32 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3"/>
    </g>
  </svg>
);

export const WriteOffIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <filter id="blueGlowW" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <g filter="url(#blueGlowW)">
      <path d="M15 25L32 15L49 25V42L32 52L15 42V25Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
      <path d="M15 25L32 35L49 25M32 35V52" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" opacity="0.5"/>
      <path d="M32 22C38 15 45 15 50 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M44 18L50 18L50 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="50" cy="48" r="8" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2"/>
      <path d="M46 48H54" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </g>
  </svg>
);

export const FinanceIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <filter id="blueGlowF" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <g filter="url(#blueGlowF)">
      {[0, 1, 2, 3].map((i) => (
        <React.Fragment key={i}>
          <ellipse cx="25" cy={48 - i * 6} rx="12" ry="4" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1"/>
          <path d={`M13 ${48 - i * 6}V${53 - i * 6}A12 4 0 0 0 37 ${53 - i * 6}V${48 - i * 6}`} stroke="currentColor" strokeWidth="2" opacity="0.5"/>
        </React.Fragment>
      ))}
      <text x="21" y="44" fill="currentColor" fontSize="8" fontWeight="bold" opacity="0.7">₽</text>
      <path d="M35 35L42 28L48 32L55 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M48 22H55V29" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M35 45V35M42 45V28M48 45V32M55 45V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.2"/>
    </g>
  </svg>
);

export const ShiftIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <filter id="blueGlowS" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <g filter="url(#blueGlowS)">
      <circle cx="32" cy="32" r="24" stroke="currentColor" strokeWidth="2.5"/>
      <line x1="32" y1="8" x2="32" y2="56" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
      <circle cx="22" cy="32" r="5" stroke="currentColor" strokeWidth="2"/>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <line
          key={angle}
          x1="22" y1="32"
          x2={22 + 8 * Math.cos((angle * Math.PI) / 180)}
          y2={32 + 8 * Math.sin((angle * Math.PI) / 180)}
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"
        />
      ))}
      <path d="M42 25A10 10 0 1 1 42 39A8 8 0 1 0 42 25" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2"/>
      <path d="M32 32L40 24M32 32L24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
  </svg>
);
