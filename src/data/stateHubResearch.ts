import type { NigerianState } from "@/data/states";

/** Per-state hub content from RESEARCH.md portrait + emergency tables (Aug 2026). */
export type StateHubResearch = {
  emergency?: {
    police?: string;
    fire?: string;
    ambulance?: string;
    hospital?: string;
  };
  mdas?: { name: string; focus: string; phone: string; email?: string; url?: string }[];
  laws?: { title: string; category: string; year: number; url?: string }[];
};

export const stateHubResearch: Record<NigerianState, StateHubResearch> = {
  Abia: {
    emergency: { police: "08035415474", fire: "112", ambulance: "112" },
    mdas: [
      {
        name: "Ministry of Finance",
        focus: "State budgeting and revenue",
        phone: "08035415474",
        email: "info@abiastate.gov.ng",
        url: "https://abiastate.gov.ng",
      },
    ],
    laws: [{ title: "Abia State Public Procurement Law", category: "Fiscal Regulation", year: 2012 }],
  },
  Adamawa: {
    emergency: { police: "08089671313", fire: "112", ambulance: "112" },
    mdas: [
      {
        name: "Ministry of Information",
        focus: "Public communication",
        phone: "08089671313",
        email: "info@adamawastate.gov.ng",
        url: "https://adamawastate.gov.ng",
      },
    ],
    laws: [{ title: "Adamawa State Fiscal Responsibility Law", category: "Public Finance", year: 2010 }],
  },
  "Akwa Ibom": {
    emergency: { police: "08033933928", fire: "112", ambulance: "112" },
    mdas: [
      {
        name: "Ministry of Lands & Water Resources",
        focus: "Land administration and water",
        phone: "08033933928",
        url: "https://invest.akwaibomstate.gov.ng",
      },
    ],
    laws: [{ title: "Akwa Ibom Investment Promotion Law", category: "Investment & Commerce", year: 2019 }],
  },
  Anambra: {
    emergency: { police: "07039194332", fire: "112", ambulance: "112" },
    mdas: [
      {
        name: "Anambra State Revenue Service",
        focus: "Tax and revenue collection",
        phone: "07039194332",
        email: "info@anambrastate.gov.ng",
        url: "https://anambrastate.gov.ng",
      },
    ],
    laws: [{ title: "Anambra State Revenue Administration Law", category: "Tax Governance", year: 2010 }],
  },
  Bauchi: {
    emergency: { police: "08151849417", fire: "112", ambulance: "112" },
    mdas: [
      {
        name: "Bauchi State Meat Factory Board",
        focus: "Agro-industrial processing",
        phone: "08151849417",
        url: "https://bauchistate.gov.ng",
      },
    ],
    laws: [{ title: "Bauchi State Livestock & Public Health Law", category: "Agricultural Policy", year: 2015 }],
  },
  Bayelsa: {
    emergency: { police: "07034578208", fire: "112", ambulance: "112" },
    mdas: [
      {
        name: "Centre for Youth Development",
        focus: "Youth programmes",
        phone: "07034578208",
        url: "https://bayelsastate.gov.ng",
      },
    ],
    laws: [{ title: "Bayelsa State Environmental Protection Law", category: "Environmental & Energy", year: 2006 }],
  },
  Benue: {
    emergency: { police: "08066009699", fire: "112", ambulance: "112" },
    mdas: [
      {
        name: "Ministry of Agriculture",
        focus: "Food production and rural development",
        phone: "08066009699",
        email: "info@benuestate.gov.ng",
        url: "https://benuestate.gov.ng",
      },
    ],
    laws: [{ title: "Benue State Open Grazing Prohibition Law", category: "Land & Security", year: 2017 }],
  },
  Borno: {
    emergency: { police: "08068075581", fire: "112", ambulance: "112" },
    mdas: [
      {
        name: "Ministry of Reconstruction, Rehabilitation & Resettlement",
        focus: "Post-conflict infrastructure",
        phone: "08068075581",
        email: "info@bornostate.gov.ng",
        url: "https://bornostate.gov.ng",
      },
    ],
    laws: [{ title: "Borno State RRR Agency Law", category: "Disaster Management", year: 2015 }],
  },
  "Cross River": {
    emergency: { police: "08133568456", fire: "112", ambulance: "112" },
    mdas: [
      {
        name: "Health Insurance Scheme Board",
        focus: "Health coverage",
        phone: "08133568456",
        url: "https://crossriverstate.gov.ng",
      },
    ],
    laws: [{ title: "Cross River State Forestry & Conservation Law", category: "Environmental Law", year: 2010 }],
  },
  Delta: {
    emergency: { police: "08035502280", fire: "112", ambulance: "112" },
    mdas: [
      {
        name: "Delta State Ministry of Works",
        focus: "Roads and public infrastructure",
        phone: "08035502280",
        url: "https://deltastate.gov.ng",
      },
    ],
    laws: [{ title: "Delta State Public Procurement Law", category: "Public Finance", year: 2014 }],
  },
  Ebonyi: {
    emergency: { police: "07064515001", fire: "112", ambulance: "112" },
    mdas: [
      {
        name: "House of Assembly Service Commission",
        focus: "Legislative administration",
        phone: "07064515001",
        url: "https://ebonyistate.gov.ng",
      },
    ],
    laws: [{ title: "Ebonyi State Infrastructure Protection Law", category: "Capital Works", year: 2020 }],
  },
  Edo: {
    emergency: { police: "08037233570", fire: "112", ambulance: "112" },
    mdas: [
      {
        name: "Ministry of Business & Trade",
        focus: "Commerce and MSME support",
        phone: "08037233570",
        url: "https://edostate.gov.ng",
      },
    ],
    laws: [{ title: "Edo State Revenue Harmonisation Law", category: "Tax Administration", year: 2017 }],
  },
  Ekiti: {
    emergency: { police: "08062335577", fire: "112", ambulance: "112" },
    mdas: [
      {
        name: "Office of Transformation Strategy (OTSD)",
        focus: "Policy and delivery",
        phone: "08062335577",
        url: "https://ekitistate.gov.ng",
      },
    ],
    laws: [{ title: "Ekiti State Development Fund Law", category: "Economic Policy", year: 1996 }],
  },
  Enugu: {
    emergency: { police: "08032003702", fire: "112", ambulance: "112" },
    mdas: [
      {
        name: "Enugu State Finance & Investment Company",
        focus: "Public investment",
        phone: "08032003702",
        url: "https://enugustate.gov.ng",
      },
    ],
    laws: [{ title: "Enugu State Public-Private Partnership Law", category: "Infrastructure", year: 2014 }],
  },
  FCT: {
    emergency: { police: "112", fire: "08032003557", ambulance: "112", hospital: "National Hospital Abuja" },
    mdas: [
      {
        name: "FCT Health & Human Services Secretariat",
        focus: "Healthcare administration",
        phone: "112",
        url: "https://fct.gov.ng",
      },
    ],
    laws: [{ title: "FCT Water Supply & Sanitation Act", category: "Utility Regulation", year: 2004 }],
  },
  Gombe: {
    emergency: { police: "08150567771", fire: "112", ambulance: "112" },
    mdas: [
      {
        name: "Ministry of Finance & Economic Development",
        focus: "Budget and planning",
        phone: "08150567771",
        url: "https://gombestate.gov.ng",
      },
    ],
    laws: [{ title: "Gombe State Geographic Information Law", category: "Land Administration", year: 2012 }],
  },
  Imo: {
    emergency: { police: "08034773600", fire: "112", ambulance: "112" },
    mdas: [
      {
        name: "Imo State Internal Revenue Service",
        focus: "Tax collection",
        phone: "08034773600",
        url: "https://imostate.gov.ng",
      },
    ],
    laws: [{ title: "Imo State Administration of Justice Law", category: "Judicial Administration", year: 2018 }],
  },
  Jigawa: {
    emergency: { police: "08036021084", fire: "112", ambulance: "112" },
    mdas: [
      {
        name: "Jigawa State Public Procurement Bureau",
        focus: "Contracting oversight",
        phone: "08036021084",
        url: "https://jigawastate.gov.ng",
      },
    ],
    laws: [{ title: "Jigawa State Public Procurement Law", category: "Fiscal Transparency", year: 2019 }],
  },
  Kaduna: {
    emergency: { police: "08075391105", fire: "112", ambulance: "112" },
    mdas: [
      {
        name: "Kaduna Investment Promotion Agency (KADIPA)",
        focus: "Investment facilitation",
        phone: "08075391105",
        url: "https://kdsg.gov.ng",
      },
    ],
    laws: [{ title: "Kaduna State Tax Codification Law", category: "Revenue Governance", year: 2016 }],
  },
  Kano: {
    emergency: {
      police: "08032419754",
      fire: "08023215118",
      ambulance: "08030002222",
      hospital: "Aminu Kano Teaching Hospital — 064 949400",
    },
    mdas: [
      {
        name: "Kano State Ministry of Works and Infrastructure",
        focus: "Civil engineering and public infrastructure",
        phone: "+234 64 000 111",
        email: "works@kanostate.gov.ng",
        url: "https://kanostate.gov.ng",
      },
    ],
    laws: [
      {
        title: "Kano State Public Procurement Law",
        category: "Fiscal Governance",
        year: 2014,
        url: "https://kanostate.gov.ng/laws",
      },
    ],
  },
  Katsina: {
    emergency: { police: "08035891523", fire: "112", ambulance: "112" },
    mdas: [
      {
        name: "SMEDAN Rural Liaison Office",
        focus: "MSME support",
        phone: "08035891523",
        url: "https://katsinastate.gov.ng",
      },
    ],
    laws: [{ title: "Katsina State Security Trust Fund Law", category: "Security Governance", year: 2019 }],
  },
  Kebbi: {
    emergency: { police: "08038797048", fire: "112", ambulance: "112" },
    mdas: [
      {
        name: "Ministry of Basic & Secondary Education",
        focus: "Education policy",
        phone: "08038797048",
        url: "https://kebbistate.gov.ng",
      },
    ],
    laws: [{ title: "Kebbi State Revenue Administration Law", category: "Fiscal Management", year: 2021 }],
  },
  Kogi: {
    emergency: { police: "08033142270", fire: "112", ambulance: "112" },
    mdas: [
      {
        name: "Local Government Audit Board",
        focus: "Municipal finance oversight",
        phone: "08033142270",
        url: "https://kogistate.gov.ng",
      },
    ],
    laws: [{ title: "Kogi State Public Finance & Audit Law", category: "Audit Governance", year: 2020 }],
  },
  Kwara: {
    emergency: { police: "08125275046", fire: "112", ambulance: "112" },
    mdas: [
      {
        name: "KwaraLEARN Basic Education Board",
        focus: "Primary education reform",
        phone: "08125275046",
        url: "https://kwarastate.gov.ng",
      },
    ],
    laws: [{ title: "Kwara State Public Procurement Law", category: "Contracting Law", year: 2018 }],
  },
  Lagos: {
    emergency: {
      police: "112 / 767",
      fire: "112 / 08033237166",
      ambulance: "767 / 08058208336",
      hospital: "LASUTH — 08023169485",
    },
    mdas: [
      {
        name: "Lagos State Ministry of Health",
        focus: "Public healthcare policy and hospital regulation",
        phone: "+234 817 414 0161",
        email: "health@lagosstate.gov.ng",
        url: "https://health.lagosstate.gov.ng",
      },
      {
        name: "Lagos State Public Procurement Agency (LSPPA)",
        focus: "Public contracting and e-procurement",
        phone: "+234 817 414 0161",
        email: "info@lagosppa.gov.ng",
        url: "https://lagosppa.gov.ng",
      },
    ],
    laws: [
      {
        title: "Lagos State Public Procurement Law",
        category: "Fiscal Governance",
        year: 2011,
        url: "https://lagosppa.gov.ng/laws",
      },
      {
        title: "Lagos State Revenue Administration Law",
        category: "Taxation & Finance",
        year: 2020,
        url: "https://lagosstate.gov.ng/laws",
      },
    ],
  },
  Nasarawa: {
    emergency: { police: "08123821571", fire: "112", ambulance: "112" },
    mdas: [
      {
        name: "Nasarawa Investment & Development Agency",
        focus: "Investment promotion",
        phone: "08123821571",
        url: "https://nasarawastate.gov.ng",
      },
    ],
    laws: [{ title: "Nasarawa State Solid Minerals Development Law", category: "Mining & Industry", year: 2018 }],
  },
  Niger: {
    emergency: { police: "08081777498", fire: "112", ambulance: "112" },
    mdas: [
      {
        name: "Ministry of Agriculture & Rural Development",
        focus: "Agriculture and rural economy",
        phone: "08081777498",
        url: "https://nigerstate.gov.ng",
      },
    ],
    laws: [{ title: "Niger State Revenue Consolidation Law", category: "Tax Governance", year: 2020 }],
  },
  Ogun: {
    emergency: { police: "08037168189", fire: "112", ambulance: "112" },
    mdas: [
      {
        name: "Ogun State Investment Promotion Agency",
        focus: "Investment and industrial zones",
        phone: "08037168189",
        url: "https://ogunstate.gov.ng",
      },
    ],
    laws: [{ title: "Ogun State Public Procurement Law", category: "Contracting", year: 2014 }],
  },
  Ondo: {
    emergency: { police: "07034313903", fire: "112", ambulance: "112" },
    mdas: [
      {
        name: "Ondo State Agency for Public Procurement (ODAPPA)",
        focus: "Procurement regulation",
        phone: "07034313903",
        url: "https://ondostate.gov.ng",
      },
    ],
    laws: [{ title: "Ondo State Oil Producing Areas Development Law", category: "Regional Development", year: 2001 }],
  },
  Osun: {
    emergency: { police: "08039580795", fire: "112", ambulance: "112" },
    mdas: [
      {
        name: "Ministry of Local Government & Chieftaincy Affairs",
        focus: "Local government administration",
        phone: "08039580795",
        url: "https://osunstate.gov.ng",
      },
    ],
    laws: [{ title: "Osun State Public Procurement Law", category: "Fiscal Management", year: 2015 }],
  },
  Oyo: {
    emergency: { police: "08033929974", fire: "112", ambulance: "112" },
    mdas: [
      {
        name: "Bureau of Public Procurement (Oyo)",
        focus: "Contracting oversight",
        phone: "08033929974",
        url: "https://oyostate.gov.ng",
      },
    ],
    laws: [{ title: "Oyo State Anti-Corruption Law", category: "Governance & Ethics", year: 2019 }],
  },
  Plateau: {
    emergency: { police: "08038907652", fire: "112", ambulance: "112" },
    mdas: [
      {
        name: "Plateau State Peace Building Agency",
        focus: "Conflict prevention",
        phone: "08038907652",
        url: "https://plateaustate.gov.ng",
      },
    ],
    laws: [{ title: "Plateau State Peace Building Agency Law", category: "Security & Peace", year: 2016 }],
  },
  Rivers: {
    emergency: {
      police: "08032003514",
      fire: "08033355555",
      ambulance: "08037000000",
      hospital: "RSUTH — 08030000000",
    },
    mdas: [
      {
        name: "Rivers State Bureau of Public Procurement",
        focus: "Contract regulation and tender approvals",
        phone: "+234 803 000 1111",
        email: "info@riversbpp.gov.ng",
        url: "https://riversstate.gov.ng",
      },
    ],
    laws: [
      {
        title: "Rivers State Public Procurement Law No. 4",
        category: "Public Procurement",
        year: 2008,
        url: "https://riversstate.gov.ng/laws",
      },
    ],
  },
  Sokoto: {
    emergency: { police: "08036030999", fire: "112", ambulance: "112" },
    mdas: [
      {
        name: "Police Trust Fund Liaison Office",
        focus: "Security coordination",
        phone: "08036030999",
        url: "https://sokotostate.gov.ng",
      },
    ],
    laws: [{ title: "Sokoto State Water Board Law", category: "Municipal Utilities", year: 2016 }],
  },
  Taraba: {
    emergency: { police: "08036137035", fire: "112", ambulance: "112" },
    mdas: [
      {
        name: "NIMASA Regional Liaison Office",
        focus: "Maritime coordination",
        phone: "08036137035",
        url: "https://tarabastate.gov.ng",
      },
    ],
    laws: [{ title: "Taraba State Free Basic Education Law", category: "Education Policy", year: 2023 }],
  },
  Yobe: {
    emergency: { police: "08036566296", fire: "112", ambulance: "112" },
    mdas: [
      {
        name: "Yobe State University Teaching Hospital",
        focus: "Tertiary healthcare",
        phone: "08036566296",
        url: "https://yobestate.gov.ng",
      },
    ],
    laws: [{ title: "Yobe State Healthcare Management Law", category: "Health Governance", year: 2019 }],
  },
  Zamfara: {
    emergency: { police: "08036033784", fire: "112", ambulance: "112" },
    mdas: [
      {
        name: "Zamfara State Security & Economic Recovery Board",
        focus: "Security and mining regulation",
        phone: "08036033784",
        url: "https://zamfarastate.gov.ng",
      },
    ],
    laws: [{ title: "Zamfara State Anti-Banditry & Protection Law", category: "Public Security", year: 2021 }],
  },
};
