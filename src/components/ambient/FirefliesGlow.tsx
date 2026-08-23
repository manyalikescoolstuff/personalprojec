'use client';

import React, { useMemo } from 'react';
import { useApp } from '@/context/AppContext';

interface DragonflyProps {
  color: 'red' | 'blue' | 'amber';
  flightClass: string;
  style: React.CSSProperties;
}

const Dragonfly: React.FC<DragonflyProps> = ({ color, flightClass, style }) => {
  const bodyGradient =
    color === 'red'
      ? { head: '#991B1B', thorax: '#DC2626', tail: '#EF4444' }
      : color === 'blue'
      ? { head: '#075985', thorax: '#0284C7', tail: '#38BDF8' }
      : { head: '#92400E', thorax: '#D97706', tail: '#FBBF24' };

  return (
    <div className={`absolute ${flightClass} select-none pointer-events-none`} style={style}>
      <svg
        width="38"
        height="38"
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="filter drop-shadow-sm opacity-90"
      >
        {/* === 4 GOSSAMER WINGS (HIGH SPEED FLUTTER) === */}
        <g className="animate-dragonfly-wings origin-center">
          {/* Top-Left Wing */}
          <ellipse
            cx="13"
            cy="15"
            rx="12"
            ry="4.2"
            transform="rotate(-25 13 15)"
            fill="rgba(255, 255, 255, 0.75)"
            stroke="rgba(147, 197, 253, 0.6)"
            strokeWidth="0.6"
          />
          {/* Bottom-Left Wing */}
          <ellipse
            cx="14"
            cy="24"
            rx="10"
            ry="3.5"
            transform="rotate(15 14 24)"
            fill="rgba(255, 255, 255, 0.7)"
            stroke="rgba(147, 197, 253, 0.6)"
            strokeWidth="0.6"
          />
          {/* Top-Right Wing */}
          <ellipse
            cx="31"
            cy="15"
            rx="12"
            ry="4.2"
            transform="rotate(25 31 15)"
            fill="rgba(255, 255, 255, 0.75)"
            stroke="rgba(147, 197, 253, 0.6)"
            strokeWidth="0.6"
          />
          {/* Bottom-Right Wing */}
          <ellipse
            cx="30"
            cy="24"
            rx="10"
            ry="3.5"
            transform="rotate(-15 30 24)"
            fill="rgba(255, 255, 255, 0.7)"
            stroke="rgba(147, 197, 253, 0.6)"
            strokeWidth="0.6"
          />
        </g>

        {/* === DRAGONFLY BODY === */}
        {/* Head with Compound Eyes */}
        <circle cx="22" cy="11" r="2.8" fill={bodyGradient.head} />
        <circle cx="20" cy="10" r="1.4" fill="#0F172A" />
        <circle cx="24" cy="10" r="1.4" fill="#0F172A" />

        {/* Thorax */}
        <ellipse cx="22" cy="17" rx="2.5" ry="4" fill={bodyGradient.thorax} />

        {/* Slender Segmented Abdomen / Tail */}
        <path
          d="M22 21 L22 38"
          stroke={bodyGradient.tail}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <circle cx="22" cy="24" r="0.8" fill="#1C1917" />
        <circle cx="22" cy="28" r="0.8" fill="#1C1917" />
        <circle cx="22" cy="32" r="0.8" fill="#1C1917" />
        <circle cx="22" cy="36" r="0.8" fill="#1C1917" />
      </svg>
    </div>
  );
};

