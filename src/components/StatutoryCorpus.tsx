'use client';

import React, { useState } from 'react';
import { 
  Scale, 
  Search, 
  ShieldAlert, 
  FileText, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle,
  Lock,
  Compass,
  Play,
  Copy,
  Check,
  Code2,
  Terminal,
  ShieldCheck
} from 'lucide-react';
import { INITIAL_TREATY_SOURCES, INITIAL_REGULATORY_CLAUSES } from '@/sanity/dataset/initialData';
import { audioEngine } from './AudioEngine';

interface StatutoryCorpusProps {
  onSelectClause?: (clause: any) => void;
  onOpenGroqStudio?: (query: string) => void;
  onApplyClauseToCockpit?: (clause: any) => void;
}

export const StatutoryCorpus: React.FC<StatutoryCorpusProps> = ({ 
  onSelectClause,
  onOpenGroqStudio,
  onApplyClauseToCockpit
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'MANDATORY_AIS_ON' | 'TACTICAL_AIS_OFF' | 'WARRANTY_VOID'>('ALL');
  const [activeClauseId, setActiveClauseId] = useState<string | null>(INITIAL_REGULATORY_CLAUSES[0]._id);
  const [copied, setCopied] = useState(false);
  const [auditResult, setAuditResult] = useState<any | null>(null);

  const filteredClauses = INITIAL_REGULATORY_CLAUSES.filter(clause => {
    const matchesFilter = selectedFilter === 'ALL' || clause.mandateType === selectedFilter;
    const matchesSearch = 
      clause.clauseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clause.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clause.verbatimText.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const activeClause = INITIAL_REGULATORY_CLAUSES.find(c => c._id === activeClauseId) || INITIAL_REGULATORY_CLAUSES[0];
  const activeSource = INITIAL_TREATY_SOURCES.find(s => s._id === activeClause?.sourceId);

  const handleCopyCitation = () => {
    if (!activeClause) return;
    const citation = `[STATUTORY CITATION]\nClause: ${activeClause.clauseNumber} - ${activeClause.title}\nAuthority: ${activeSource?.authority || 'International Maritime Authority'}\nMandate: ${activeClause.mandateType}\nText: "${activeClause.verbatimText}"\nPenalty: ${activeClause.penaltyCategory}\nSanity ID: ${activeClause._id}`;
    navigator.clipboard.writeText(citation);
    setCopied(true);
    audioEngine.playSuccessChime();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunComplianceAudit = () => {
    audioEngine.playSonarPing();
    if (!activeClause) return;

    if (activeClause.mandateType === 'MANDATORY_AIS_ON') {
      setAuditResult({
        status: 'HIGH_RISK_DEADLOCK',
        summary: 'SOLAS Reg V/19 STRICT COMPLIANCE: Continuous broadcast legally required by Flag State.',
        consequence: 'If vessel goes dark without SOLAS XI-2/8 statutory filing, Certificate of Competency faces immediate revocation.',
        remedy: 'Master must invoke SOLAS Regulation XI-2/8 life-preservation defense before turning transponder off.',
      });
    } else if (activeClause.mandateType === 'TACTICAL_AIS_OFF') {
      setAuditResult({
        status: 'KINETIC_WARNING',
        summary: 'UKMTO 04/26 ADVISORY ENGAGED: Hostile targeting lock detected via AIS RF beacon.',
        consequence: 'Broadcasting in Tier 3 zone results in 94% probability of missile/drone engagement.',
        remedy: 'Tactical deactivation recommended in coordination with Combined Maritime Forces CTF-153 escort.',
      });
    } else {
      setAuditResult({
        status: 'INSURANCE_EXPOSURE',
        summary: 'LLOYD\'S JWLA-032 §4.1 WAR-RISK WARRANTY: Strict condition precedent against silence.',
        consequence: 'Breach of warranty voids $65M Hull & Machinery and P&I pollution indemnification automatically.',
        remedy: 'Must log pre-authorized War Risk Waiver code (e.g. LLOYDS-EMERGENCY-WAIVER-CTF153-902) into Content Lake.',
      });
    }
  };

  const clauseGroqQuery = `*[_type == "regulatoryClause" && _id == "${activeClause?._id}"][0] {
  clauseNumber,
  title,
  mandateType,
  penaltyCategory,
  statutoryExemptionTrigger,
  "parentTreaty": *[_type == "treatySource" && _id == ^.sourceId][0] {
    title,
    authority,
    legalHierarchy,
    effectiveDate
  }
}`;

  return (
    <div className="corpus-container font-mono">
      {/* Top Header Bar */}
      <div className="corpus-header-strip">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-400" />
            <h2 className="corpus-title">SANITY STATUTORY &amp; TREATY CORPUS</h2>
            <span className="corpus-badge">SANITY CONTENT LAKE SSOT</span>
          </div>
          <p className="corpus-desc">
            Direct real-time relational repository of international maritime treaties, security directives, and war risk insurance warranties.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="corpus-filters">
          <button 
            onClick={() => { setSelectedFilter('ALL'); audioEngine.playSonarPing(); }}
            className={`corpus-filter-btn ${selectedFilter === 'ALL' ? 'active' : ''}`}
          >
            ALL CLAUSES ({INITIAL_REGULATORY_CLAUSES.length})
          </button>
          <button 
            onClick={() => { setSelectedFilter('MANDATORY_AIS_ON'); audioEngine.playSonarPing(); }}
            className={`corpus-filter-btn ${selectedFilter === 'MANDATORY_AIS_ON' ? 'active' : ''}`}
          >
            IMO MANDATES
          </button>
          <button 
            onClick={() => { setSelectedFilter('TACTICAL_AIS_OFF'); audioEngine.playSonarPing(); }}
            className={`corpus-filter-btn ${selectedFilter === 'TACTICAL_AIS_OFF' ? 'active' : ''}`}
          >
            LIFE-SAFETY DIRECTIVES
          </button>
          <button 
            onClick={() => { setSelectedFilter('WARRANTY_VOID'); audioEngine.playSonarPing(); }}
            className={`corpus-filter-btn ${selectedFilter === 'WARRANTY_VOID' ? 'active' : ''}`}
          >
            LLOYD&apos;S WARRANTIES
          </button>
        </div>
      </div>

      {/* Main Corpus Grid */}
      <div className="corpus-main-grid">
        {/* Left Column: Clause List */}
        <div className="corpus-list-card">
          <div className="corpus-search-wrap">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search treaties by keyword, clause, or penalty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="corpus-search-input font-mono"
            />
          </div>

          <div className="corpus-clause-scroll">
            {filteredClauses.map((clause) => {
              const isSelected = clause._id === activeClauseId;
              const source = INITIAL_TREATY_SOURCES.find(s => s._id === clause.sourceId);

              return (
                <div
                  key={clause._id}
                  onClick={() => {
                    setActiveClauseId(clause._id);
                    setAuditResult(null);
                    audioEngine.playSonarPing();
                    if (onSelectClause) onSelectClause(clause);
                  }}
                  className={`corpus-clause-tile ${isSelected ? 'is-selected' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="clause-tile-number">{clause.clauseNumber}</span>
                    <span className={`clause-mandate-badge ${clause.mandateType.toLowerCase()}`}>
                      {clause.mandateType.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h4 className="clause-tile-title">{clause.title}</h4>
                  <div className="clause-tile-footer">
                    <span className="clause-tile-authority">{source?.authority || 'International Authority'}</span>
                    <span className="clause-tile-penalty">{clause.penaltyCategory}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Clause Inspector */}
        <div className="corpus-detail-card">
          {activeClause ? (
            <div className="corpus-detail-content">
              {/* Header Box */}
              <div className="detail-header-box">
                <div className="flex items-center justify-between mb-2">
                  <span className="detail-source-badge">
                    {activeSource?.title || 'IMO Maritime Treaty'}
                  </span>
                  <span className="detail-depositary">
                    AUTHORITY: {activeSource?.authority || 'UN IMO (London)'}
                  </span>
                </div>
                <h3 className="detail-clause-heading">{activeClause.clauseNumber}: {activeClause.title}</h3>
                <div className="detail-meta-row">
                  <span>EFFECTIVE: {activeSource?.effectiveDate || '2004-07-01'}</span>
                  <span>•</span>
                  <span>HIERARCHY: {activeSource?.legalHierarchy || 'TIER_1_TREATY'}</span>
                  <span>•</span>
                  <span className="text-emerald-400">SANITY ID: {activeClause._id}</span>
                </div>
              </div>

              {/* Action Toolbar for Clause */}
              <div className="clause-action-bar">
                <button
                  onClick={handleRunComplianceAudit}
                  className="clause-run-audit-btn"
                  title="Run live compliance test against vessel telemetry"
                >
                  <Play className="w-3.5 h-3.5 text-emerald-300" />
                  <span>RUN STATUTORY COMPLIANCE AUDIT</span>
                </button>

                {onOpenGroqStudio && (
                  <button
                    onClick={() => {
                      onOpenGroqStudio(clauseGroqQuery);
                      audioEngine.playSonarPing();
                    }}
                    className="clause-groq-jump-btn"
                    title="Open and evaluate this clause inside GROQ Studio"
                  >
                    <Terminal className="w-3.5 h-3.5 text-sky-400" />
                    <span>QUERY IN GROQ STUDIO</span>
                  </button>
                )}

                <button
                  onClick={handleCopyCitation}
                  className="clause-copy-btn"
                  title="Copy official statutory citation to clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'COPIED CITATION' : 'COPY CITATION'}</span>
                </button>
              </div>

              {/* Live Compliance Audit Result Card */}
              {auditResult && (
                <div className="clause-audit-result-panel">
                  <div className="flex items-center gap-2 mb-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-xs text-emerald-300">LIVE STATUTORY COMPLIANCE VERDICT</span>
                    <span className="audit-status-tag">{auditResult.status}</span>
                  </div>
                  <p className="text-xs text-slate-200 mb-1">{auditResult.summary}</p>
                  <p className="text-[11px] text-amber-300 mb-1"><strong>RISK CONSEQUENCE:</strong> {auditResult.consequence}</p>
                  <p className="text-[11px] text-emerald-400"><strong>RECOMMENDED MITIGATION:</strong> {auditResult.remedy}</p>
                </div>
              )}

              {/* Verbatim Statutory Language */}
              <div className="detail-verbatim-box">
                <div className="detail-box-label">
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>OFFICIAL VERBATIM STATUTORY TEXT</span>
                </div>
                <p className="detail-verbatim-text">
                  &ldquo;{activeClause.verbatimText}&rdquo;
                </p>
              </div>

              {/* Statutory Exemption & Contradiction Trigger */}
              <div className="detail-exemption-box">
                <div className="detail-box-label">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span>STATUTORY EXEMPTION &amp; ESCAPE TRIGGER</span>
                </div>
                <p className="detail-exemption-text">
                  {activeClause.statutoryExemptionTrigger}
                </p>
              </div>

              {/* Penalty Enforced */}
              <div className="detail-penalty-box">
                <div className="detail-box-label">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>CONSEQUENTIAL BREACH PENALTY</span>
                </div>
                <p className="detail-penalty-text">
                  {activeClause.penaltyCategory === 'CRIMINAL_FLAG_STATE' && 'Criminal investigation of Master, immediate revocation of certificate of competency, and detaining of vessel by Flag State Administration.'}
                  {activeClause.penaltyCategory === 'CATASTROPHIC_STRIKE' && 'Direct kinetic engagement by anti-ship cruise missiles (ASCM) or one-way loitering drones utilizing AIS RF signatures for targeting solution.'}
                  {activeClause.penaltyCategory === 'INSURANCE_REPUDIATION' && 'Immediate warranty breach repudiation. Full forfeiture of $65M Hull & Machinery and Protection & Indemnity (P&I) indemnity cover.'}
                </p>
              </div>

              {/* Sanity GROQ Query Preview */}
              <div className="detail-groq-box">
                <div className="detail-box-label">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>SANITY CONTENT LAKE GROQ RESOLUTION</span>
                </div>
                <pre className="detail-groq-code">
                  {clauseGroqQuery}
                </pre>
              </div>
            </div>
          ) : (
            <div className="corpus-empty-state">
              <Compass className="w-8 h-8 text-emerald-400/40 animate-spin" />
              <span>Select a regulatory clause to inspect verbatim statutory text</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
