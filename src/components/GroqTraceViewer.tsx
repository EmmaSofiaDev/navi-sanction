'use client';

import React, { useState } from 'react';
import { Terminal, Copy, Check, ExternalLink, Code } from 'lucide-react';

interface GroqTraceViewerProps {
  groqQuery: string;
  arbitrationData: any;
}

export const GroqTraceViewer: React.FC<GroqTraceViewerProps> = ({
  groqQuery,
  arbitrationData,
}) => {
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<'GROQ' | 'MCP_JSON'>('GROQ');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-950/90 rounded-xl p-4 border border-slate-800 font-mono text-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-200">
            SANITY CONTEXT MCP ENGINE & GROQ TRACE
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
            LATENCY: 18ms
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-md overflow-hidden border border-slate-800">
            <button
              onClick={() => setTab('GROQ')}
              className={`px-3 py-1 text-[11px] ${
                tab === 'GROQ' ? 'bg-cyan-500 text-black font-bold' : 'bg-slate-900 text-slate-400'
              }`}
            >
              GROQ QUERY
            </button>
            <button
              onClick={() => setTab('MCP_JSON')}
              className={`px-3 py-1 text-[11px] ${
                tab === 'MCP_JSON' ? 'bg-cyan-500 text-black font-bold' : 'bg-slate-900 text-slate-400'
              }`}
            >
              RAW MCP PAYLOAD
            </button>
          </div>

          <button
            onClick={() =>
              copyToClipboard(
                tab === 'GROQ' ? groqQuery : JSON.stringify(arbitrationData, null, 2)
              )
            }
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Copy snippet"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="bg-black/70 rounded-lg p-3 overflow-x-auto max-h-64 border border-slate-900">
        <pre className="text-cyan-300/90 text-[11px] leading-relaxed">
          {tab === 'GROQ' ? groqQuery : JSON.stringify(arbitrationData, null, 2)}
        </pre>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
        <span>Target Sanity Lake: `navi-sanction-live` [production]</span>
        <span className="text-cyan-400 flex items-center gap-1">
          <Code className="w-3.5 h-3.5" /> Context MCP Endpoint: `/v2026-03-01/context/mcp`
        </span>
      </div>
    </div>
  );
};
