export const transitZone = {
  name: 'transitZone',
  title: 'Maritime Transit & Threat Zone',
  type: 'document',
  fields: [
    {
      name: 'zoneName',
      title: 'Zone Identifier / Strait Name',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'coordinates',
      title: 'Center Coordinates (Lat/Long)',
      type: 'string',
    },
    {
      name: 'jwcDesignation',
      title: 'Lloyds JWC War Risk Listed Area Code',
      type: 'string',
    },
    {
      name: 'threatLevel',
      title: 'Current Active Threat Level',
      type: 'string',
      options: {
        list: [
          { title: 'Level 1: Heightened Vigilance', value: 'TIER_1' },
          { title: 'Level 2: Electronic Spoofing & Boarding Risk', value: 'TIER_2' },
          { title: 'Level 3: Active Drone / Missile Swarm Threat', value: 'TIER_3' },
        ],
      },
    },
    {
      name: 'activeApplicableTreaties',
      title: 'Applicable Treaties & Directives',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'treatySource' }] }],
    },
  ],
};
