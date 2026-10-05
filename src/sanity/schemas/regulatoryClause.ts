export const regulatoryClause = {
  name: 'regulatoryClause',
  title: 'Regulatory Clause',
  type: 'document',
  fields: [
    {
      name: 'clauseNumber',
      title: 'Clause Number / Section Code',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'title',
      title: 'Clause Header',
      type: 'string',
    },
    {
      name: 'source',
      title: 'Parent Treaty / Advisory',
      type: 'reference',
      to: [{ type: 'treatySource' }],
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'verbatimText',
      title: 'Exact Legal Verbatim Text',
      type: 'text',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'mandateType',
      title: 'Mandate Directives',
      type: 'string',
      options: {
        list: [
          { title: 'Mandatory Continuous AIS Broadcast', value: 'MANDATORY_AIS_ON' },
          { title: 'Emergency Tactical AIS Deactivation (Go Dark)', value: 'TACTICAL_AIS_OFF' },
          { title: 'Warranty Breach & Coverage Voiding', value: 'WARRANTY_VOID' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'penaltyCategory',
      title: 'Penalty Severity If Violated',
      type: 'string',
      options: {
        list: [
          { title: 'Flag State Criminal Prosecution & Master License Revocation', value: 'CRIMINAL_FLAG_STATE' },
          { title: 'Catastrophic Drone/Missile Strike & Loss of Life', value: 'CATASTROPHIC_STRIKE' },
          { title: '$65M+ Hull & Machinery Claim Repudiation', value: 'INSURANCE_REPUDIATION' },
        ],
      },
    },
    {
      name: 'statutoryExemptionTrigger',
      title: 'Exemption Condition (If Any)',
      type: 'text',
    },
  ],
};
