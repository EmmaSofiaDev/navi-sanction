'use client';

import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Play, 
  Database, 
  Layers, 
  Copy, 
  Check, 
  Clock, 
  Code2, 
  FileCode2,
  Sparkles,
  Search
} from 'lucide-react';
import { sanityClient } from '@/sanity/client';
import { audioEngine } from './AudioEngine';

interface GroqStudioProps {
  initialQuery?: string;
}

const PRESET_QUERIES = [
  {
    id: 'zones-threat',
    title: '1. Active Transit Zones & Kinetic Threat Tiers',
    query: `*[_type == "transitZone"] {
  _id,
  zoneName,
  threatLevel,
  jwcDesignation,
  coordinates,
  applicableTreatyIds
}`,
  },
  {
    id: 'trilateral-join',
    title: '2. Tri-lateral Contradiction Multi-Hop Join',
    query: `*[_type == "transitZone" && _id == "zone-bab-el-mandeb"][0] {
  zoneName,
  threatLevel,
  "contradictoryClauses": *[_type == "regulatoryClause" && sourceId in ^.applicableTreatyIds] {
    clauseNumber,
    mandateType,
    penaltyCategory,
    title,
    statutoryExemptionTrigger
  }
}`,
  },
  {
    id: 'precedents-ledger',
    title: '3. Real-Time Precedent Mutations Ledger',
    query: `*[_type == "adjudicatedDecision"] | order(adjudicatedAt desc) {
  decisionId,
  vesselName,
  adjudicatedAction,
  statutoryDefenseClause,
  insuranceWarrantyWaiverCode,
  authorizingDirector,
  digitalSignatureHash
}`,
  },
  {
    id: 'solas-mandates',
    title: '4. International Treaties & Regulatory Clauses',
    query: `*[_type == "regulatoryClause"] {
  clauseNumber,
  title,
  mandateType,
  penaltyCategory,
  "source": *[_type == "treatySource" && _id == ^.sourceId][0] {
    title,
    authority,
    depositaryCountry
  }
}`,
  },
];

