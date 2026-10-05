'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  X, 
  Lock, 
  Fingerprint, 
  CheckCircle, 
  Cpu, 
  Database
} from 'lucide-react';
import { audioEngine } from './AudioEngine';

interface DecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  zoneId: string;
  onDecisionPersisted: (decision: any) => void;
}

export const DecisionModal: React.FC<DecisionModalProps> = ({
  isOpen,
  onClose,
  zoneId,
  onDecisionPersisted,
}) => {
  const [action, setAction] = useState<'GO_DARK_AUTHORIZED' | 'MAINTAIN_AIS_ESCORT' | 'ABORT_DIVERT_CAPE'>('GO_DARK_AUTHORIZED');
  const [director, setDirector] = useState('Capt. Henrik Lindqvist (Global Security Director)');
  const [defenseClause, setDefenseClause] = useState('SOLAS Regulation XI-2/8 (Master Overriding Authority for Life Preservation)');
  const [waiverCode, setWaiverCode] = useState('LLOYDS-EMERGENCY-WAIVER-CTF153-902');
  const [rationale, setRationale] = useState('Active drone targeting lock confirmed. Master override executed in concurrence with pre-cleared CTF-153 tactical dark transit protocol.');
  const [loading, setLoading] = useState(false);
  const [persistedResult, setPersistedResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transitZoneId: zoneId,
          vesselName: 'MV Nordic Sentinel',
          imoNumber: 'IMO-9845210',
          adjudicatedAction: action,
          statutoryDefenseClause: defenseClause,
          insuranceWarrantyWaiverCode: waiverCode,
          authorizingDirector: director,
          rationale,
        }),
      });

      const data = await res.json();
      if (data.success) {
        audioEngine.playSuccessChime();
        setPersistedResult(data);
        onDecisionPersisted(data.decision);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="director-modal-backdrop">
      <div className="director-modal-card">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="modal-close-btn"
          aria-label="Close Adjudication Console"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="modal-header-section">
          <div className="modal-header-icon-box">
            <Lock className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="modal-title font-mono">
              SECURITY DIRECTOR ADJUDICATION CONSOLE
            </h3>
            <p className="modal-subtitle font-mono">
              Sanity Content Lake Mutation &amp; Persistent Decision Authority
            </p>
          </div>
        </div>

        {persistedResult ? (
          /* Success Screen */
          <div className="modal-success-screen font-mono">
            <div className="modal-success-banner">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <h4 className="modal-success-title">MUTATION COMMITTED TO SANITY CONTENT LAKE</h4>
                <p className="modal-success-desc">
                  Precedent logged. All future agent builds and fleet queries will inherit this adjudication.
                </p>
              </div>
            </div>

            <div className="modal-audit-card">
              <div className="modal-stat-line">
                <span className="text-slate-400">Sanity Document ID:</span>
                <span className="text-emerald-400 font-bold">{persistedResult.decision._id}</span>
              </div>
              <div className="modal-stat-line">
                <span className="text-slate-400">Target Action:</span>
                <span className="text-amber-400 font-bold">{persistedResult.decision.adjudicatedAction}</span>
              </div>
              <div className="modal-stat-signature">
                <span className="modal-signature-label">SHA-256 Audit Signature:</span>
                <span className="modal-signature-hash font-mono">
                  {persistedResult.decision.digitalSignatureHash}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="modal-btn-return font-mono"
            >
              RETURN TO TACTICAL COCKPIT
            </button>
          </div>
        ) : (
          /* Input Form */
          <form onSubmit={handleSubmit} className="modal-form font-mono">
            <div className="modal-field-group">
              <label className="modal-field-label">
                ADJUDICATED OPERATIONAL ACTION
              </label>
              <select
                value={action}
                onChange={(e: any) => setAction(e.target.value)}
                className="modal-select-field font-mono"
              >
                <option value="GO_DARK_AUTHORIZED">
                  GO_DARK_AUTHORIZED: Execute Tactical AIS Deactivation under SOLAS XI-2/8
                </option>
                <option value="MAINTAIN_AIS_ESCORT">
                  MAINTAIN_AIS_ESCORT: Maintain Broadcast Under CTF-153 Escort
                </option>
                <option value="ABORT_DIVERT_CAPE">
                  ABORT_DIVERT_CAPE: Abort Red Sea Transit — Divert Around Cape of Good Hope
                </option>
              </select>
            </div>

            <div className="modal-field-row">
              <div className="modal-field-group">
                <label className="modal-field-label">
                  STATUTORY DEFENSE
                </label>
                <input
                  type="text"
                  value={defenseClause}
                  onChange={(e) => setDefenseClause(e.target.value)}
                  className="modal-input-field font-mono"
                />
              </div>

              <div className="modal-field-group">
                <label className="modal-field-label">
                  LLOYD&apos;S WAIVER CODE
                </label>
                <input
                  type="text"
                  value={waiverCode}
                  onChange={(e) => setWaiverCode(e.target.value)}
                  className="modal-input-field font-mono"
                />
              </div>
            </div>

            <div className="modal-field-group">
              <label className="modal-field-label">
                AUTHORIZING DIRECTOR
              </label>
              <input
                type="text"
                value={director}
                onChange={(e) => setDirector(e.target.value)}
                className="modal-input-field font-mono"
              />
            </div>

            <div className="modal-field-group">
              <label className="modal-field-label">
                LEGAL &amp; SAFETY RATIONALE
              </label>
              <textarea
                rows={2}
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                className="modal-textarea-field font-mono"
              />
            </div>

            <div className="modal-actions-row">
              <button
                type="button"
                onClick={onClose}
                className="modal-btn-cancel font-mono"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={loading}
                className="modal-btn-commit font-mono"
              >
                {loading ? (
                  <>
                    <Cpu className="w-3.5 h-3.5 animate-spin" />
                    MUTATING SANITY...
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-3.5 h-3.5" />
                    SIGN &amp; COMMIT MUTATION
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
