'use client';

import React, { useState } from 'react';
import { 
  Ship, 
  Compass, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Radio, 
  Navigation,
  ChevronRight,
  Filter,
  Flag,
  RadioTower,
  CheckCircle2
} from 'lucide-react';
import { audioEngine } from './AudioEngine';

export interface FleetVessel {
  id: string;
  name: string;
  imo: string;
  type: string;
  flag: string;
  zoneId: string;
  zoneName: string;
  coordinates: string;
  sog: string;
  hdg: string;
  threatLevel: 'TIER_1' | 'TIER_2' | 'TIER_3';
  hasEscort: boolean;
  isAisDark: boolean;
  conflictRisk: number;
  statusText: string;
  legalParadox: string;
  activePrecedent: string | null;
}

export const FLEET_VESSELS: FleetVessel[] = [
  {
    id: 'vessel-01',
    name: 'MV Nordic Sentinel',
    imo: 'IMO-9845210',
    type: 'Ultra-Large Container Vessel (14,000 TEU)',
    flag: 'Marshall Islands (RMI)',
    zoneId: 'zone-bab-el-mandeb',
    zoneName: 'Bab-el-Mandeb Strait (Gate of Tears)',
    coordinates: '12°35\'N, 43°20\'E',
    sog: '18.4',
    hdg: '328°',
    threatLevel: 'TIER_3',
    hasEscort: false,
    isAisDark: false,
    conflictRisk: 94,
    statusText: 'CRITICAL DEADLOCK',
    legalParadox: 'IMO SOLAS Mandatory AIS vs UKMTO Kinetic Drone Advisory vs Lloyd\'s $65M Warranty.',
    activePrecedent: null,
  },
  {
    id: 'vessel-02',
    name: 'MT Pacific Opal',
    imo: 'IMO-9721455',
    type: 'VLCC Crude Oil Carrier (310,000 DWT)',
    flag: 'Liberia (LIB)',
    zoneId: 'zone-strait-of-hormuz',
    zoneName: 'Strait of Hormuz (Chokepoint Alpha)',
    coordinates: '26°56\'N, 56°25\'E',
    sog: '14.2',
    hdg: '115°',
    threatLevel: 'TIER_2',
    hasEscort: false,
    isAisDark: false,
    conflictRisk: 58,
    statusText: 'ELECTRONIC SPOOFING',
    legalParadox: 'Hostile GNSS/AIS coordinate manipulation detected. Sovereign detention risk elevated.',
    activePrecedent: 'ADJ-2026-HOR-012',
  },
  {
    id: 'vessel-03',
    name: 'MV Odesa Star',
    imo: 'IMO-9418302',
    type: 'Handysize Bulk Carrier (38,000 DWT)',
    flag: 'Panama (PAN)',
    zoneId: 'zone-black-sea-corridor',
    zoneName: 'Black Sea Maritime Grain Corridor',
    coordinates: '44°80\'N, 31°50\'E',
    sog: '11.8',
    hdg: '210°',
    threatLevel: 'TIER_3',
    hasEscort: true,
    isAisDark: true,
    conflictRisk: 18,
    statusText: 'ADJUDICATED SAFE',
    legalParadox: 'Precedent ADJ-2026-MUT-8350 verified. CTF-153 Escort protocol authorizes Tactical Darkness.',
    activePrecedent: 'ADJ-2026-MUT-8350',
  },
];

interface FleetMatrixProps {
  onSelectVessel: (vessel: FleetVessel) => void;
}

