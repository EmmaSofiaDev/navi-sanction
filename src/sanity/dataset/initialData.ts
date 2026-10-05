export interface TreatySourceData {
  _id: string;
  _type: 'treatySource';
  identifier: string;
  title: string;
  authority: string;
  legalHierarchy: string;
  effectiveDate: string;
  summary: string;
}

export interface RegulatoryClauseData {
  _id: string;
  _type: 'regulatoryClause';
  clauseNumber: string;
  title: string;
  sourceId: string;
  verbatimText: string;
  mandateType: 'MANDATORY_AIS_ON' | 'TACTICAL_AIS_OFF' | 'WARRANTY_VOID';
  penaltyCategory: string;
  statutoryExemptionTrigger: string;
}

export interface TransitZoneData {
  _id: string;
  _type: 'transitZone';
  zoneName: string;
  coordinates: string;
  jwcDesignation: string;
  threatLevel: 'TIER_1' | 'TIER_2' | 'TIER_3';
  applicableTreatyIds: string[];
}

export interface AdjudicatedDecisionData {
  _id: string;
  _type: 'adjudicatedDecision';
  decisionId: string;
  vesselName: string;
  imoNumber: string;
  transitZoneId: string;
  contradictionSignature: string;
  adjudicatedAction: 'GO_DARK_AUTHORIZED' | 'MAINTAIN_AIS_ESCORT' | 'ABORT_DIVERT_CAPE';
  statutoryDefenseClause: string;
  insuranceWarrantyWaiverCode: string;
  authorizingDirector: string;
  digitalSignatureHash: string;
  adjudicatedAt: string;
  carriesAcrossFutureBuilds: boolean;
  rationale: string;
}

export const INITIAL_TREATY_SOURCES: TreatySourceData[] = [
  {
    _id: 'source-solas-v19',
    _type: 'treatySource',
    identifier: 'IMO-SOLAS-V19',
    title: 'International Convention for the Safety of Life at Sea (Chapter V, Reg 19)',
    authority: 'IMO',
    legalHierarchy: 'STATUTORY_TREATY',
    effectiveDate: '2004-07-01',
    summary: 'Codified treaty law obligating all international commercial vessels >= 300 GT to maintain continuous AIS broadcasting for collision avoidance.',
  },
  {
    _id: 'source-ukmto-advisory',
    _type: 'treatySource',
    identifier: 'UKMTO-WAR-2026-04',
    title: 'UKMTO Emergency Red Sea & Bab-el-Mandeb Tactical Anti-Drone Advisory',
    authority: 'UKMTO',
    legalHierarchy: 'TACTICAL_ADVISORY',
    effectiveDate: '2026-08-14',
    summary: 'Joint naval advisory recommending commercial merchant vessels deactivate AIS transmitters 20 nautical miles prior to high-risk drone strike coordinates.',
  },
  {
    _id: 'source-lloyds-jwla032',
    _type: 'treatySource',
    identifier: 'JWC-JWLA-032',
    title: 'Lloyds Joint War Committee Listed Areas Hull & Machinery Warranty Clause 032',
    authority: 'LLOYDS_JWC',
    legalHierarchy: 'INSURANCE_WARRANTY',
    effectiveDate: '2026-01-01',
    summary: 'Strict underwriter maritime insurance warranty stipulating instant forfeiture of war-risk and hull coverage if tracking instruments are switched off without verified naval escort.',
  },
];

