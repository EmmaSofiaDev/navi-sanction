export const adjudicatedDecision = {
  name: 'adjudicatedDecision',
  title: 'Adjudicated Compliance Decision',
  type: 'document',
  fields: [
    {
      name: 'decisionId',
      title: 'Unique Adjudication Code',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'vesselName',
      title: 'Target Vessel Name',
      type: 'string',
    },
    {
      name: 'imoNumber',
      title: 'IMO Vessel Identification',
      type: 'string',
    },
    {
      name: 'transitZone',
      title: 'Transit Zone',
      type: 'reference',
      to: [{ type: 'transitZone' }],
    },
    {
      name: 'contradictionSignature',
      title: 'Resolved Contradiction Signature',
      type: 'string',
    },
    {
      name: 'adjudicatedAction',
      title: 'Executed Operational Action',
      type: 'string',
      options: {
        list: [
          { title: 'Authorized Tactical AIS Deactivation (Go Dark)', value: 'GO_DARK_AUTHORIZED' },
          { title: 'Maintain Continuous AIS Broadcast Under Naval Escort', value: 'MAINTAIN_AIS_ESCORT' },
          { title: 'Immediate Route Abort: Divert Around Cape of Good Hope', value: 'ABORT_DIVERT_CAPE' },
        ],
      },
    },
    {
      name: 'statutoryDefenseClause',
      title: 'Legal Statutory Defense Cited',
      type: 'string',
    },
    {
      name: 'insuranceWarrantyWaiverCode',
      title: 'Lloyds JWC Underwriter Concurrence Code',
      type: 'string',
    },
    {
      name: 'authorizingDirector',
      title: 'Authorizing Maritime Security Director',
      type: 'string',
    },
    {
      name: 'digitalSignatureHash',
      title: 'Cryptographic SHA-256 Audit Signature',
      type: 'string',
    },
    {
      name: 'adjudicatedAt',
      title: 'Timestamp of Decision Persistence',
      type: 'datetime',
    },
    {
      name: 'carriesAcrossFutureBuilds',
      title: 'Carries Across Future Agent Runs & Fleet Queries',
      type: 'boolean',
      initialValue: true,
    },
    {
      name: 'rationale',
      title: 'Executive Legal & Safety Rationale',
      type: 'text',
    },
  ],
};
