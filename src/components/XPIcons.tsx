// Windows XP–style SVG icon set
// Colorful, glossy gradients, drop-shadows — authentic Luna / Royale Noir look.

type P = { size?: number };

/* ─── Dashboard card icons (large) ───────────────────────────── */

/** Parts card — 3D cardboard box with tape */
export function XPBox({ size = 40 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="xpBxFront" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#c8deff"/>
          <stop offset="100%" stopColor="#4477ee"/>
        </linearGradient>
        <linearGradient id="xpBxSide" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#2244bb"/>
          <stop offset="100%" stopColor="#1133aa"/>
        </linearGradient>
        <linearGradient id="xpBxTop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#eef4ff"/>
          <stop offset="100%" stopColor="#88aaee"/>
        </linearGradient>
        <filter id="xpBxSh"><feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#000033" floodOpacity="0.35"/></filter>
      </defs>
      {/* Front face */}
      <rect x="7" y="22" width="26" height="20" fill="url(#xpBxFront)" stroke="#1133aa" strokeWidth="0.8" filter="url(#xpBxSh)"/>
      {/* Right side face */}
      <polygon points="33,22 41,16 41,36 33,42" fill="url(#xpBxSide)" stroke="#0a2288" strokeWidth="0.8"/>
      {/* Top face */}
      <polygon points="7,22 15,16 41,16 33,22" fill="url(#xpBxTop)" stroke="#0a2288" strokeWidth="0.8"/>
      {/* Tape vertical strip */}
      <rect x="18" y="22" width="8" height="20" fill="#f5e07a" opacity="0.75"/>
      <polygon points="18,22 22,16 26,16 22,22" fill="#f5e07a" opacity="0.75"/>
      {/* Tape fold line */}
      <line x1="22" y1="22" x2="22" y2="42" stroke="#d4b84a" strokeWidth="0.6" opacity="0.8"/>
      {/* Highlight */}
      <ellipse cx="15" cy="25" rx="4" ry="1.5" fill="rgba(255,255,255,0.35)"/>
    </svg>
  );
}

/** Operations card — clipboard with ruled paper */
export function XPClipboardList({ size = 40 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="xpClipBoard" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#c8a060"/>
          <stop offset="100%" stopColor="#885020"/>
        </linearGradient>
        <linearGradient id="xpClipPaper" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#ffffff"/>
          <stop offset="100%" stopColor="#e8eaf0"/>
        </linearGradient>
        <filter id="xpClipSh"><feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#000033" floodOpacity="0.3"/></filter>
      </defs>
      {/* Board */}
      <rect x="8" y="10" width="32" height="36" rx="2" fill="url(#xpClipBoard)" stroke="#663a10" strokeWidth="0.8" filter="url(#xpClipSh)"/>
      {/* Paper */}
      <rect x="11" y="14" width="26" height="29" rx="1" fill="url(#xpClipPaper)" stroke="#aaa" strokeWidth="0.5"/>
      {/* Clip */}
      <rect x="17" y="6" width="14" height="8" rx="3" fill="#c0c0c0" stroke="#888" strokeWidth="0.8"/>
      <rect x="20" y="5" width="8" height="5" rx="2" fill="#d8d8d8" stroke="#999" strokeWidth="0.7"/>
      {/* Lines */}
      {[20, 25, 30, 35].map(y => (
        <line key={y} x1="14" y1={y} x2="34" y2={y} stroke="#99aacc" strokeWidth="1.2"/>
      ))}
      {/* Checkbox dots */}
      <rect x="14" y="18" width="3.5" height="3.5" rx="0.5" fill="#316ac5" stroke="#1a3a88" strokeWidth="0.5"/>
      <rect x="14" y="23" width="3.5" height="3.5" rx="0.5" fill="none" stroke="#aaa" strokeWidth="0.7"/>
      <rect x="14" y="28" width="3.5" height="3.5" rx="0.5" fill="none" stroke="#aaa" strokeWidth="0.7"/>
      {/* Checkmark on first */}
      <path d="M15 19.5 L16 21 L18 18.5" stroke="white" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  );
}

