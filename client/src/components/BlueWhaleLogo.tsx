// FILE: client/src/components/BlueWhaleLogo.tsx
import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export default function BlueWhaleLogo({ size = 48, className = '', showText = true }: LogoProps) {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="relative">
        {/* Accurate whale shape based on your logo */}
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 200 200" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="text-cyan-400"
        >
          {/* Whale body - curved elegant shape */}
          <path
            d="M 40 100 
               Q 30 85, 35 70
               T 45 50
               L 55 55
               Q 65 48, 75 55
               L 85 65
               Q 95 58, 105 65
               Q 115 72, 125 65
               Q 135 58, 145 65
               L 155 70
               Q 165 80, 170 90
               L 175 105
               Q 173 120, 165 130
               L 155 140
               Q 145 142, 138 135
               L 130 125
               Q 125 122, 120 125
               L 112 130
               Q 105 127, 98 130
               L 90 127
               Q 85 130, 80 127
               L 70 130
               Q 60 127, 52 130
               L 45 127
               Q 40 115, 40 100 Z"
            fill="currentColor"
            className="drop-shadow-lg"
          />
          
          {/* Eye - white circle */}
          <circle cx="60" cy="75" r="6" fill="white" className="animate-pulse" style={{ animationDuration: '3s' }} />
          
          {/* Data graph line on tail - the key feature! */}
          <g stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <polyline 
              points="115,95 125,85 135,92 145,80 155,88 165,75"
              className="animate-pulse"
              style={{ animationDuration: '2s', animationDelay: '0.5s' }}
            />
            {/* Data points */}
            <circle cx="115" cy="95" r="2.5" fill="white" />
            <circle cx="125" cy="85" r="2.5" fill="white" />
            <circle cx="135" cy="92" r="2.5" fill="white" />
            <circle cx="145" cy="80" r="2.5" fill="white" />
            <circle cx="155" cy="88" r="2.5" fill="white" />
            <circle cx="165" cy="75" r="2.5" fill="white" />
          </g>
        </svg>
        
        {/* Glow effect */}
        <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-xl animate-pulse" style={{ animationDuration: '3s' }}></div>
      </div>
      
      {showText && (
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            BlueWhale
          </h1>
          <p className="text-xs font-semibold text-cyan-400 tracking-wider">TERMINAL</p>
        </div>
      )}
    </div>
  );
}