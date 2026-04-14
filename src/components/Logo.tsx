import React from 'react';
import { motion } from 'motion/react';

interface LogoProps {
  className?: string;
}

export default function Logo({ className = '' }: LogoProps) {
  return (
    <motion.svg 
      viewBox="0 0 460 120" 
      className={className}
      fill="currentColor" 
      xmlns="http://www.w3.org/2000/svg"
      initial="hidden"
      animate="visible"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.8" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="1" />
        </linearGradient>
      </defs>
      
      {/* Left Short Bar */}
      <motion.rect 
        x="20" y="40" width="20" height="40" rx="4"
        fill="url(#logoGradient)"
        variants={{
          hidden: { height: 0, y: 60, opacity: 0 },
          visible: { height: 40, y: 40, opacity: 1, transition: { duration: 0.5, delay: 0.1, ease: "easeOut" } }
        }}
      />
      {/* Left Tall Bar */}
      <motion.rect 
        x="55" y="20" width="20" height="80" rx="4"
        fill="url(#logoGradient)"
        variants={{
          hidden: { height: 0, y: 60, opacity: 0 },
          visible: { height: 80, y: 20, opacity: 1, transition: { duration: 0.5, delay: 0.2, ease: "easeOut" } }
        }}
      />
      {/* Left Chevron < */}
      <motion.path 
        d="M 168 20 L 140 20 L 100 60 L 140 100 L 168 100 L 128 60 Z" 
        fill="url(#logoGradient)"
        variants={{
          hidden: { x: 20, opacity: 0 },
          visible: { x: 0, opacity: 1, transition: { duration: 0.5, delay: 0.3, ease: "easeOut" } }
        }}
      />
      {/* Center C */}
      <motion.path 
        d="M 254 39 A 30 30 0 1 0 254 81" 
        fill="none" 
        stroke="url(#logoGradient)" 
        strokeWidth="20" 
        strokeLinecap="round"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: { pathLength: 1, opacity: 1, transition: { duration: 0.8, delay: 0.4, ease: "easeInOut" } }
        }}
      />
      {/* Right Chevron > */}
      <motion.path 
        d="M 292 20 L 320 20 L 360 60 L 320 100 L 292 100 L 332 60 Z" 
        fill="url(#logoGradient)"
        variants={{
          hidden: { x: -20, opacity: 0 },
          visible: { x: 0, opacity: 1, transition: { duration: 0.5, delay: 0.5, ease: "easeOut" } }
        }}
      />
      {/* Right Tall Bar */}
      <motion.rect 
        x="385" y="20" width="20" height="80" rx="4"
        fill="url(#logoGradient)"
        variants={{
          hidden: { height: 0, y: 60, opacity: 0 },
          visible: { height: 80, y: 20, opacity: 1, transition: { duration: 0.5, delay: 0.6, ease: "easeOut" } }
        }}
      />
      {/* Right Short Bar */}
      <motion.rect 
        x="420" y="40" width="20" height="40" rx="4"
        fill="url(#logoGradient)"
        variants={{
          hidden: { height: 0, y: 60, opacity: 0 },
          visible: { height: 40, y: 40, opacity: 1, transition: { duration: 0.5, delay: 0.7, ease: "easeOut" } }
        }}
      />
    </motion.svg>
  );
}