/** Finance card — leather wallet with coins */
export function XPWallet({ size = 40 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="xpWltBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#b87840"/>
          <stop offset="60%"  stopColor="#8a5020"/>
          <stop offset="100%" stopColor="#5c3010"/>
        </linearGradient>
        <linearGradient id="xpWltFlap" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#cc9050"/>
          <stop offset="100%" stopColor="#7a4018"/>
        </linearGradient>
        <radialGradient id="xpCoin1" cx="45%" cy="38%">
          <stop offset="0%"   stopColor="#ffe880"/>
          <stop offset="60%"  stopColor="#e8c020"/>
          <stop offset="100%" stopColor="#a87800"/>
        </radialGradient>
        <filter id="xpWltSh"><feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#000" floodOpacity="0.35"/></filter>
      </defs>
      {/* Wallet body */}
      <rect x="5" y="14" width="36" height="26" rx="3" fill="url(#xpWltBody)" stroke="#4a2008" strokeWidth="0.8" filter="url(#xpWltSh)"/>
      {/* Wallet opening / flap */}
      <path d="M5 14 Q5 8 24 8 Q43 8 43 14" fill="url(#xpWltFlap)" stroke="#4a2008" strokeWidth="0.8"/>
      {/* Card pocket */}
      <rect x="8" y="18" width="24" height="14" rx="2" fill="#6a3010" stroke="#4a2008" strokeWidth="0.6" opacity="0.6"/>
      {/* Coin slot */}
      <rect x="32" y="18" width="8" height="14" rx="2" fill="#5a2808" stroke="#4a2008" strokeWidth="0.6"/>
      {/* Coins */}
      <circle cx="36" cy="22" r="3.5" fill="url(#xpCoin1)" stroke="#a87800" strokeWidth="0.6"/>
      <circle cx="36" cy="28" r="3.5" fill="url(#xpCoin1)" stroke="#a87800" strokeWidth="0.6"/>
      {/* $ on coin */}
      <text x="34.5" y="24" fontSize="4" fill="#7a5800" fontWeight="bold" fontFamily="Arial">$</text>
      {/* Leather stitch */}
      <rect x="7" y="39" width="34" height="1" rx="0.5" fill="#4a2008" opacity="0.4"/>
      {/* Highlight */}
      <ellipse cx="18" cy="16" rx="8" ry="2" fill="rgba(255,255,255,0.2)"/>
    </svg>
  );
}

/** Delete / Recycle bin — the iconic XP recycle bin */
export function XPTrash2({ size = 16 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="xpBinCan" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#f0ece4"/>
          <stop offset="100%" stopColor="#b8b4ac"/>
        </linearGradient>
      </defs>
      {/* Bin body */}
      <path d="M5.5 8.5 L7 21 L17 21 L18.5 8.5 Z"
            fill="url(#xpBinCan)" stroke="#888a8c" strokeWidth="0.8"/>
      {/* Vertical ribs */}
      <line x1="9.5"  y1="10" x2="9"   y2="19.5" stroke="#aaa" strokeWidth="0.7" opacity="0.6"/>
      <line x1="12"   y1="10" x2="12"  y2="19.5" stroke="#aaa" strokeWidth="0.7" opacity="0.6"/>
      <line x1="14.5" y1="10" x2="15"  y2="19.5" stroke="#aaa" strokeWidth="0.7" opacity="0.6"/>
      {/* Recycle arrows (3 blue arrows in triangle) */}
      <path d="M10 13 L9 16 L11.5 16 Z" fill="#316ac5" opacity="0.8"/>
      <path d="M14 13 L12.5 16 L15 16 Z" fill="#316ac5" opacity="0.8" transform="rotate(120 13 14.5)"/>
      <path d="M12 17.5 L10.5 14.5 L13.5 14.5 Z" fill="#316ac5" opacity="0.8" transform="rotate(240 12 15.5)"/>
      {/* Lid */}
      <rect x="4" y="6" width="16" height="2.5" rx="1" fill="#d4d0c8" stroke="#888a8c" strokeWidth="0.7"/>
      {/* Handle */}
      <path d="M10 3.5 Q10 2.5 12 2.5 Q14 2.5 14 3.5 L14 6 L10 6 Z"
            fill="#d4d0c8" stroke="#888a8c" strokeWidth="0.7"/>
    </svg>
  );
}