export const INITIAL_REGULATORY_CLAUSES: RegulatoryClauseData[] = [
  {
    _id: 'clause-solas-v19-24',
    _type: 'regulatoryClause',
    clauseNumber: 'SOLAS V/19.2.4',
    title: 'Continuous Operational Carriage Requirement for Shipborne AIS',
    sourceId: 'source-solas-v19',
    verbatimText: 'All ships of 300 gross tonnage and upwards engaged on international voyages shall maintain AIS in continuous operation at all times, except where international agreements, rules or standards provide for the protection of navigational information.',
    mandateType: 'MANDATORY_AIS_ON',
    penaltyCategory: 'CRIMINAL_FLAG_STATE',
    statutoryExemptionTrigger: 'Master personal determination of imminent security attack under SOLAS Regulation XI-2/8.',
  },
  {
    _id: 'clause-ukmto-04-dark',
    _type: 'regulatoryClause',
    clauseNumber: 'UKMTO Bulletin 04/26 §3.2',
    title: 'Electronic Signature Minimization in Active Drone Threat Quadrants',
    sourceId: 'source-ukmto-advisory',
    verbatimText: 'Due to weaponized commercial telemetry acquisition by hostile regional actors, Masters transiting between 12°00N and 14°30N are strongly advised to extinguish AIS broadcasts to eliminate surface RF targeting solutions.',
    mandateType: 'TACTICAL_AIS_OFF',
    penaltyCategory: 'CATASTROPHIC_STRIKE',
    statutoryExemptionTrigger: 'Vessel enters recognized active kinetic drone/missile engagement grid.',
  },
  {
    _id: 'clause-jwc-warranty-41',
    _type: 'regulatoryClause',
    clauseNumber: 'JWC JWLA-032 Clause 4.1(b)',
    title: 'Breach of War Risk Navigational Tracking Warranty',
    sourceId: 'source-lloyds-jwla032',
    verbatimText: 'Warranted that the insured vessel shall not intentionally disable, silence, or tamper with its Automatic Identification System within any Listed Area unless operating under direct tactical command of an allied naval force (CTF-153 or EUNAVFOR). Breach immediately voids Hull, Machinery, and Loss of Hire indemnity.',
    mandateType: 'WARRANTY_VOID',
    penaltyCategory: 'INSURANCE_REPUDIATION',
    statutoryExemptionTrigger: 'Verified concurrent escort code from Commander Task Force 153 registered with underwriters prior to transit.',
  },
];

export const INITIAL_TRANSIT_ZONES: TransitZoneData[] = [
  {
    _id: 'zone-bab-el-mandeb',
    _type: 'transitZone',
    zoneName: 'Bab-el-Mandeb Strait (Gate of Tears)',
    coordinates: '12.5852° N, 43.3328° E',
    jwcDesignation: 'JWLA-032 Southern Red Sea',
    threatLevel: 'TIER_3',
    applicableTreatyIds: ['source-solas-v19', 'source-ukmto-advisory', 'source-lloyds-jwla032'],
  },
  {
    _id: 'zone-strait-of-hormuz',
    _type: 'transitZone',
    zoneName: 'Strait of Hormuz (Chokepoint Alpha)',
    coordinates: '26.5667° N, 56.2500° E',
    jwcDesignation: 'JWLA-032 Persian Gulf & Approaches',
    threatLevel: 'TIER_2',
    applicableTreatyIds: ['source-solas-v19', 'source-lloyds-jwla032'],
  },
  {
    _id: 'zone-black-sea-corridor',
    _type: 'transitZone',
    zoneName: 'Black Sea Maritime Grain Corridor',
    coordinates: '44.8000° N, 31.5000° E',
    jwcDesignation: 'JWLA-030 Black Sea / Sea of Azov',
    threatLevel: 'TIER_3',
    applicableTreatyIds: ['source-solas-v19', 'source-lloyds-jwla032'],
  },
];

export const INITIAL_ADJUDICATED_DECISIONS: AdjudicatedDecisionData[] = [
  {
    _id: 'decision-sample-01',
    _type: 'adjudicatedDecision',
    decisionId: 'ADJ-2026-BAB-084',
    vesselName: 'MV Nordic Sentinel',
    imoNumber: 'IMO-9845210',
    transitZoneId: 'zone-bab-el-mandeb',
    contradictionSignature: 'SOLAS_V19_VS_UKMTO_VS_LLOYDS_JWLA032',
    adjudicatedAction: 'GO_DARK_AUTHORIZED',
    statutoryDefenseClause: 'SOLAS Regulation XI-2/8 (Master Overriding Authority for Human Life Preservation)',
    insuranceWarrantyWaiverCode: 'LLOYDS-EMERGENCY-WAIVER-CTF153-902',
    authorizingDirector: 'Capt. Henrik Lindqvist (Global Maritime Security Director)',
    digitalSignatureHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    adjudicatedAt: '2026-09-28T03:14:22Z',
    carriesAcrossFutureBuilds: true,
    rationale: 'Active telemetry confirmed hostile drone targeting radar illuminated within 12nm. SOLAS Master override executed concurrently with pre-cleared CTF-153 tactical dark transit protocol. Lloyd’s underwriter emergency rider logged.',
  },
];