export const GroqStudio: React.FC<GroqStudioProps> = ({ initialQuery }) => {
  const [activeQuery, setActiveQuery] = useState(initialQuery || PRESET_QUERIES[1].query);
  const [queryResult, setQueryResult] = useState<string>('// Evaluating Sanity Content Lake...');
  const [isExecuting, setIsExecuting] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'schemas'>('editor');

  const executeQuery = async (queryToRun?: string) => {
    const q = queryToRun || activeQuery;
    setIsExecuting(true);
    audioEngine.playSonarPing();
    const startTime = performance.now();

    try {
      const res = await sanityClient.fetch<any>(q);
      const endTime = performance.now();
      const elapsed = Math.max(3, Math.round(endTime - startTime));
      setLatencyMs(elapsed);
      setQueryResult(JSON.stringify(res, null, 2));
    } catch (err: any) {
      setQueryResult(JSON.stringify({ error: err?.message || 'Failed to evaluate GROQ query' }, null, 2));
    } finally {
      setIsExecuting(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      setActiveQuery(initialQuery);
      executeQuery(initialQuery);
    } else {
      executeQuery(PRESET_QUERIES[1].query);
    }
  }, [initialQuery]);

  const handleCopy = () => {
    navigator.clipboard.writeText(queryResult);
    setCopied(true);
    audioEngine.playSuccessChime();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="groq-studio-container font-mono">
      {/* Studio Header */}
      <div className="groq-studio-header">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <h2 className="groq-studio-title">SANITY CONTENT LAKE GROQ STUDIO</h2>
            <span className="groq-live-badge">INTERACTIVE WORKBENCH</span>
          </div>
          <p className="groq-studio-desc">
            Directly test, execute, and inspect live GROQ graph queries against the Navi-Sanction Sanity Content Lake.
          </p>
        </div>

        {/* Studio View Selector */}
        <div className="groq-tab-switch">
          <button
            onClick={() => setActiveTab('editor')}
            className={`groq-switch-btn ${activeTab === 'editor' ? 'active' : ''}`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>GROQ IDE</span>
          </button>
          <button
            onClick={() => setActiveTab('schemas')}
            className={`groq-switch-btn ${activeTab === 'schemas' ? 'active' : ''}`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>SANITY SCHEMAS (4)</span>
          </button>
        </div>
      </div>

      {activeTab === 'editor' ? (
        <div className="groq-studio-layout">
          {/* Left Column: Preset Templates & Query Editor */}
          <div className="groq-editor-card">
            {/* Presets List */}
            <div className="groq-preset-strip">
              <span className="groq-strip-label">PRESET GROQ TEMPLATES (CLICK TO RUN):</span>
              <div className="groq-preset-chips">
                {PRESET_QUERIES.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setActiveQuery(preset.query);
                      executeQuery(preset.query);
                    }}
                    className={`groq-preset-btn ${activeQuery === preset.query ? 'active-preset' : ''}`}
                  >
                    {preset.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Code Input Box */}
            <div className="groq-input-wrap">
              <div className="groq-editor-toolbar">
                <span className="text-[11px] text-slate-400 font-bold uppercase">GROQ QUERY INPUT</span>
                <button
                  onClick={() => executeQuery()}
                  disabled={isExecuting}
                  className="groq-execute-btn"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isExecuting ? 'EVALUATING...' : 'EXECUTE GROQ'}</span>
                </button>
              </div>
              <textarea
                value={activeQuery}
                onChange={(e) => setActiveQuery(e.target.value)}
                className="groq-textarea font-mono"
                rows={12}
                spellCheck={false}
              />
            </div>
          </div>

          {/* Right Column: JSON Output Terminal */}
          <div className="groq-output-card">
            <div className="groq-output-toolbar">
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-emerald-400 font-bold uppercase">CONTENT LAKE RESPONSE</span>
                {latencyMs !== null && (
                  <span className="groq-latency-tag">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    <span>LATENCY: {latencyMs}ms</span>
                  </span>
                )}
              </div>
              <button
                onClick={handleCopy}
                className="groq-copy-btn"
                title="Copy JSON Payload"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copied ? 'COPIED' : 'COPY JSON'}</span>
              </button>
            </div>
            <pre className="groq-output-pre">
              {queryResult}
            </pre>
          </div>
        </div>
      ) : (
        /* Schemas Viewer Tab */
        <div className="groq-schemas-grid">
          <div className="schema-card">
            <div className="schema-header">
              <span className="schema-type-tag">DOCUMENT TYPE</span>
              <span className="text-xs text-slate-400">schema/transitZone.ts</span>
            </div>
            <h4 className="schema-title">transitZone</h4>
            <p className="schema-desc">Defines chokepoint spatial polygons, threat tiers, and references to active international treaties.</p>
            <pre className="schema-code">
{`defineType({
  name: 'transitZone',
  title: 'Maritime Transit Zone',
  type: 'document',
  fields: [
    defineField({ name: 'zoneName', type: 'string' }),
    defineField({ name: 'threatLevel', type: 'string' }),
    defineField({ name: 'coordinates', type: 'string' }),
    defineField({ name: 'applicableTreaties', type: 'array', of: [{ type: 'reference', to: [{ type: 'treatySource' }] }] })
  ]
})`}
            </pre>
          </div>

          <div className="schema-card">
            <div className="schema-header">
              <span className="schema-type-tag">DOCUMENT TYPE</span>
              <span className="text-xs text-slate-400">schema/treatySource.ts</span>
            </div>
            <h4 className="schema-title">treatySource</h4>
            <p className="schema-desc">Stores authoritative treaties, legal hierarchy levels, and official depositary sovereigns.</p>
            <pre className="schema-code">
{`defineType({
  name: 'treatySource',
  title: 'Treaty Source Authority',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string' }),
    defineField({ name: 'authority', type: 'string' }),
    defineField({ name: 'legalHierarchy', type: 'string' })
  ]
})`}
            </pre>
          </div>

          <div className="schema-card">
            <div className="schema-header">
              <span className="schema-type-tag">DOCUMENT TYPE</span>
              <span className="text-xs text-slate-400">schema/regulatoryClause.ts</span>
            </div>
            <h4 className="schema-title">regulatoryClause</h4>
            <p className="schema-desc">Verbatim statutory mandates, exemption triggers, and consequential breach penalties.</p>
            <pre className="schema-code">
{`defineType({
  name: 'regulatoryClause',
  title: 'Regulatory Clause',
  type: 'document',
  fields: [
    defineField({ name: 'clauseNumber', type: 'string' }),
    defineField({ name: 'mandateType', type: 'string' }),
    defineField({ name: 'verbatimText', type: 'text' }),
    defineField({ name: 'statutoryExemptionTrigger', type: 'text' })
  ]
})`}
            </pre>
          </div>

          <div className="schema-card">
            <div className="schema-header">
              <span className="schema-type-tag">DOCUMENT TYPE</span>
              <span className="text-xs text-slate-400">schema/adjudicatedDecision.ts</span>
            </div>
            <h4 className="schema-title">adjudicatedDecision</h4>
            <p className="schema-desc">Immutable closed-loop precedents with ECDSA SHA-256 cryptographic hashes.</p>
            <pre className="schema-code">
{`defineType({
  name: 'adjudicatedDecision',
  title: 'Adjudicated Precedent',
  type: 'document',
  fields: [
    defineField({ name: 'decisionId', type: 'string' }),
    defineField({ name: 'vesselName', type: 'string' }),
    defineField({ name: 'digitalSignatureHash', type: 'string' }),
    defineField({ name: 'carriesAcrossFutureBuilds', type: 'boolean' })
  ]
})`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
