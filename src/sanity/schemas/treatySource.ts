export const treatySource = {
  name: 'treatySource',
  title: 'Treaty & Regulatory Source',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Treaty / Advisory Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'identifier',
      title: 'Official Identifier (e.g. IMO-SOLAS-V19)',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'authority',
      title: 'Governing Authority',
      type: 'string',
      options: {
        list: [
          { title: 'International Maritime Organization (IMO)', value: 'IMO' },
          { title: 'United Kingdom Maritime Trade Operations (UKMTO)', value: 'UKMTO' },
          { title: 'Lloyds Joint War Committee (JWC)', value: 'LLOYDS_JWC' },
          { title: 'BIMCO International', value: 'BIMCO' },
          { title: 'Flag State Administration', value: 'FLAG_STATE' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'legalHierarchy',
      title: 'Legal Hierarchy Level',
      type: 'string',
      options: {
        list: [
          { title: 'Tier 1: Statutory International Treaty (Criminal/Flag State)', value: 'STATUTORY_TREATY' },
          { title: 'Tier 2: Tactical Life-Safety Advisory (Hostile Threat)', value: 'TACTICAL_ADVISORY' },
          { title: 'Tier 3: Commercial & Insurance Warranty (H&M Coverage)', value: 'INSURANCE_WARRANTY' },
        ],
      },
    },
    {
      name: 'effectiveDate',
      title: 'Effective / Published Date',
      type: 'date',
    },
    {
      name: 'summary',
      title: 'Core Mandate Summary',
      type: 'text',
    },
  ],
};