/** Confirm checkmark — green XP-style */
export function XPCheck({ size = 18 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <radialGradient id="xpChkBg" cx="38%" cy="33%">
          <stop offset="0%"   stopColor="#aaffaa"/>
          <stop offset="55%"  stopColor="#22cc22"/>
          <stop offset="100%" stopColor="#0a7a0a"/>
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#xpChkBg)" stroke="#0a5a0a" strokeWidth="0.8"/>
      <path d="M6.5 12 L10.5 16 L17.5 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <ellipse cx="9" cy="8" rx="2.5" ry="1.5" fill="rgba(255,255,255,0.3)" transform="rotate(-30 9 8)"/>
    </svg>
  );
}

/* ─── Navigation ─────────────────────────────────────────────── */

export function XPArrowLeft({ size = 22 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="xpAL" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#a0c8ff"/>
          <stop offset="45%"  stopColor="#3a6ee8"/>
          <stop offset="100%" stopColor="#1030b0"/>
        </linearGradient>
        <filter id="xpALs"><feDropShadow dx="0.5" dy="1" stdDeviation="0.7" floodColor="#000033" floodOpacity="0.5"/></filter>
      </defs>
      <path d="M14 4 L3 12 L14 20 L14 15 L21 15 L21 9 L14 9 Z"
            fill="url(#xpAL)" stroke="#0a2266" strokeWidth="0.7" filter="url(#xpALs)"/>
      <path d="M4.5 11.5 L13.5 5.5 L13.5 10 L20.5 10"
            fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
    </svg>
  );
}

