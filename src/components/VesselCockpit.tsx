'use client';

import React from 'react';
import { 
  Anchor, 
  Radio, 
  Compass, 
  MapPin, 
  ShieldCheck, 
  ShieldAlert,
  Sliders,
  Check,
  Flag
} from 'lucide-react';
import { audioEngine } from './AudioEngine';

export interface VesselInfo {
  id: string;
  name: string;
  imo: string;
  type: string;
  flag: string;
  sog: string;
  hdg: string;
  coordinates: string;
}

interface VesselCockpitProps {
  vessel: VesselInfo;
  zoneId: string;
  setZoneId: (val: string) => void;
  threatLevel: 'TIER_1' | 'TIER_2' | 'TIER_3';
  setThreatLevel: (val: 'TIER_1' | 'TIER_2' | 'TIER_3') => void;
  hasEscort: boolean;
  setHasEscort: (val: boolean) => void;
  isAisDark: boolean;
  setIsAisDark: (val: boolean) => void;
}

export const VesselCockpit: React.FC<VesselCockpitProps> = ({
  vessel,
  zoneId,
  setZoneId,
  threatLevel,
  setThreatLevel,
  hasEscort,
  setHasEscort,
  isAisDark,
  setIsAisDark,
}) => {
  return (
    <div className="glass-panel cockpit-panel flex flex-col justify-between">
      {/* Panel Header */}
      <div className="panel-header">
        <div className="panel-title-wrap">
          <Anchor className="w-4 h-4 text-emerald-400" />
          <div>
            <h2 className="panel-title uppercase">{vessel?.name || 'MV NORDIC SENTINEL'}</h2>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mt-0.5">
              <Flag className="w-2.5 h-2.5 text-emerald-400" />
              <span>{vessel?.flag || 'Marshall Islands (RMI)'}</span>
            </div>
          </div>
        </div>
        <span className="imo-chip font-mono">{vessel?.imo || 'IMO 9845210'}</span>
      </div>

      {/* High-Precision 4-Cell Telemetry HUD */}
      <div className="cockpit-telemetry-grid">
        <div className="telemetry-block">
          <div className="telemetry-label">
            <Compass className="w-3 h-3 text-emerald-400" />
            <span>SOG / HDG</span>
          </div>
          <div className="telemetry-value font-mono text-emerald-300">
            {vessel?.sog || '18.4'} <span className="text-[10px] text-slate-400">KTS</span> / {vessel?.hdg || '328°'}
          </div>
        </div>

        <div className="telemetry-block">
          <div className="telemetry-label">
            <MapPin className="w-3 h-3 text-emerald-400" />
            <span>FIX POSITION</span>
          </div>
          <div className="telemetry-value font-mono text-emerald-300 text-xs">
            {vessel?.coordinates || "12°35'N, 43°20'E"}
          </div>
        </div>

        <div className="telemetry-block">
          <div className="telemetry-label">
            <Radio className="w-3 h-3 text-amber-400" />
            <span>AIS CARRIAGE</span>
          </div>
          <div
            className={`telemetry-value font-mono text-xs ${
              isAisDark ? 'text-amber-400' : 'text-emerald-300'
            }`}
          >
            {isAisDark ? 'SILENCED (DARK)' : 'ACTIVE (SOLAS)'}
          </div>
        </div>

        <div className="telemetry-block">
          <div className="telemetry-label">
            {hasEscort ? (
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-3 h-3 text-slate-400" />
            )}
            <span>COALITION ESCORT</span>
          </div>
          <div
            className={`telemetry-value font-mono text-xs ${
              hasEscort ? 'text-emerald-400' : 'text-slate-400'
            }`}
          >
            {hasEscort ? 'CTF-153 ALLIED' : 'UNESCORTED'}
          </div>
        </div>
      </div>

      {/* Tactile Control Sectors */}
      <div className="cockpit-controls-container space-y-3">
        {/* Chokepoint Selector */}
        <div>
          <span className="control-label font-mono">MARITIME TRANSIT CORRIDOR</span>
          <div className="tactile-pill-row">
            <button
              onClick={() => {
                setZoneId('zone-bab-el-mandeb');
                audioEngine.playSonarPing();
              }}
              className={`tactile-btn ${zoneId === 'zone-bab-el-mandeb' ? 'selected' : ''}`}
            >
              BAB-EL-MANDEB
            </button>
            <button
              onClick={() => {
                setZoneId('zone-strait-of-hormuz');
                audioEngine.playSonarPing();
              }}
              className={`tactile-btn ${zoneId === 'zone-strait-of-hormuz' ? 'selected' : ''}`}
            >
              HORMUZ
            </button>
            <button
              onClick={() => {
                setZoneId('zone-black-sea-corridor');
                audioEngine.playSonarPing();
              }}
              className={`tactile-btn ${zoneId === 'zone-black-sea-corridor' ? 'selected' : ''}`}
            >
              BLACK SEA
            </button>
          </div>
        </div>

        {/* Threat Level Selector */}
        <div>
          <span className="control-label font-mono">HOSTILE RADAR &amp; KINETIC TIER</span>
          <div className="tactile-pill-row">
            <button
              onClick={() => setThreatLevel('TIER_1')}
              className={`tactile-btn tier-safe ${threatLevel === 'TIER_1' ? 'selected' : ''}`}
            >
              TIER 1 (CLEAR)
            </button>
            <button
              onClick={() => setThreatLevel('TIER_2')}
              className={`tactile-btn tier-warn ${threatLevel === 'TIER_2' ? 'selected' : ''}`}
            >
              TIER 2 (SPOOF)
            </button>
            <button
              onClick={() => {
                setThreatLevel('TIER_3');
                audioEngine.playEmergencyAlarm();
              }}
              className={`tactile-btn tier-danger ${threatLevel === 'TIER_3' ? 'selected' : ''}`}
            >
              TIER 3 (DEADLOCK)
            </button>
          </div>
        </div>

        {/* Tactical Actions Switches */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => {
              const next = !hasEscort;
              setHasEscort(next);
              if (next) audioEngine.playSuccessChime();
            }}
            className={`tactile-toggle-action ${
              hasEscort ? 'active-escort' : ''
            }`}
          >
            <span className="flex items-center justify-center gap-1.5 font-mono text-xs">
              {hasEscort && <Check className="w-3.5 h-3.5" />}
              {hasEscort ? 'CTF-153 ENGAGED' : '+ ESCORT CONVOY'}
            </span>
          </button>

          <button
            onClick={() => {
              const next = !isAisDark;
              setIsAisDark(next);
              if (next) audioEngine.playEmergencyAlarm();
            }}
            className={`tactile-toggle-action ${
              isAisDark ? 'active-dark' : 'active-ais'
            }`}
          >
            <span className="flex items-center justify-center gap-1.5 font-mono text-xs">
              {isAisDark ? '⚠ AIS SILENT' : '● AIS BROADCAST'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
