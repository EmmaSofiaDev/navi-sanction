'use client';

import React, { useEffect, useRef } from 'react';

interface MaritimeRadarProps {
  threatLevel: 'TIER_1' | 'TIER_2' | 'TIER_3';
  isAisDark: boolean;
  hasEscort: boolean;
}

export const MaritimeRadar: React.FC<MaritimeRadarProps> = ({
  threatLevel,
  isAisDark,
  hasEscort,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const maxRadius = Math.min(centerX, centerY) - 15;

      ctx.clearRect(0, 0, width, height);

      // 1. Radar Background
      ctx.fillStyle = '#050c18';
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius, 0, Math.PI * 2);
      ctx.fill();

      // 2. Tactical Range Rings (5nm, 10nm, 15nm, 20nm)
      const ringColors = threatLevel === 'TIER_3' ? 'rgba(255, 51, 102, 0.25)' : 'rgba(0, 240, 255, 0.2)';
      [0.25, 0.5, 0.75, 1.0].forEach((ratio, idx) => {
        ctx.strokeStyle = ringColors;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(centerX, centerY, maxRadius * ratio, 0, Math.PI * 2);
        ctx.stroke();

        // Range labels
        ctx.fillStyle = threatLevel === 'TIER_3' ? '#ff3366' : '#00f0ff';
        ctx.font = '9px monospace';
        ctx.fillText(`${(idx + 1) * 5}NM`, centerX + 4, centerY - maxRadius * ratio + 10);
      });

      // 3. Coordinate Crosshairs & Bearing Lines
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
      ctx.beginPath();
      ctx.moveTo(centerX - maxRadius, centerY);
      ctx.lineTo(centerX + maxRadius, centerY);
      ctx.moveTo(centerX, centerY - maxRadius);
      ctx.lineTo(centerX, centerY + maxRadius);
      ctx.stroke();

      // 4. Rotating Radar Sweep Beam
      const sweepGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
      const sweepColor = threatLevel === 'TIER_3' ? 'rgba(255, 51, 102, 0.4)' : 'rgba(0, 240, 255, 0.35)';
      sweepGradient.addColorStop(0, 'rgba(0, 240, 255, 0.05)');
      sweepGradient.addColorStop(1, sweepColor);

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle);

      ctx.fillStyle = sweepGradient;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, maxRadius, 0, -Math.PI / 4, true);
      ctx.closePath();
      ctx.fill();

      // Leading edge glow line
      ctx.strokeStyle = threatLevel === 'TIER_3' ? '#ff3366' : '#00f0ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(maxRadius, 0);
      ctx.stroke();

      ctx.restore();

      // 5. Center Vessel (Ownship: MV Nordic Sentinel)
      ctx.fillStyle = isAisDark ? '#f59e0b' : '#00f0ff';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Heading vector
      ctx.strokeStyle = isAisDark ? '#f59e0b' : '#00f0ff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX, centerY - 18);
      ctx.stroke();

      // Ownship label
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '10px monospace';
      ctx.fillText(isAisDark ? 'OWNSHIP [DARK]' : 'OWNSHIP [AIS ON]', centerX - 45, centerY + 20);

      // 6. Threat Blips (Hostile Anti-Ship Missile / Drone contacts in Tier 3)
      if (threatLevel === 'TIER_3') {
        const threats = [
          { x: centerX + maxRadius * 0.65, y: centerY - maxRadius * 0.45, label: 'DRONE SWARM #1' },
          { x: centerX + maxRadius * 0.8, y: centerY - maxRadius * 0.15, label: 'RADAR LOCK (ASBM)' },
        ];

        threats.forEach(t => {
          ctx.fillStyle = '#ff3366';
          ctx.beginPath();
          ctx.arc(t.x, t.y, 4, 0, Math.PI * 2);
          ctx.fill();

          // Pulsing warning ring
          ctx.strokeStyle = 'rgba(255, 51, 102, 0.7)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(t.x, t.y, 8 + Math.sin(angle * 4) * 3, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#ff3366';
          ctx.font = '8px monospace';
          ctx.fillText(t.label, t.x + 8, t.y + 3);
        });
      }

      // 7. Allied Naval Escort Blip (CTF-153)
      if (hasEscort) {
        const escortX = centerX - maxRadius * 0.45;
        const escortY = centerY - maxRadius * 0.35;

        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(escortX, escortY, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
        ctx.beginPath();
        ctx.arc(escortX, escortY, 8, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#10b981';
        ctx.font = '9px monospace';
        ctx.fillText('ALLIED WARSHIP CTF-153', escortX - 55, escortY - 10);
      }

      angle += 0.025;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [threatLevel, isAisDark, hasEscort]);

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-slate-950/70 rounded-xl tactical-border relative">
      <div className="absolute top-3 left-4 text-xs font-mono text-cyan-400 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
        TACTICAL AIR/SURFACE RADAR [20NM SWEEP]
      </div>
      <canvas
        ref={canvasRef}
        width={340}
        height={340}
        className="rounded-full shadow-2xl mt-4"
      />
      <div className="mt-2 text-[11px] font-mono text-slate-400 flex justify-between w-full px-4">
        <span>FREQ: X-BAND 9.4 GHz</span>
        <span className={threatLevel === 'TIER_3' ? 'text-red-400 font-bold animate-pulse' : 'text-emerald-400'}>
          {threatLevel === 'TIER_3' ? 'HOSTILE TRACKING ACQUIRED' : 'SECTOR CLEAR'}
        </span>
      </div>
    </div>
  );
};