export function XPChevronRight({ size = 18 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M9 5 L17 12 L9 19"
            stroke="#2255cc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ─── Actions ─────────────────────────────────────────────────── */

export function XPPlus({ size = 22 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <radialGradient id="xpPL" cx="38%" cy="33%">
          <stop offset="0%"   stopColor="#aaffaa"/>
          <stop offset="55%"  stopColor="#22bb22"/>
          <stop offset="100%" stopColor="#0a6010"/>
        </radialGradient>
        <filter id="xpPLs"><feDropShadow dx="0.5" dy="1" stdDeviation="0.8" floodColor="#003300" floodOpacity="0.45"/></filter>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#xpPL)" stroke="#0a5510" strokeWidth="0.8" filter="url(#xpPLs)"/>
      <rect x="10.5" y="5.5" width="3" height="13" rx="1.3" fill="white" opacity="0.95"/>
      <rect x="5.5"  y="10.5" width="13" height="3" rx="1.3" fill="white" opacity="0.95"/>
      <ellipse cx="8.5" cy="7.5" rx="3" ry="1.8" fill="rgba(255,255,255,0.3)" transform="rotate(-30 8.5 7.5)"/>
    </svg>
  );
}

export function XPSearch({ size = 20 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <radialGradient id="xpSrLens" cx="34%" cy="31%">
          <stop offset="0%"   stopColor="#ddf0ff"/>
          <stop offset="50%"  stopColor="#88bbff"/>
          <stop offset="100%" stopColor="#2255cc"/>
        </radialGradient>
        <linearGradient id="xpSrHndl" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#f8e080"/>
          <stop offset="100%" stopColor="#9a6e10"/>
        </linearGradient>
        <filter id="xpSrs"><feDropShadow dx="0.5" dy="1" stdDeviation="0.8" floodColor="#001133" floodOpacity="0.4"/></filter>
      </defs>
      <path d="M15 15 L21 21" stroke="url(#xpSrHndl)" strokeWidth="3.5" strokeLinecap="round"/>
      <circle cx="9.5" cy="9.5" r="7" fill="url(#xpSrLens)" stroke="#1a3a99" strokeWidth="1.5" filter="url(#xpSrs)"/>
      <ellipse cx="7.2" cy="7.0" rx="2.5" ry="1.7" fill="rgba(255,255,255,0.55)" transform="rotate(-35 7.2 7.0)"/>
    </svg>
  );
}

export function XPMoreHorizontal({ size = 20 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <radialGradient id="xpDot" cx="38%" cy="33%">
          <stop offset="0%"   stopColor="#bbddff"/>
          <stop offset="100%" stopColor="#1a44cc"/>
        </radialGradient>
      </defs>
      {[5, 12, 19].map(cx => (
        <circle key={cx} cx={cx} cy="12" r="2.8"
                fill="url(#xpDot)" stroke="#0f2a88" strokeWidth="0.5"/>
      ))}
    </svg>
  );
}

export function XPEdit({ size = 20 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="xpEdBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#fff0a0"/>
          <stop offset="60%"  stopColor="#e0aa18"/>
          <stop offset="100%" stopColor="#886400"/>
        </linearGradient>
      </defs>
      {/* Eraser cap */}
      <rect x="16.5" y="2" width="4" height="3" rx="1"
            fill="#ffaaaa" stroke="#cc4444" strokeWidth="0.6"
            transform="rotate(45 18.5 3.5)"/>
      {/* Pencil body */}
      <rect x="6" y="3" width="3.5" height="14" rx="1"
            fill="url(#xpEdBody)" stroke="#7a5800" strokeWidth="0.6"
            transform="rotate(45 12 12)"/>
      {/* Tip */}
      <polygon points="3,21 6,18 9,21"
               fill="#d4c89a" stroke="#7a7040" strokeWidth="0.5"
               transform="rotate(45 6 18) translate(-3,3)"/>
      {/* Writing dot */}
      <circle cx="20" cy="20" r="1.2" fill="#226622"/>
    </svg>
  );
}

export function XPArrowUpDown({ size = 20 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="xpSrtUp" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#aaccff"/>
          <stop offset="100%" stopColor="#2244cc"/>
        </linearGradient>
        <linearGradient id="xpSrtDn" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#ffcc66"/>
          <stop offset="100%" stopColor="#cc6600"/>
        </linearGradient>
      </defs>
      <polygon points="12,2 5,10 19,10"  fill="url(#xpSrtUp)" stroke="#1133aa" strokeWidth="0.5"/>
      <polygon points="12,22 19,14 5,14" fill="url(#xpSrtDn)" stroke="#aa4400" strokeWidth="0.5"/>
    </svg>
  );
}

export function XPWand({ size = 20 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="xpWandStk" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#ddaaff"/>
          <stop offset="100%" stopColor="#6622cc"/>
        </linearGradient>
      </defs>
      <path d="M3 21 L17 7" stroke="url(#xpWandStk)" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Star */}
      <path d="M19 2 l1.2 3 3.2 0 -2.6 2 1 3.2 -2.8-1.8 -2.8 1.8 1-3.2 -2.6-2 3.2 0 Z"
            fill="#ffee22" stroke="#cc8800" strokeWidth="0.5" transform="scale(0.75) translate(7.5 0)"/>
      {/* Sparkles */}
      <circle cx="7" cy="10" r="1.1" fill="#ffdd22"/>
      <circle cx="13" cy="16" r="0.8" fill="#aaddff"/>
      <circle cx="5"  cy="15" r="0.6" fill="#ffaaee"/>
    </svg>
  );
}

export function XPX({ size = 20 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <radialGradient id="xpXBg" cx="38%" cy="33%">
          <stop offset="0%"   stopColor="#ff9999"/>
          <stop offset="55%"  stopColor="#ee2222"/>
          <stop offset="100%" stopColor="#990000"/>
        </radialGradient>
        <filter id="xpXs"><feDropShadow dx="0.5" dy="1" stdDeviation="0.8" floodColor="#330000" floodOpacity="0.4"/></filter>
      </defs>
      <circle cx="12" cy="12" r="10"
              fill="url(#xpXBg)" stroke="#770000" strokeWidth="0.8" filter="url(#xpXs)"/>
      <path d="M7.5 7.5 L16.5 16.5 M16.5 7.5 L7.5 16.5"
            stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      <ellipse cx="9" cy="8" rx="3" ry="1.5"
               fill="rgba(255,255,255,0.25)" transform="rotate(-30 9 8)"/>
    </svg>
  );
}

/* ─── Data / Storage ─────────────────────────────────────────── */

export function XPDatabase({ size = 20 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="xpDbBody" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#99ccff"/>
          <stop offset="100%" stopColor="#2266cc"/>
        </linearGradient>
      </defs>
      {/* Body */}
      <rect x="4" y="6" width="16" height="12" fill="url(#xpDbBody)"/>
      <line x1="4" y1="6"  x2="4" y2="18"  stroke="#0d3a88" strokeWidth="0.6"/>
      <line x1="20" y1="6" x2="20" y2="18" stroke="#0d3a88" strokeWidth="0.6"/>
      {/* Bottom cap */}
      <ellipse cx="12" cy="18" rx="8" ry="2.5" fill="#1a55bb" stroke="#0d3a88" strokeWidth="0.6"/>
      {/* Top cap */}
      <ellipse cx="12" cy="6"  rx="8" ry="2.5" fill="#ccddff" stroke="#0d3a88" strokeWidth="0.6"/>
      {/* Middle seam */}
      <ellipse cx="12" cy="12" rx="8" ry="2.5" fill="none"   stroke="#0d3a88" strokeWidth="0.6"/>
      {/* Top highlight */}
      <ellipse cx="10" cy="5.4" rx="3" ry="1" fill="rgba(255,255,255,0.5)"/>
    </svg>
  );
}

export function XPCloud({ size = 17 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="xpCloudG" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#ffffff"/>
          <stop offset="100%" stopColor="#aaccee"/>
        </linearGradient>
      </defs>
      <path d="M6 19 C2 19 1 14 4.5 12.5 C4 8.5 7.5 6 12 7.5
               C13.5 4.5 18.5 4.5 20 8.5 C23 8.5 23.5 14 20.5 16 Z"
            fill="url(#xpCloudG)" stroke="#4477aa" strokeWidth="0.8"/>
      <path d="M5 14 C3.5 13.5 3 12 4 11"
            fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1"/>
    </svg>
  );
}

export function XPFileSpreadsheet({ size = 17, accent = '#22aa22' }: P & { accent?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Page */}
      <rect x="3" y="2" width="14" height="20" rx="1.5"
            fill="white" stroke="#888" strokeWidth="0.7"/>
      {/* Folded corner */}
      <polygon points="17,2 21,6 17,6" fill="#e0e0e0" stroke="#999" strokeWidth="0.5"/>
      <rect x="17" y="6" width="4" height="16" rx="1" fill="#ececec" stroke="#aaa" strokeWidth="0.5"/>
      {/* Spreadsheet area */}
      <rect x="5" y="7" width="10" height="11" rx="0.5" fill={accent} opacity="0.9"/>
      {/* Grid */}
      <line x1="9.3"  y1="7"  x2="9.3"  y2="18" stroke="white" strokeWidth="0.8"/>
      <line x1="11.3" y1="7"  x2="11.3" y2="18" stroke="white" strokeWidth="0.8"/>
      <line x1="5"    y1="10" x2="15"   y2="10" stroke="white" strokeWidth="0.8"/>
      <line x1="5"    y1="13" x2="15"   y2="13" stroke="white" strokeWidth="0.8"/>
      <line x1="5"    y1="16" x2="15"   y2="16" stroke="white" strokeWidth="0.8"/>
    </svg>
  );
}

