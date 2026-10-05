'use client';

import React from 'react';
import { 
  Scale, 
  ShieldAlert, 
  Flame, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface ContradictionMatrixProps {
  arbitration: any;
  threatLevel: 'TIER_1' | 'TIER_2' | 'TIER_3';
  onOpenAdjudication: () => void;
}

export const ContradictionMatrix: React.FC<ContradictionMatrixProps> = ({
  arbitration,
  threatLevel,
  onOpenAdjudication,
}) => {
  const isDeadlock = arbitration?.status === 'DEADLOCK_COLLISION';
  const isAdjudicated = arbitration?.status === 'ADJUDICATED_RESOLVED';

  // Dynamic threat risk percentage calculation
  const riskPercentage = isAdjudicated ? 18 : threatLevel === 'TIER_3' ? 94 : threatLevel === 'TIER_2' ? 48 : 12;
  const strokeDashoffset = 220 - (220 * riskPercentage) / 100;

  return (
    <div className="glass-panel contradiction-panel flex flex-col justify-between">
      {/* Panel Header */}
      <div className="panel-header">
        <div className="panel-title-wrap">
          <Scale className="w-4 h-4 text-emerald-400" />
          <h3 className="panel-title">STATUTORY CONTRADICTION MATRIX</h3>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`status-chip ${
              isDeadlock
                ? 'status-chip-danger'
                : isAdjudicated
                ? 'status-chip-success'
                : 'status-chip-safe'
            }`}
          >
            {isDeadlock ? 'DEADLOCK COLLISION' : isAdjudicated ? 'SANITY MUTATED' : 'CLEAR'}
          </span>
        </div>
      </div>

      {/* Hero Circular Conflict Dial & Summary */}
      <div className="conflict-dial-card">
        <div className="dial-container">
          <svg className="dial-svg" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="35" className="dial-track" />
            <circle
              cx="40"
              cy="40"
              r="35"
              className="dial-fill"
              style={{
                stroke: isDeadlock ? '#f43f5e' : isAdjudicated ? '#00e599' : '#00ffaa',
                strokeDasharray: 220,
                strokeDashoffset,
              }}
            />
          </svg>
          <div className="dial-center-text">
            <span
              className="dial-val font-mono"
              style={{ color: isDeadlock ? '#f43f5e' : '#00ffaa' }}
            >
              {riskPercentage}%
            </span>
            <span className="dial-lbl">RISK</span>
          </div>
        </div>

        <div className="dial-info">
          <div className="dial-heading">
            {isDeadlock ? (
              <span className="text-rose-400 font-bold flex items-center gap-1.5 font-mono text-xs">
                <AlertTriangle className="w-3.5 h-3.5" /> TRI-LATERAL COLLISION DETECTED
              </span>
            ) : isAdjudicated ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5 font-mono text-xs">
                <ShieldCheck className="w-3.5 h-3.5" /> PRECEDENT ENFORCED VIA SANITY
              </span>
            ) : (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5 font-mono text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" /> TRANSIT CLEARANCE VALID
              </span>
            )}
          </div>
          <p className="dial-desc text-[11px] text-slate-300 font-mono mt-1">
            {isDeadlock
              ? 'SOLAS compliance directly triggers kinetic drone tracking while insurance voids coverage.'
              : isAdjudicated
              ? 'Sanity mutation established binding precedent: CTF-153 waiver authorizes tactical darkness.'
              : 'Regulatory clauses harmonious. Normal transmission protocol in effect.'}
          </p>
        </div>
      </div>

      {/* 3 Streamlined Visual Telemetry Clause Chips (Ultra-Low Text) */}
      <div className="claude-cards-stack">
        {/* IMO SOLAS */}
        <div className="claude-chip-card chip-zed">
          <div className="chip-header">
            <div className="chip-badge">
              <Scale className="w-3 h-3 text-emerald-400" />
              <span className="font-mono text-[11px] font-bold text-white">IMO SOLAS V/19</span>
            </div>
            <span className="tag-pill tag-pill-zed">STATUTE</span>
          </div>
          <div className="chip-metrics">
            <div className="metric-col">
              <span className="metric-label">MANDATE</span>
              <span className="metric-val text-emerald-300">Continuous AIS On</span>
            </div>
            <div className="metric-col text-right">
              <span className="metric-label">DEFAULT PENALTY</span>
              <span className="metric-val text-rose-400 font-mono">Flag Revocation</span>
            </div>
          </div>
        </div>

        {/* UKMTO */}
        <div className="claude-chip-card chip-amber">
          <div className="chip-header">
            <div className="chip-badge">
              <Flame className="w-3 h-3 text-amber-400" />
              <span className="font-mono text-[11px] font-bold text-white">UKMTO 04/26 §3.2</span>
            </div>
            <span className="tag-pill tag-pill-amber">LIFE SAFETY</span>
          </div>
          <div className="chip-metrics">
            <div className="metric-col">
              <span className="metric-label">MANDATE</span>
              <span className="metric-val text-amber-300">Extinguish AIS (Go Dark)</span>
            </div>
            <div className="metric-col text-right">
              <span className="metric-label">COLLISION RISK</span>
              <span className="metric-val text-rose-400 font-mono">Drone Lock / Strike</span>
            </div>
          </div>
        </div>

        {/* LLOYD'S JWC */}
        <div className="claude-chip-card chip-rose">
          <div className="chip-header">
            <div className="chip-badge">
              <DollarSign className="w-3 h-3 text-rose-400" />
              <span className="font-mono text-[11px] font-bold text-white">JWC JWLA-032 §4.1</span>
            </div>
            <span className="tag-pill tag-pill-rose">INSURANCE</span>
          </div>
          <div className="chip-metrics">
            <div className="metric-col">
              <span className="metric-label">MANDATE</span>
              <span className="metric-val text-rose-300">Warranty Against Silence</span>
            </div>
            <div className="metric-col text-right">
              <span className="metric-label">FORFEITURE PENALTY</span>
              <span className="metric-val text-rose-400 font-mono">$65M Total Loss</span>
            </div>
          </div>
        </div>
      </div>

      {/* Adjudication CTA Button */}
      <button
        onClick={onOpenAdjudication}
        className={`matrix-adjudicate-btn ${isDeadlock ? 'is-deadlock' : 'is-safe'}`}
      >
        <Zap className="w-4 h-4" />
        <span>{isDeadlock ? 'RESOLVE DEADLOCK VIA SANITY ADJUDICATION' : 'ADJUDICATE & MUTATE PRECEDENT'}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