export const FleetMatrix: React.FC<FleetMatrixProps> = ({ onSelectVessel }) => {
  const [filter, setFilter] = useState<'ALL' | 'DEADLOCK' | 'SPOOFING' | 'SAFE'>('ALL');
  const [broadcastActive, setBroadcastActive] = useState(false);

  const filteredVessels = FLEET_VESSELS.filter(v => {
    if (filter === 'DEADLOCK') return v.statusText === 'CRITICAL DEADLOCK';
    if (filter === 'SPOOFING') return v.statusText === 'ELECTRONIC SPOOFING';
    if (filter === 'SAFE') return v.statusText === 'ADJUDICATED SAFE';
    return true;
  });

  const handleBroadcastAlert = () => {
    setBroadcastActive(true);
    audioEngine.playEmergencyAlarm();
    setTimeout(() => {
      setBroadcastActive(false);
    }, 4000);
  };

  return (
    <div className="fleet-container font-mono">
      {/* Fleet Header */}
      <div className="fleet-header-strip">
        <div>
          <div className="flex items-center gap-2">
            <Ship className="w-5 h-5 text-emerald-400" />
            <h2 className="fleet-title">GLOBAL FLEET CHOKEPOINT SURVEILLANCE</h2>
            <span className="fleet-count-badge">3 ACTIVE CORRIDOR VESSELS</span>
          </div>
          <p className="fleet-desc">
            Autonomous multi-vessel statutory monitoring across high-risk maritime chokepoints with live legal risk scores.
          </p>
        </div>

        {/* Fleet Operational Action */}
        <button
          onClick={handleBroadcastAlert}
          className={`fleet-broadcast-btn ${broadcastActive ? 'active-broadcast' : ''}`}
          title="Transmit fleet-wide SOLAS / UKMTO contradiction advisory"
        >
          <RadioTower className={`w-3.5 h-3.5 ${broadcastActive ? 'animate-ping' : ''}`} />
          <span>{broadcastActive ? 'BROADCASTING WARNING...' : 'TRANSMIT FLEET ADVISORY'}</span>
        </button>
      </div>

      {/* Broadcast Alert Banner */}
      {broadcastActive && (
        <div className="fleet-broadcast-banner">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-bounce" />
          <div className="text-xs">
            <span className="font-bold text-rose-300">GLOBAL FLEET DIRECTIVE BROADCAST:</span>
            <span className="text-slate-200 ml-1.5">
              Urgent statutory advisory dispatched to all 3 vessels. Bab-el-Mandeb deadlocks require Security Director Adjudication.
            </span>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="fleet-filters-strip">
        <span className="text-slate-500 text-xs flex items-center gap-1">
          <Filter className="w-3 h-3" />
          <span>CORRIDOR FILTER:</span>
        </span>
        <button
          onClick={() => { setFilter('ALL'); audioEngine.playSonarPing(); }}
          className={`fleet-filter-btn ${filter === 'ALL' ? 'active' : ''}`}
        >
          ALL FLEET ({FLEET_VESSELS.length})
        </button>
        <button
          onClick={() => { setFilter('DEADLOCK'); audioEngine.playSonarPing(); }}
          className={`fleet-filter-btn ${filter === 'DEADLOCK' ? 'active' : ''}`}
        >
          DEADLOCK CRISIS (1)
        </button>
        <button
          onClick={() => { setFilter('SPOOFING'); audioEngine.playSonarPing(); }}
          className={`fleet-filter-btn ${filter === 'SPOOFING' ? 'active' : ''}`}
        >
          GPS SPOOFING (1)
        </button>
        <button
          onClick={() => { setFilter('SAFE'); audioEngine.playSonarPing(); }}
          className={`fleet-filter-btn ${filter === 'SAFE' ? 'active' : ''}`}
        >
          ALLIED SAFE (1)
        </button>
      </div>

      {/* 3-Column Fleet Vessel Cards Grid */}
      <div className="fleet-cards-grid">
        {filteredVessels.map((vessel) => {
          const isDeadlock = vessel.conflictRisk > 75;
          const isWarning = vessel.conflictRisk > 40 && vessel.conflictRisk <= 75;

          return (
            <div 
              key={vessel.id} 
              className={`fleet-vessel-card ${isDeadlock ? 'is-deadlock' : isWarning ? 'is-warning' : 'is-safe'}`}
            >
              {/* Vessel Header */}
              <div className="vessel-card-header">
                <div>
                  <span className="vessel-imo">{vessel.imo}</span>
                  <h3 className="vessel-name">{vessel.name}</h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                    <Flag className="w-3 h-3 text-emerald-400" />
                    <span>{vessel.flag}</span>
                  </div>
                </div>

                {/* Conflict Risk Dial Gauge Badge */}
                <div className={`vessel-risk-dial ${isDeadlock ? 'dial-danger' : isWarning ? 'dial-warn' : 'dial-safe'}`}>
                  <span className="risk-num">{vessel.conflictRisk}%</span>
                  <span className="risk-lbl">CONFLICT</span>
                </div>
              </div>

              {/* Vessel Specs */}
              <div className="vessel-meta-strip">
                <span className="text-[11px] text-slate-300 font-semibold">{vessel.type}</span>
              </div>

              {/* Transit Zone & Coordinates */}
              <div className="vessel-zone-box">
                <div className="zone-label-row">
                  <Navigation className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400 font-bold text-xs">{vessel.zoneName}</span>
                </div>
                <div className="telemetry-coord-line">
                  <span>FIX: {vessel.coordinates}</span>
                  <span>•</span>
                  <span>SOG: {vessel.sog} KTS</span>
                  <span>•</span>
                  <span>HDG: {vessel.hdg}</span>
                </div>
              </div>

              {/* Statutory State Callout */}
              <div className="vessel-status-box">
                <div className="vessel-status-badge">
                  {isDeadlock ? (
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  ) : isWarning ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  <span>{vessel.statusText}</span>
                </div>
                <p className="vessel-paradox-desc">{vessel.legalParadox}</p>
              </div>

              {/* Card Actions */}
              <button
                onClick={() => {
                  onSelectVessel(vessel);
                  audioEngine.playSonarPing();
                }}
                className="vessel-engage-btn font-mono"
              >
                <span>ENGAGE IN TACTICAL COCKPIT</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