export function XPDownload({ size = 17 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="xpDlG" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#99ccff"/>
          <stop offset="100%" stopColor="#1a55cc"/>
        </linearGradient>
      </defs>
      <path d="M12 3 L12 15" stroke="url(#xpDlG)" strokeWidth="2.5" strokeLinecap="round"/>
      <polygon points="5.5,12 12,20 18.5,12" fill="url(#xpDlG)" stroke="#0a3388" strokeWidth="0.5"/>
      <rect x="4" y="19.5" width="16" height="2.5" rx="1.2" fill="#1a55cc" stroke="#0a3388" strokeWidth="0.5"/>
    </svg>
  );
}

export function XPUpload({ size = 17 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="xpUlG" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%"   stopColor="#99ccff"/>
          <stop offset="100%" stopColor="#1a55cc"/>
        </linearGradient>
      </defs>
      <path d="M12 21 L12 9" stroke="url(#xpUlG)" strokeWidth="2.5" strokeLinecap="round"/>
      <polygon points="5.5,12 12,4 18.5,12" fill="url(#xpUlG)" stroke="#0a3388" strokeWidth="0.5"/>
      <rect x="4" y="19.5" width="16" height="2.5" rx="1.2" fill="#1a55cc" stroke="#0a3388" strokeWidth="0.5"/>
    </svg>
  );
}

