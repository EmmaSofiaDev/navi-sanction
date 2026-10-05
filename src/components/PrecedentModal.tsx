'use client';

import React from 'react';
import { 
  ShieldCheck, 
  X, 
  Database, 
  FileText, 
  Download, 
  Fingerprint, 
  Scale, 
  Compass 
} from 'lucide-react';
import { audioEngine } from './AudioEngine';

interface PrecedentModalProps {
  isOpen: boolean;
  onClose: () => void;
  precedent: any | null;
  onApplyToCockpit?: (precedent: any) => void;
}

export const PrecedentModal: React.FC<PrecedentModalProps> = ({
  isOpen,
  onClose,
  precedent,
  onApplyToCockpit,
}) => {
  if (!isOpen || !precedent) return null;

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(precedent, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${precedent.decisionId || 'precedent'}_sanity_audit.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    audioEngine.playSuccessChime();
  };

  const handleApply = () => {
    if (onApplyToCockpit) {
      onApplyToCockpit(precedent);
    }
    audioEngine.playSonarPing();
    onClose();
  };

  return (
    <div className="director-modal-backdrop" onClick={onClose}>
      <div className="director-modal-card precedent-modal-card" onClick={e => e.stopPropagation()}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="modal-close-btn"
          aria-label="Close Precedent Inspector"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="modal-header-section">
          <div className="modal-header-icon-box">
            <Database className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="modal-title font-mono">
                SANITY CONTENT LAKE MUTATION AUDIT
              </h3>
              <span className="audit-sealed-badge font-mono">IMMUTABLE PRECEDENT</span>
            </div>
            <p className="modal-subtitle font-mono">
              Binding Closed-Loop Decision Persisted in Sanity Content Lake
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="precedent-modal-body font-mono">
          {/* Top Key Metric Bar */}
          <div className="audit-metric-grid">
            <div className="audit-metric-tile">
              <span className="audit-label">PRECEDENT DECISION ID</span>
              <span className="audit-val-highlight">{precedent.decisionId}</span>
            </div>
            <div className="audit-metric-tile">
              <span className="audit-label">ADJUDICATED ACTION</span>
              <span className="audit-val-action">{precedent.adjudicatedAction}</span>
            </div>
            <div className="audit-metric-tile">
              <span className="audit-label">GOVERNING VESSEL</span>
              <span className="audit-val">{precedent.vesselName || 'MV Nordic Sentinel'} ({precedent.imoNumber || 'IMO-9845210'})</span>
            </div>
            <div className="audit-metric-tile">
              <span className="audit-label">TRANSIT CORRIDOR</span>
              <span className="audit-val text-emerald-400">
                {precedent.transitZoneId === 'zone-strait-of-hormuz' ? 'Strait of Hormuz' : 
                 precedent.transitZoneId === 'zone-black-sea-corridor' ? 'Black Sea Maritime Corridor' : 'Bab-el-Mandeb Strait'}
              </span>
            </div>
          </div>

          {/* Legal Authority & Statutory Exemption Clauses */}
          <div className="audit-section-box">
            <div className="audit-section-title">
              <Scale className="w-3.5 h-3.5 text-emerald-400" />
              <span>STATUTORY LEGAL BASES &amp; INSURANCE RIDERS</span>
            </div>
            <div className="audit-clause-item">
              <span className="audit-clause-tag">SOLAS EXEMPTION:</span>
              <p className="audit-clause-text">
                {precedent.statutoryDefenseClause || 'SOLAS Regulation XI-2/8 (Master Overriding Authority for Human Life Preservation)'}
              </p>
            </div>
            <div className="audit-clause-item">
              <span className="audit-clause-tag">LLOYD&apos;S WAR RISK WAIVER:</span>
              <p className="audit-clause-text text-amber-300">
                {precedent.insuranceWarrantyWaiverCode || 'LLOYDS-EMERGENCY-WAIVER-CTF153-902'}
              </p>
            </div>
            <div className="audit-clause-item">
              <span className="audit-clause-tag">AUTHORIZING DIRECTOR:</span>
              <p className="audit-clause-text text-slate-300">
                {precedent.authorizingDirector || 'Capt. Henrik Lindqvist (Global Maritime Security Director)'}
              </p>
            </div>
          </div>

          {/* Operational Rationale */}
          {precedent.rationale && (
            <div className="audit-section-box">
              <div className="audit-section-title">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>DIRECTOR OPERATIONAL RATIONALE</span>
              </div>
              <p className="audit-rationale-text">{precedent.rationale}</p>
            </div>
          )}

          {/* GROQ Content Lake Trace */}
          <div className="audit-section-box">
            <div className="audit-section-title">
              <Fingerprint className="w-3.5 h-3.5 text-emerald-400" />
              <span>CONTENT LAKE REAL-TIME GROQ TRACE &amp; SHA-256 INTEGRITY</span>
            </div>
            <pre className="audit-groq-block">
{`*[_type == "adjudicatedDecision" && decisionId == "${precedent.decisionId}"][0] {
  adjudicatedAction: "${precedent.adjudicatedAction}",
  transitZone: "${precedent.transitZoneId}",
  statutoryDefenseClause: "${precedent.statutoryDefenseClause ? precedent.statutoryDefenseClause.substring(0, 35) + '...' : ''}",
  insuranceWarrantyWaiverCode: "${precedent.insuranceWarrantyWaiverCode}",
  digitalSignatureHash: "${precedent.digitalSignatureHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}"
}`}
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="precedent-modal-actions">
          <button
            onClick={handleApply}
            className="audit-apply-btn"
            title="Sync Cockpit inputs with this Precedent"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>APPLY TO COCKPIT</span>
          </button>

          <button
            onClick={handleDownloadJSON}
            className="audit-download-btn"
            title="Download cryptographic audit proof as JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT AUDIT (.JSON)</span>
          </button>

          <button
            onClick={onClose}
            className="audit-close-btn"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
