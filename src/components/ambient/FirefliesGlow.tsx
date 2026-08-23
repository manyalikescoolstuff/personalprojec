'use client';

import React, { useMemo } from 'react';
import { useApp } from '@/context/AppContext';

interface FireflyData {
  id: number;
  top: string;
  left: string;
  size: number;
  colorType: 'lime' | 'gold' | 'cyan';
  flightClass: string;
  pulseDelay: string;
  pulseDuration: string;
}

export const FirefliesGlow: React.FC = () => {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  // Generate 20 distributed fireflies across the viewport with varied speeds, sizes, and colors
  const fireflies = useMemo<FireflyData[]>(() => {
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

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
      {fireflies.map((f) => (
        <div
          key={f.id}
          className={`absolute ${f.flightClass}`}
          style={{
            top: f.top,
            left: f.left,
          }}
        >
          {/* Glowing Bioluminescent Firefly Core */}
          <div
            className={`rounded-full animate-firefly-glow ${
              isDark
                ? f.colorType === 'lime'
                  ? 'firefly-glow-lime'
                  : f.colorType === 'gold'
                  ? 'firefly-glow-gold'
                  : 'firefly-glow-cyan'
                : 'bg-amber-300/80 shadow-[0_0_12px_#fde047]'
            }`}
            style={{
              width: `${f.size}px`,
              height: `${f.size}px`,
              animationDelay: f.pulseDelay,
              animationDuration: f.pulseDuration,
            }}
          />
        </div>
      ))}
    </div>
  );
};
