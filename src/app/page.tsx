'use client';

import React, { useState, useEffect } from 'react';
import { 
  Anchor, 
  Database, 
  Radio, 
  Volume2, 
  VolumeX, 
  Code2,
  Terminal,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Layers,
  History,
  Scale,
  Compass,
  Ship,
  Cpu
} from 'lucide-react';
import { VesselCockpit } from '@/components/VesselCockpit';
import SplineMaritimeHolo from '@/components/SplineMaritimeHolo';
import { ContradictionMatrix } from '@/components/ContradictionMatrix';
import { DecisionModal } from '@/components/DecisionModal';
import { PrecedentModal } from '@/components/PrecedentModal';
import { StatutoryCorpus } from '@/components/StatutoryCorpus';
import { GroqStudio } from '@/components/GroqStudio';
import { FleetMatrix, FLEET_VESSELS, FleetVessel } from '@/components/FleetMatrix';
import { ArchitectureBlueprint } from '@/components/ArchitectureBlueprint';
import { audioEngine } from '@/components/AudioEngine';

export default function Home() {
  const [activeNavTab, setActiveNavTab] = useState<'cockpit' | 'corpus' | 'groq' | 'fleet' | 'architecture'>('cockpit');
  const [activeVessel, setActiveVessel] = useState<FleetVessel>(FLEET_VESSELS[0]);
  const [zoneId, setZoneId] = useState('zone-bab-el-mandeb');
  const [threatLevel, setThreatLevel] = useState<'TIER_1' | 'TIER_2' | 'TIER_3'>('TIER_3');
  const [hasEscort, setHasEscort] = useState(false);
  const [isAisDark, setIsAisDark] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const [groqCustomQuery, setGroqCustomQuery] = useState<string | undefined>(undefined);
  const [arbitrationData, setArbitrationData] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPrecedent, setSelectedPrecedent] = useState<any | null>(null);
  const [showGroqDrawer, setShowGroqDrawer] = useState(false);
  const [decisionsHistory, setDecisionsHistory] = useState<any[]>([]);
  const [activeScenario, setActiveScenario] = useState('deadlock');

  // Real-time UTC Maritime Clock
  const [utcTime, setUtcTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toISOString().substring(11, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch arbitration whenever cockpit inputs change
  const fetchArbitration = async () => {
    try {
      const res = await fetch('/api/arbitration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zoneId,
          vesselName: activeVessel.name,
          imoNumber: activeVessel.imo,
          threatLevel,
          hasEscort,
          aisStatus: isAisDark ? 'DARK' : 'BROADCASTING',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setArbitrationData(data);
        if (data.arbitration.activePrecedent) {
          setDecisionsHistory(prev => {
            const exists = prev.some(p => p.decisionId === data.arbitration.activePrecedent.decisionId);
            return exists ? prev : [data.arbitration.activePrecedent, ...prev];
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchArbitration();
  }, [zoneId, threatLevel, hasEscort, isAisDark, activeVessel.name, activeVessel.imo]);

  const handleDecisionPersisted = (newDecision: any) => {
    setDecisionsHistory(prev => [newDecision, ...prev]);
    fetchArbitration();
  };

  const handleApplyPrecedentToCockpit = (precedent: any) => {
    if (precedent.transitZoneId) {
      handleZoneChange(precedent.transitZoneId);
    }
    if (precedent.adjudicatedAction === 'GO_DARK_AUTHORIZED') {
      handleAisDarkChange(true);
      handleThreatChange('TIER_3');
      handleEscortChange(true);
    } else if (precedent.adjudicatedAction === 'MAINTAIN_AIS_ESCORT') {
      handleAisDarkChange(false);
      handleEscortChange(true);
    } else if (precedent.adjudicatedAction === 'ABORT_DIVERT_CAPE') {
      handleAisDarkChange(false);
      handleEscortChange(false);
    }
  };

  const handleZoneChange = (newZoneId: string) => {
    setZoneId(newZoneId);
    const matchingVessel = FLEET_VESSELS.find(v => v.zoneId === newZoneId);
    if (matchingVessel) {
      setActiveVessel(matchingVessel);
      setThreatLevel(matchingVessel.threatLevel);
      setHasEscort(matchingVessel.hasEscort);
      setIsAisDark(matchingVessel.isAisDark);
    } else {
      setActiveVessel(prev => ({ ...prev, zoneId: newZoneId }));
    }
  };

  const handleThreatChange = (level: 'TIER_1' | 'TIER_2' | 'TIER_3') => {
    setThreatLevel(level);
    setActiveVessel(prev => ({ ...prev, threatLevel: level }));
  };

  const handleEscortChange = (val: boolean) => {
    setHasEscort(val);
    setActiveVessel(prev => ({ ...prev, hasEscort: val }));
  };

  const handleAisDarkChange = (val: boolean) => {
    setIsAisDark(val);
    setActiveVessel(prev => ({ ...prev, isAisDark: val }));
  };

  const applyScenario = (type: string) => {
    setActiveScenario(type);
    if (type === 'deadlock') {
      setActiveVessel(FLEET_VESSELS[0]);
      setZoneId('zone-bab-el-mandeb');
      setThreatLevel('TIER_3');
      setHasEscort(false);
      setIsAisDark(false);
      if (soundEnabled) audioEngine.playEmergencyAlarm();
    } else if (type === 'escorted') {
      setActiveVessel({
        ...FLEET_VESSELS[0],
        hasEscort: true,
        isAisDark: true,
        statusText: 'CTF-153 ALLIED ESCORT',
        conflictRisk: 12
      });
      setZoneId('zone-bab-el-mandeb');
      setThreatLevel('TIER_3');
      setHasEscort(true);
      setIsAisDark(true);
      if (soundEnabled) audioEngine.playSuccessChime();
    } else if (type === 'hormuz') {
      setActiveVessel(FLEET_VESSELS[1]);
      setZoneId('zone-strait-of-hormuz');
      setThreatLevel('TIER_2');
      setHasEscort(false);
      setIsAisDark(false);
      if (soundEnabled) audioEngine.playSonarPing();
    }
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audioEngine.enabled = next;
    if (next) audioEngine.playSonarPing();
  };

  const currentCoords = 
    zoneId === 'zone-strait-of-hormuz' ? '26°56\'N, 56°25\'E' :
    zoneId === 'zone-black-sea-corridor' ? '44°80\'N, 31°50\'E' : '12°35\'N, 43°20\'E';

  return (
    <main className="app-shell">
      {/* Background Ambience */}
      <div className="ambient-background" />

      {/* Ultra-Sleek Floating Tactical Command Bar */}
      <header className="top-nav-bar">
        {/* Brand Identity */}
        <div className="brand-group">
          <div className="brand-icon-box">
            <Anchor className="brand-icon-svg" />
          </div>
          <div className="brand-title-wrap">
            <span className="brand-name">NAVI-SANCTION</span>
            <span className="brand-sub-badge">SANITY CONTEXT</span>
          </div>
        </div>

        {/* Precision Telemetry Capsule with Animated EKG Wave */}
        <div className="telemetry-pill-strip">
          <div className="telemetry-live-status">
            <span className="telemetry-live-dot" />
            <span className="telemetry-label">SANITY LIVE</span>
          </div>
          <svg className="mini-ekg-svg" viewBox="0 0 44 14">
            <path className="mini-ekg-path" d="M0,7 L10,7 L13,2 L17,12 L21,4 L25,10 L28,7 L44,7" />
          </svg>
          <span className="telemetry-divider">/</span>
          <span className="telemetry-metric-val">12ms</span>
          <span className="telemetry-time-group">
            <span className="telemetry-divider">/</span>
            <span className="telemetry-time">{utcTime || 'SYNCHRONIZING...'}</span>
          </span>
        </div>

        {/* Right Nav Action Controls */}
        <div className="nav-controls">
          <button
            onClick={() => audioEngine.playSonarPing()}
            className="hud-action-btn"
            title="Fire Tactical Sonar Ping"
          >
            <Radio className="hud-btn-icon animate-pulse" />
            <span>SONAR PING</span>
          </button>

          <button
            onClick={toggleSound}
            className="hud-icon-btn"
            title={soundEnabled ? 'Mute Audio' : 'Enable Audio'}
          >
            {soundEnabled ? (
              <Volume2 className="hud-btn-icon" />
            ) : (
              <VolumeX className="hud-btn-icon muted" />
            )}
          </button>

          <button
            onClick={() => setShowGroqDrawer(!showGroqDrawer)}
            className={`hud-action-btn ${showGroqDrawer ? 'active' : ''}`}
            title="Inspect Sanity Content Lake GROQ AST"
          >
            <Code2 className="hud-btn-icon" />
            <span>GROQ AST</span>
          </button>
        </div>
      </header>

      {/* Primary Enterprise Module Navigation Tabs */}
      <nav className="nav-tabs-bar">
        <button
          onClick={() => { setActiveNavTab('cockpit'); audioEngine.playSonarPing(); }}
          className={`nav-tab-btn ${activeNavTab === 'cockpit' ? 'active' : ''}`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>TACTICAL COCKPIT</span>
        </button>

        <button
          onClick={() => { setActiveNavTab('corpus'); audioEngine.playSonarPing(); }}
          className={`nav-tab-btn ${activeNavTab === 'corpus' ? 'active' : ''}`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>STATUTORY CORPUS</span>
        </button>

        <button
          onClick={() => { setActiveNavTab('groq'); audioEngine.playSonarPing(); }}
          className={`nav-tab-btn ${activeNavTab === 'groq' ? 'active' : ''}`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>GROQ STUDIO</span>
        </button>

        <button
          onClick={() => { setActiveNavTab('fleet'); audioEngine.playSonarPing(); }}
          className={`nav-tab-btn ${activeNavTab === 'fleet' ? 'active' : ''}`}
        >
          <Ship className="w-3.5 h-3.5" />
          <span>FLEET MATRIX (3)</span>
        </button>

        <button
          onClick={() => { setActiveNavTab('architecture'); audioEngine.playSonarPing(); }}
          className={`nav-tab-btn ${activeNavTab === 'architecture' ? 'active' : ''}`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>ARCHITECTURE</span>
        </button>
      </nav>

      {/* VIEW 1: Tactical Cockpit */}
      {activeNavTab === 'cockpit' && (
        <>
          {/* Preset Tactical Scenarios Filter Bar */}
          <div className="preset-bar">
            <span className="preset-title font-mono">SCENARIO:</span>
            <div className="preset-chips-scroll">
              <button
                onClick={() => applyScenario('deadlock')}
                className={`preset-chip ${activeScenario === 'deadlock' ? 'active-deadlock' : ''}`}
              >
                <span className="dot-indicator red" />
                <span>1. BAB-EL-MANDEB DEADLOCK (TIER 3)</span>
              </button>
              <button
                onClick={() => applyScenario('escorted')}
                className={`preset-chip ${activeScenario === 'escorted' ? 'active-escorted' : ''}`}
              >
                <span className="dot-indicator green" />
                <span>2. ALLIED CONVOY (CTF-153 SAFE)</span>
              </button>
              <button
                onClick={() => applyScenario('hormuz')}
                className={`preset-chip ${activeScenario === 'hormuz' ? 'active-hormuz' : ''}`}
              >
                <span className="dot-indicator amber" />
                <span>3. HORMUZ SPOOFING (TIER 2)</span>
              </button>
            </div>
          </div>

          {/* 3-Column Production Cockpit Grid */}
          <div className="cockpit-main-layout">
            {/* Left Column: Vessel Navigation Cockpit */}
            <VesselCockpit
              vessel={activeVessel}
              zoneId={zoneId}
              setZoneId={handleZoneChange}
              threatLevel={threatLevel}
              setThreatLevel={handleThreatChange}
              hasEscort={hasEscort}
              setHasEscort={handleEscortChange}
              isAisDark={isAisDark}
              setIsAisDark={handleAisDarkChange}
            />

            {/* Center Column: 3D Holographic Visualizer (Spline & Three.js WebGL in Zed Green) */}
            <div className="center-stage-container">
              <SplineMaritimeHolo
                threatLevel={threatLevel}
                isAisDark={isAisDark}
                hasEscort={hasEscort}
                zoneName={arbitrationData?.zone?.name || 'Bab-el-Mandeb'}
                coordinates={currentCoords}
              />
            </div>

            {/* Right Column: Statutory Contradiction Matrix & Risk Dial */}
            <ContradictionMatrix
              arbitration={arbitrationData?.arbitration}
              threatLevel={threatLevel}
              onOpenAdjudication={() => setIsModalOpen(true)}
            />
          </div>
        </>
      )}

      {/* VIEW 2: Statutory Corpus & Treaties Explorer */}
      {activeNavTab === 'corpus' && (
        <StatutoryCorpus 
          onSelectClause={() => {}}
          onOpenGroqStudio={(query) => {
            setGroqCustomQuery(query);
            setActiveNavTab('groq');
            if (soundEnabled) audioEngine.playSuccessChime();
          }}
          onApplyClauseToCockpit={(clause) => {
            setActiveNavTab('cockpit');
            if (clause.mandateType === 'TACTICAL_AIS_OFF') {
              handleAisDarkChange(true);
            } else if (clause.mandateType === 'MANDATORY_AIS_ON') {
              handleAisDarkChange(false);
            }
          }}
        />
      )}

      {/* VIEW 3: Sanity Content Lake GROQ Query Studio */}
      {activeNavTab === 'groq' && (
        <GroqStudio initialQuery={groqCustomQuery} />
      )}

      {/* VIEW 4: Fleet Chokepoint Matrix */}
      {activeNavTab === 'fleet' && (
        <FleetMatrix
          onSelectVessel={(v) => {
            setActiveVessel(v);
            setZoneId(v.zoneId);
            setThreatLevel(v.threatLevel);
            setHasEscort(v.hasEscort);
            setIsAisDark(v.isAisDark);
            setActiveNavTab('cockpit');
            if (soundEnabled) audioEngine.playSuccessChime();
          }}
        />
      )}

      {/* VIEW 5: System Architecture & Blueprint */}
      {activeNavTab === 'architecture' && (
        <ArchitectureBlueprint />
      )}

      {/* Bottom Interactive Sanity Precedent Ledger Ribbon */}
      <footer className="sanity-precedent-ribbon">
        <div className="ribbon-brand font-mono">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>SANITY CONTENT LAKE MUTATION LEDGER</span>
          <span className="ribbon-count font-mono">{decisionsHistory.length} PRECEDENTS</span>
          <button
            onClick={() => {
              setIsModalOpen(true);
              audioEngine.playSonarPing();
            }}
            className="ribbon-mutate-quick-btn font-mono"
            title="Adjudicate & Persist New Legal Precedent into Sanity Content Lake"
          >
            + NEW ADJUDICATION
          </button>
        </div>

        <div className="ribbon-precedent-list font-mono">
          {decisionsHistory.length === 0 ? (
            <span className="text-slate-500 text-xs italic">
              No mutated precedents recorded for this corridor. Click &ldquo;+ NEW ADJUDICATION&rdquo; to persist closed-loop decision.
            </span>
          ) : (
            decisionsHistory.map((item, idx) => (
              <button
                key={item.decisionId || idx}
                onClick={() => {
                  setSelectedPrecedent(item);
                  audioEngine.playSonarPing();
                }}
                className="precedent-pill font-mono"
                title="Click to inspect cryptographic Sanity Content Lake audit record"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-bold text-emerald-300">{item.decisionId}</span>
                <span className="text-slate-500">:</span>
                <span className="text-emerald-400 font-semibold">{item.adjudicatedAction}</span>
                <span className="precedent-inspect-tag">AUDIT ↗</span>
              </button>
            ))
          )}
        </div>
      </footer>

      {/* Collapsible GROQ AST Query Drawer */}
      {showGroqDrawer && (
        <div className="groq-drawer-panel font-mono">
          <div className="groq-drawer-header">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-emerald-300">REAL-TIME SANITY CONTEXT MCP GROQ QUERY</h4>
            </div>
            <button
              onClick={() => setShowGroqDrawer(false)}
              className="text-slate-400 hover:text-white text-xs"
            >
              ✕ CLOSE
            </button>
          </div>
          <pre className="groq-drawer-code">
            {arbitrationData?.groqTrace || '// Evaluating Sanity Content Lake...'}
          </pre>
        </div>
      )}

      {/* Adjudication Mutation Modal */}
      <DecisionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        zoneId={zoneId}
        onDecisionPersisted={handleDecisionPersisted}
      />

      {/* Precedent Audit Inspector Modal */}
      <PrecedentModal
        isOpen={!!selectedPrecedent}
        onClose={() => setSelectedPrecedent(null)}
        precedent={selectedPrecedent}
        onApplyToCockpit={handleApplyPrecedentToCockpit}
      />
    </main>
  );
}
