'use client';

import React, { useEffect, useState } from 'react';

interface TotoroCharacterProps {
  state: 'idle' | 'running' | 'jumping' | 'happy';
  direction?: 'left' | 'right';
  className?: string;
}

export const TotoroCharacter: React.FC<TotoroCharacterProps> = ({
  state,
  direction = 'right',
  className = '',
}) => {
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });

  // Track cursor position to have Totoro's eyes gently watch the user's cursor
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const x = ((e.clientX - windowWidth / 2) / (windowWidth / 2)) * 3.5;
      const y = ((e.clientY - windowHeight / 2) / (windowHeight / 2)) * 3;
      setEyeOffset({ x: Math.max(-4, Math.min(4, x)), y: Math.max(-3, Math.min(3, y)) });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const isRunning = state === 'running';
  const isJumping = state === 'jumping';
  const isHappy = state === 'happy';

  return (
    <div
      className={`relative inline-flex items-end justify-center select-none ${className}`}
      style={{
        transform: direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
      }}
    >
      {/* 1. Dust Puffs & Soot Sprites trail when running/jumping */}
      {(isRunning || isJumping) && (
        <div className="absolute -bottom-2 -left-6 flex items-center gap-1.5 pointer-events-none">
          <div className="w-3.5 h-3.5 rounded-full bg-stone-400/40 blur-[1px] animate-ping" />
          <div className="w-2.5 h-2.5 rounded-full bg-stone-300/50 blur-[1px] animate-pulse" />
        </div>
      )}

      {/* Scurrying Soot Sprite Companion 1 */}
      <div
        className={`absolute -bottom-1 -left-5 z-20 transition-all duration-300 ${
          isRunning ? 'animate-soot-scurry -translate-x-2' : isJumping ? '-translate-y-4' : 'animate-bounce'
        }`}
        style={{ animationDuration: isRunning ? '0.28s' : '2.8s' }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" className="filter drop-shadow-md">
          {/* Spiky Soot Fur */}
          <circle cx="12" cy="12" r="9" fill="#1C1E21" />
          <path d="M4 10 L1 9 L4 12 L1 15 L5 14" stroke="#1C1E21" strokeWidth="1.5" />
          <path d="M20 10 L23 9 L20 12 L23 15 L19 14" stroke="#1C1E21" strokeWidth="1.5" />
          <path d="M9 4 L8 1 L12 4 L15 1 L14 4" stroke="#1C1E21" strokeWidth="1.5" />
          <path d="M9 20 L8 23 L12 20 L15 23 L14 20" stroke="#1C1E21" strokeWidth="1.5" />
          {/* Big Cartoon Eyes */}
          <circle cx="9.5" cy="11.5" r="3.2" fill="#FFFFFF" />
          <circle cx="14.5" cy="11.5" r="3.2" fill="#FFFFFF" />
          <circle cx="10" cy="11.5" r="1.4" fill="#000000" />
          <circle cx="15" cy="11.5" r="1.4" fill="#000000" />
          {/* Star Candy (Konpeito) held by sprite */}
          <polygon points="12,17 13,19 15,19 13.5,20.5 14,22.5 12,21 10,22.5 10.5,20.5 9,19 11,19" fill="#F472B6" />
        </svg>
      </div>

      {/* Scurrying Tiny White Chibi-Totoro or Soot Sprite 2 */}
      <div
        className={`absolute -bottom-0.5 -right-4 z-20 transition-all duration-300 ${
          isRunning ? 'animate-soot-scurry translate-x-2' : isJumping ? '-translate-y-5' : 'animate-pulse'
        }`}
      >
        <svg width="18" height="20" viewBox="0 0 20 24" className="filter drop-shadow-md">
          {/* Tiny White Body */}
          <ellipse cx="10" cy="14" rx="7" ry="8" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="0.8" />
          {/* Ears */}
          <ellipse cx="6.5" cy="6" rx="2" ry="4" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="0.8" />
          <ellipse cx="13.5" cy="6" rx="2" ry="4" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="0.8" />
          {/* Eyes */}
          <circle cx="7.5" cy="12" r="1.5" fill="#0F172A" />
          <circle cx="12.5" cy="12" r="1.5" fill="#0F172A" />
          {/* Tiny Tail */}
          <circle cx="10" cy="20" r="2.5" fill="#F8FAFC" />
        </svg>
      </div>

      {/* 2. Main Animated Totoro SVG Body */}
      <div
        className={`relative z-10 transition-transform duration-300 ${
          isRunning
            ? 'animate-totoro-waddle'
            : isJumping
            ? 'animate-totoro-jump'
            : isHappy
            ? 'scale-105 -translate-y-2'
            : 'animate-totoro-breathe'
        }`}
      >
        <svg
          width="110"
          height="125"
          viewBox="0 0 110 125"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-2xl"
        >
          {/* Defs for Gradients & Glows */}
          <defs>
            <linearGradient id="totoroFur" x1="20" y1="20" x2="90" y2="120" gradientUnits="userSpaceOnUse">
              <stop stopColor="#8A9A92" />
              <stop offset="0.5" stopColor="#75857E" />
              <stop offset="1" stopColor="#5E6D66" />
            </linearGradient>

            <linearGradient id="totoroBelly" x1="55" y1="60" x2="55" y2="115" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFDF7" />
              <stop offset="1" stopColor="#F4ECE1" />
            </linearGradient>

            <linearGradient id="umbrellaRed" x1="10" y1="0" x2="80" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor="#EF4444" />
              <stop offset="1" stopColor="#B91C1C" />
            </linearGradient>
          </defs>

          {/* === LEAF UMBRELLA OR TWIRLING UMBRELLA === */}
          <g className="animate-umbrella-bob origin-bottom-right">
            {/* Umbrella Pole */}
            <line x1="82" y1="45" x2="92" y2="85" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M92 85 Q94 92 88 94" stroke="#78350F" strokeWidth="2" fill="none" strokeLinecap="round" />
            
            {/* Umbrella Canopy */}
            <path
              d="M50 42 C50 22, 105 22, 105 42 Q90 40 80 43 Q70 39 62 43 Q55 40 50 42 Z"
              fill="url(#umbrellaRed)"
              stroke="#7F1D1D"
              strokeWidth="1.2"
            />
            {/* Umbrella Ribs */}
            <path d="M78 24 Q78 35 80 43" stroke="#FECACA" strokeWidth="0.8" fill="none" />
            <path d="M78 24 Q65 32 62 43" stroke="#FECACA" strokeWidth="0.8" fill="none" />
            <path d="M78 24 Q92 32 94 42" stroke="#FECACA" strokeWidth="0.8" fill="none" />
            <circle cx="78" cy="23" r="2" fill="#F59E0B" />
          </g>

          {/* === TOTORO EARS === */}
          <g className="animate-totoro-ear origin-bottom">
            {/* Left Ear */}
            <path
              d="M38 42 C32 25, 34 10, 41 8 C47 8, 48 24, 46 42 Z"
              fill="url(#totoroFur)"
              stroke="#4E5D57"
              strokeWidth="1.2"
            />
            <ellipse cx="40" cy="24" rx="2.5" ry="8" fill="#6B7B75" opacity="0.6" />

            {/* Right Ear */}
            <path
              d="M64 42 C62 24, 63 8, 69 8 C76 10, 78 25, 72 42 Z"
              fill="url(#totoroFur)"
              stroke="#4E5D57"
              strokeWidth="1.2"
            />
            <ellipse cx="70" cy="24" rx="2.5" ry="8" fill="#6B7B75" opacity="0.6" />
          </g>

          {/* === GREEN LEAF ON HEAD === */}
          <g className="animate-leaf-sway origin-bottom">
            <path
              d="M50 36 C42 28, 54 20, 62 26 C66 32, 58 38, 50 36 Z"
              fill="#65A30D"
              stroke="#3F6212"
              strokeWidth="1"
            />
            <path d="M50 36 Q56 28 62 26" stroke="#84CC16" strokeWidth="0.8" fill="none" />
            {/* Leaf Stem */}
            <path d="M50 36 Q46 39 44 42" stroke="#3F6212" strokeWidth="1.2" strokeLinecap="round" />
            {/* Dewdrop on leaf */}
            <circle cx="56" cy="27" r="1.5" fill="#E0F2FE" opacity="0.9" />
          </g>

          {/* === MAIN TOTORO BODY (Plump Pear Silhouette) === */}
          <path
            d="M55 38 C32 38, 22 55, 18 80 C14 105, 24 118, 55 118 C86 118, 96 105, 92 80 C88 55, 78 38, 55 38 Z"
            fill="url(#totoroFur)"
            stroke="#4A5852"
            strokeWidth="1.5"
          />

          {/* === FLUFFY TOTORO BELLY === */}
          <ellipse
            cx="55"
            cy="88"
            rx="27"
            ry="24"
            fill="url(#totoroBelly)"
            stroke="#E2D7C8"
            strokeWidth="1"
          />

          {/* === 5 TOTORO BELLY CHEVRONS ^ ^ ^ === */}
          {/* Top Row (3 Chevrons) */}
          <path d="M42 74 Q45 70 48 74" stroke="#5E6D66" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M52 72 Q55 68 58 72" stroke="#5E6D66" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M62 74 Q65 70 68 74" stroke="#5E6D66" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Bottom Row (2 Chevrons) */}
          <path d="M47 82 Q50 78 53 82" stroke="#5E6D66" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M57 82 Q60 78 63 82" stroke="#5E6D66" strokeWidth="2" strokeLinecap="round" fill="none" />

          {/* === BIG EXPRESSIVE EYES (TRACKS CURSOR) === */}
          {/* Left Eye */}
          <circle cx="41" cy="50" r="5.5" fill="#FFFFFF" stroke="#4A5852" strokeWidth="1" />
          <circle
            cx={41 + eyeOffset.x * 0.4}
            cy={50 + eyeOffset.y * 0.4}
            r="2.6"
            fill="#0F172A"
          />
          <circle
            cx={41 + eyeOffset.x * 0.4 - 0.8}
            cy={50 + eyeOffset.y * 0.4 - 0.8}
            r="0.9"
            fill="#FFFFFF"
          />

          {/* Right Eye */}
          <circle cx="69" cy="50" r="5.5" fill="#FFFFFF" stroke="#4A5852" strokeWidth="1" />
          <circle
            cx={69 + eyeOffset.x * 0.4}
            cy={50 + eyeOffset.y * 0.4}
            r="2.6"
            fill="#0F172A"
          />
          <circle
            cx={69 + eyeOffset.x * 0.4 - 0.8}
            cy={50 + eyeOffset.y * 0.4 - 0.8}
            r="0.9"
            fill="#FFFFFF"
          />

          {/* === CUTE NOSE === */}
          <ellipse cx="55" cy="53" rx="3.5" ry="2" fill="#292524" />

          {/* === ICONIC TOTORO GRIN & TEETH === */}
          {isHappy ? (
            /* Wide Open Grin with Teeth */
            <g>
              <path
                d="M38 60 Q55 69 72 60 Q55 56 38 60 Z"
                fill="#FFFFFF"
                stroke="#292524"
                strokeWidth="1.2"
              />
              <line x1="45" y1="58" x2="45" y2="63" stroke="#78716C" strokeWidth="0.8" />
              <line x1="51" y1="57" x2="51" y2="64" stroke="#78716C" strokeWidth="0.8" />
              <line x1="57" y1="57" x2="57" y2="64" stroke="#78716C" strokeWidth="0.8" />
              <line x1="63" y1="58" x2="63" y2="63" stroke="#78716C" strokeWidth="0.8" />
            </g>
          ) : (
            /* Warm Cheerful Smile */
            <path
              d="M44 59 Q55 64 66 59"
              stroke="#292524"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
          )}

          {/* === WHISKERS (3 on each side) === */}
          {/* Left Whiskers */}
          <line x1="18" y1="52" x2="34" y2="54" stroke="#292524" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="16" y1="57" x2="33" y2="57" stroke="#292524" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="19" y1="62" x2="35" y2="60" stroke="#292524" strokeWidth="1.2" strokeLinecap="round" />

          {/* Right Whiskers */}
          <line x1="92" y1="52" x2="76" y2="54" stroke="#292524" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="94" y1="57" x2="77" y2="57" stroke="#292524" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="91" y1="62" x2="75" y2="60" stroke="#292524" strokeWidth="1.2" strokeLinecap="round" />

          {/* === CLAWS / ARMS === */}
          {/* Left Paw holding Acorn */}
          <ellipse cx="28" cy="80" rx="6" ry="10" fill="url(#totoroFur)" stroke="#4A5852" strokeWidth="1" />
          {/* Right Arm holding Umbrella Handle */}
          <ellipse cx="82" cy="82" rx="6" ry="9" fill="url(#totoroFur)" stroke="#4A5852" strokeWidth="1" />

          {/* Acorn in Hand */}
          <g>
            <ellipse cx="28" cy="83" rx="4.5" ry="5.5" fill="#B45309" stroke="#78350F" strokeWidth="0.8" />
            <path d="M24 80 Q28 77 32 80" fill="#78350F" />
            <circle cx="28" cy="76.5" r="0.8" fill="#78350F" />
          </g>

          {/* === FEET WITH CLAWS === */}
          {/* Left Foot */}
          <ellipse cx="38" cy="116" rx="8" ry="4" fill="#5E6D66" stroke="#4A5852" strokeWidth="1" />
          <circle cx="33" cy="116" r="1" fill="#FFFFFF" />
          <circle cx="37" cy="117" r="1" fill="#FFFFFF" />
          <circle cx="41" cy="116" r="1" fill="#FFFFFF" />

          {/* Right Foot */}
          <ellipse cx="72" cy="116" rx="8" ry="4" fill="#5E6D66" stroke="#4A5852" strokeWidth="1" />
          <circle cx="68" cy="116" r="1" fill="#FFFFFF" />
          <circle cx="72" cy="117" r="1" fill="#FFFFFF" />
          <circle cx="76" cy="116" r="1" fill="#FFFFFF" />
        </svg>
      </div>
    </div>
  );
};