export const FirefliesGlow: React.FC = () => {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  // Night Mode: 18 Bioluminescent Glowing Fireflies
  const fireflies = useMemo(() => {
    const flightClasses = ['animate-firefly-flight-a', 'firefly-flight-b', 'firefly-flight-c'];
    const colors: ('lime' | 'gold' | 'cyan')[] = ['lime', 'lime', 'gold', 'cyan', 'lime', 'gold'];

    const positions = [
      { top: '12%', left: '15%', size: 4 },
      { top: '18%', left: '82%', size: 5 },
      { top: '25%', left: '42%', size: 3.5 },
      { top: '32%', left: '10%', size: 4.5 },
      { top: '40%', left: '68%', size: 5 },
      { top: '48%', left: '28%', size: 3.5 },
      { top: '55%', left: '88%', size: 4 },
      { top: '62%', left: '18%', size: 5.5 },
      { top: '70%', left: '50%', size: 4 },
      { top: '78%', left: '75%', size: 4.5 },
      { top: '85%', left: '35%', size: 5 },
      { top: '92%', left: '8%', size: 3.5 },
      { top: '8%', left: '60%', size: 4 },
      { top: '30%', left: '92%', size: 5 },
      { top: '50%', left: '5%', size: 4.5 },
      { top: '75%', left: '95%', size: 3.5 },
      { top: '88%', left: '58%', size: 5 },
      { top: '15%', left: '35%', size: 4 },
    ];

    return positions.map((pos, idx) => ({
      id: idx,
      top: pos.top,
      left: pos.left,
      size: pos.size,
      colorType: colors[idx % colors.length],
      flightClass: flightClasses[idx % flightClasses.length],
      pulseDelay: `${(idx * 0.45).toFixed(1)}s`,
      pulseDuration: `${(3 + (idx % 4) * 0.7).toFixed(1)}s`,
    }));
  }, []);

  // Light Mode: 8 Sunlit Japanese Red & Blue Dragonflies + Golden Sun Pollen
  const dragonflies = useMemo(() => {
    const dartClasses = [
      'animate-dragonfly-dart-1',
      'animate-dragonfly-dart-2',
      'animate-dragonfly-dart-3',
    ];
    const colors: ('red' | 'blue' | 'amber')[] = ['red', 'blue', 'red', 'amber', 'red', 'blue'];

    const positions = [
      { top: '14%', left: '20%' },
      { top: '22%', left: '78%' },
      { top: '38%', left: '12%' },
      { top: '48%', left: '85%' },
      { top: '64%', left: '26%' },
      { top: '76%', left: '68%' },
      { top: '86%', left: '42%' },
      { top: '10%', left: '55%' },
    ];

    return positions.map((pos, idx) => ({
      id: idx,
      top: pos.top,
      left: pos.left,
      color: colors[idx % colors.length],
      flightClass: dartClasses[idx % dartClasses.length],
      delay: `${(idx * 1.2).toFixed(1)}s`,
    }));
  }, []);

  // Sunlit Golden Pollen Motes in Daytime
  const sunPollen = useMemo(() => {
    return [
      { top: '18%', left: '30%', size: 4, delay: '0s' },
      { top: '35%', left: '70%', size: 3, delay: '1.5s' },
      { top: '55%', left: '15%', size: 3.5, delay: '3s' },
      { top: '72%', left: '80%', size: 4.5, delay: '2s' },
      { top: '85%', left: '45%', size: 3, delay: '4s' },
    ];
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
      {isDark ? (
        /* NIGHT THEME: Bioluminescent Glowing Fireflies */
        fireflies.map((f) => (
          <div
            key={f.id}
            className={`absolute ${f.flightClass}`}
            style={{
              top: f.top,
              left: f.left,
            }}
          >
            <div
              className={`rounded-full animate-firefly-glow ${
                f.colorType === 'lime'
                  ? 'firefly-glow-lime'
                  : f.colorType === 'gold'
                  ? 'firefly-glow-gold'
                  : 'firefly-glow-cyan'
              }`}
              style={{
                width: `${f.size}px`,
                height: `${f.size}px`,
                animationDelay: f.pulseDelay,
                animationDuration: f.pulseDuration,
              }}
            />
          </div>
        ))
      ) : (
        /* LIGHT THEME: Sunlit Flying Dragonflies + Pollen Motes */
        <>
          {dragonflies.map((d) => (
            <Dragonfly
              key={d.id}
              color={d.color}
              flightClass={d.flightClass}
              style={{
                top: d.top,
                left: d.left,
                animationDelay: d.delay,
              }}
            />
          ))}

          {sunPollen.map((p, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-amber-400/60 shadow-[0_0_8px_#f59e0b] animate-pollen"
              style={{
                top: p.top,
                left: p.left,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationDelay: p.delay,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
};
