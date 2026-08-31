// Field structure derived directly from The_Corporate_Supplier_Questionnaire_2026.xlsx
// (sheet "Supplier Assessment 2026"). Door 1's wizard and Door 2's parser both read
// this file as their single source of truth. If the workbook changes, regenerate
// this schema and the parser together — see CLAUDE.md Business Rules.
//
// Per-field "esrsRef" and "type" are carried straight from the workbook's
// ESRS REF and TYPE columns. Dropdown "options" are carried from the workbook's
// data-validation lists. Units are taken from the question text where the
// workbook specifies them.

export const YES_NO = ['Yes', 'No']

export const SECTIONS = [
  {
    id: 'S1',
    title: 'General Information & EcoVadis Bypass',
    esrs: 'All ESRS',
    fields: [
      {
        id: 's1_legal_name',
        esrsRef: '—',
        type: 'text',
        label: 'Legal name and registered country of the responding entity.',
        required: true,
      },
      {
        id: 's1_contact',
        esrsRef: '—',
        type: 'text',
        label: 'Primary contact name, title, and email address for this assessment.',
        required: true,
      },
      {
        id: 's1_ecovadis_bypass',
        esrsRef: 'Bypass',
        type: 'dropdown',
        label:
          'Do you hold a valid EcoVadis Sustainability Scorecard (issued within the last 12 months)? If YES: attach scorecard link in the Notes column and proceed directly to the Status column. Sections S2–S7 are not required.',
        options: ['Yes — Scorecard Attached', 'No — Will Complete Questionnaire'],
        required: true,
      },
      {
        id: 's1_ecovadis_link',
        esrsRef: '—',
        type: 'text',
        label: 'EcoVadis Scorecard Link (if applicable). Paste URL or attach document reference.',
        required: false,
        conditional: { field: 's1_ecovadis_bypass', equals: 'Yes — Scorecard Attached', required: true },
      },
    ],
  },
  {
    id: 'S2',
    title: 'Climate & Decarbonisation',
    esrs: 'ESRS E1',
    fields: [
      {
        id: 's2_scope1',
        esrsRef: 'E1-4',
        type: 'number',
        unit: 'metric tonnes CO₂e',
        label: 'Total Scope 1 emissions for last fiscal year (metric tonnes CO₂e). Include verification method.',
        required: true,
      },
      {
        id: 's2_scope2',
        esrsRef: 'E1-4',
        type: 'number',
        unit: 'metric tonnes CO₂e, market-based',
        label: 'Total Scope 2 emissions for last fiscal year — market-based (metric tonnes CO₂e).',
        required: true,
      },
      {
        id: 's2_scope3',
        esrsRef: 'E1-4',
        type: 'number',
        unit: 'metric tonnes CO₂e',
        label: 'Total Scope 3 emissions for last fiscal year (metric tonnes CO₂e). Specify categories included.',
        required: true,
      },
      {
        id: 's2_sbti',
        esrsRef: 'E1-3',
        type: 'dropdown',
        label: 'Does your organisation have a Science-Based Target (SBTi) validated decarbonisation target?',
        options: YES_NO,
        required: true,
      },
      {
        id: 's2_projects',
        esrsRef: 'E1-2',
        type: 'textarea',
        label:
          'Describe your top three decarbonisation projects currently in progress or planned for the next 24 months. Include estimated tCO₂e reduction and the specific technology being utilised (e.g., electrification of heat, on-site renewables).',
        required: true,
      },
      {
        id: 's2_barriers',
        esrsRef: 'E1-2',
        type: 'textarea',
        label:
          'What are the primary technical or financial barriers preventing you from reaching a 50% reduction in Scope 1 and 2 emissions by 2030?',
        required: true,
      },
    ],
  },
  {
    id: 'S3',
    title: 'Pollution & PFAS',
    esrs: 'ESRS E2',
    fields: [
      {
        id: 's3_substances',
        esrsRef: 'E2-3',
        type: 'number',
        unit: 'kg',
        label: 'Total weight of substances of concern (REACH, SVHC list) used in production last fiscal year (kg).',
        required: true,
      },
      {
        id: 's3_pfas',
        esrsRef: 'E2-3',
        type: 'dropdown',
        label: 'Do any of your products or production processes contain or utilise PFAS compounds ("Forever Chemicals")?',
        options: YES_NO,
        required: true,
        flag: { equals: 'Yes', note: 'Triggers PFAS Risk review' },
      },
      {
        id: 's3_pfas_roadmap',
        esrsRef: 'E2-3',
        type: 'textarea',
        label:
          'If your products contain PFAS, detail your substitution roadmap. Have you identified viable non-PFAS alternatives? Provide your target date for a complete phase-out.',
        required: true,
      },
      {
        id: 's3_wastewater',
        esrsRef: 'E2-2',
        type: 'textarea',
        label:
          'Describe your industrial wastewater treatment process. What specific measures are in place to ensure zero leakage of hazardous chemicals into local water systems?',
        required: true,
      },
    ],
  },
  {
    id: 'S4',
    title: 'Water & Marine Resources',
    esrs: 'ESRS E3',
    fields: [
      {
        id: 's4_withdrawal',
        esrsRef: 'E3-1',
        type: 'number',
        unit: 'm³',
        label: 'Total water withdrawal last fiscal year (m³). Specify source (municipal, groundwater, surface).',
        required: true,
      },
      {
        id: 's4_stress',
        esrsRef: 'E3-1',
        type: 'dropdown',
        label: 'Is your primary production facility located in a high-water-stress region (WRI Aqueduct score ≥3)?',
        options: YES_NO,
        required: true,
      },
      {
        id: 's4_recycling',
        esrsRef: 'E3-2',
        type: 'textarea',
        label:
          'Provide details on any water-saving or closed-loop recycling projects implemented at your facility. How has your total water intensity (litres per unit produced) changed over the last three years?',
        required: true,
      },
      {
        id: 's4_contingency',
        esrsRef: 'E3-2',
        type: 'textarea',
        label:
          'If your facility is in a high-water-stress region, what is your operational contingency plan for severe drought conditions to ensure supply continuity to The Corporate?',
        required: true,
      },
    ],
  },
  {
    id: 'S5',
    title: 'Circular Economy & Waste',
    esrs: 'ESRS E5',
    fields: [
      {
        id: 's5_waste',
        esrsRef: 'E5-2',
        type: 'number',
        unit: 'tonnes',
        label: 'Total waste generated last fiscal year (tonnes). Breakdown: landfill / recycled / energy recovery / hazardous.',
        required: true,
      },
      {
        id: 's5_pcr',
        esrsRef: 'E5-4',
        type: 'number',
        unit: '%',
        label: 'Percentage of post-consumer recycled (PCR) content in the components supplied to The Corporate (%).',
        required: true,
      },
      {
        id: 's5_circularity',
        esrsRef: 'E5-3',
        type: 'textarea',
        label:
          'How are you incorporating circularity into the specific components you supply to The Corporate? Examples: design for disassembly, modularity, or increasing PCR content.',
        required: true,
      },
      {
        id: 's5_zero_waste',
        esrsRef: 'E5-2',
        type: 'textarea',
        label:
          'Detail your strategy for achieving Zero Waste to Landfill. What are your primary waste streams, and what innovative recycling or upcycling initiatives have you launched recently?',
        required: true,
      },
    ],
  },
  {
    id: 'S6',
    title: 'Biodiversity & Ecosystems',
    esrs: 'ESRS E4',
    fields: [
      {
        id: 's6_protected_area',
        esrsRef: 'E4-2',
        type: 'dropdown',
        label: 'Are any of your production sites located within or adjacent to (within 1 km) a protected area or biodiversity hotspot?',
        options: YES_NO,
        required: true,
      },
      {
        id: 's6_initiatives',
        esrsRef: 'E4-3',
        type: 'textarea',
        label:
          'Describe any initiatives taken to minimise the impact of your operations on local biodiversity. Include land-use management, native planting schemes, or light/noise pollution reduction.',
        required: true,
      },
      {
        id: 's6_assessment',
        esrsRef: 'E4-5',
        type: 'textarea',
        label:
          'Have you undertaken a biodiversity impact assessment (TNFD or equivalent) for your primary production sites? If yes, share key findings. If no, provide your target assessment date.',
        required: true,
      },
    ],
  },
  {
    id: 'S7',
    title: 'Social, Labour & Governance',
    esrs: 'ESRS S2 · G1',
    fields: [
      {
        id: 's7_human_rights_policy',
        esrsRef: 'S2-1',
        type: 'dropdown',
        label:
          'Does your organisation have a formal Human Rights and Labour Rights Policy, aligned with the UN Guiding Principles on Business and Human Rights?',
        options: YES_NO,
        required: true,
      },
      {
        id: 's7_due_diligence',
        esrsRef: 'S2-2',
        type: 'dropdown',
        label: 'Have you conducted a human rights due diligence assessment of your Tier 1 and Tier 2 supply chains in the last 24 months?',
        options: YES_NO,
        required: true,
      },
      {
        id: 's7_grievance',
        esrsRef: 'S2-4',
        type: 'textarea',
        label:
          'Describe the grievance mechanism available to workers in your supply chain. How many grievances were filed and resolved in the last 12 months?',
        required: true,
      },
      {
        id: 's7_conflict_minerals',
        esrsRef: 'G1-1',
        type: 'dropdown',
        label:
          'Does your organisation have a verified conflict minerals policy (3TG — tin, tantalum, tungsten, gold) in place, including OECD Due Diligence guidance compliance?',
        options: YES_NO,
        required: true,
      },
      {
        id: 's7_code_of_conduct',
        esrsRef: 'G1-2',
        type: 'textarea',
        label:
          'Describe your supplier code of conduct and how compliance is monitored across your own supply chain. Include details of any third-party audits conducted in the last 24 months.',
        required: true,
      },
    ],
  },
]

export const ALL_FIELDS = SECTIONS.flatMap((s) => s.fields.map((f) => ({ ...f, sectionId: s.id })))

export function isFieldRequired(field, answers) {
  if (field.conditional) {
    const controllingValue = answers[field.conditional.field]
    if (controllingValue === field.conditional.equals) {
      return field.conditional.required
    }
    return false
  }
  return !!field.required
}

export function validateField(field, value, answers) {
  const required = isFieldRequired(field, answers)
  const trimmed = typeof value === 'string' ? value.trim() : value

  if (required && (trimmed === undefined || trimmed === null || trimmed === '')) {
    return 'This field is required.'
  }
  if (!trimmed && trimmed !== 0) return null

  if (field.type === 'number') {
    if (Number.isNaN(Number(trimmed))) {
      return 'Enter a number.'
    }
  }
  if (field.type === 'dropdown' && field.options && !field.options.includes(trimmed)) {
    return 'Choose one of the listed options.'
  }
  return null
}

export function validateSection(section, answers) {
  const errors = {}
  section.fields.forEach((field) => {
    const error = validateField(field, answers[field.id], answers)
    if (error) errors[field.id] = error
  })
  return errors
}