export function XPMessageCircle({ size = 17 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="xpMsgG" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#aaddff"/>
          <stop offset="100%" stopColor="#2266cc"/>
        </linearGradient>
      </defs>
      <path d="M3 6 C3 4.3 4.3 3 6 3 L18 3 C19.7 3 21 4.3 21 6
               L21 14 C21 15.7 19.7 17 18 17 L9 17 L5 21 L5 17
               C3.3 17 3 15.7 3 14 Z"
            fill="url(#xpMsgG)" stroke="#1144aa" strokeWidth="0.8"/>
      <ellipse cx="9.5" cy="6.5" rx="4" ry="1.2" fill="rgba(255,255,255,0.3)"/>
    </svg>
  );
}

/* ─── Display / Theme ────────────────────────────────────────── */

export function XPSun({ size = 20 }: P) {
  const rays = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <radialGradient id="xpSunG" cx="50%" cy="50%">
          <stop offset="0%"   stopColor="#ffffcc"/>
          <stop offset="50%"  stopColor="#ffcc00"/>
          <stop offset="100%" stopColor="#ee8800"/>
        </radialGradient>
      </defs>
      {rays.map(a => (
        <line key={a}
          x1={12 + 7.5 * Math.cos(a * Math.PI / 180)}
          y1={12 + 7.5 * Math.sin(a * Math.PI / 180)}
          x2={12 + 11 * Math.cos(a * Math.PI / 180)}
          y2={12 + 11 * Math.sin(a * Math.PI / 180)}
          stroke="#ee8800" strokeWidth="2" strokeLinecap="round"/>
      ))}
      <circle cx="12" cy="12" r="6.5"
              fill="url(#xpSunG)" stroke="#cc7700" strokeWidth="0.5"/>
      <ellipse cx="9.5" cy="9.5" rx="2.5" ry="1.5"
               fill="rgba(255,255,255,0.4)" transform="rotate(-30 9.5 9.5)"/>
    </svg>
  );
}

export function XPMoon({ size = 20 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <radialGradient id="xpMoonG" cx="35%" cy="30%">
          <stop offset="0%"   stopColor="#eeeeff"/>
          <stop offset="60%"  stopColor="#aaaadd"/>
          <stop offset="100%" stopColor="#556699"/>
        </radialGradient>
      </defs>
      <path d="M12 3 C8 3 5 6.1 5 10.5 C5 15.5 8.5 21 15 21
               C18 21 20.5 19.5 21.5 17.2
               C19 18.1 16 17 14 15
               C10.5 12 10.5 7.5 12 3 Z"
            fill="url(#xpMoonG)" stroke="#3344aa" strokeWidth="0.8"/>
      <circle cx="17" cy="7" r="1" fill="rgba(255,255,255,0.5)"/>
      <circle cx="19" cy="10" r="0.6" fill="rgba(255,255,255,0.4)"/>
    </svg>
  );
}

export function XPRefreshCcw({ size = 20 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="xpRefG" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#aaffaa"/>
          <stop offset="100%" stopColor="#1a7a1a"/>
        </linearGradient>
      </defs>
      <path d="M3 12 C3 7 7 3 12 3 C15.5 3 18.5 4.8 20 8"
            stroke="url(#xpRefG)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M21 12 C21 17 17 21 12 21 C8.5 21 5.5 19.2 4 16"
            stroke="url(#xpRefG)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <polygon points="20,5 24,8.5 20,12" fill="#1a7a1a" stroke="#0a4a0a" strokeWidth="0.5"/>
      <polygon points="4,12 0,15.5 4,19"  fill="#1a7a1a" stroke="#0a4a0a" strokeWidth="0.5"/>
    </svg>
  );
}
