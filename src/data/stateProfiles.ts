import type { NigerianState } from "@/data/states";
import { stateGovernanceMeta } from "@/data/stateGovernanceMeta";

export type StateProfile = {
  state: NigerianState;
  capital: string;
  slogan: string;
  zone: "North-Central" | "North-East" | "North-West" | "South-East" | "South-South" | "South-West";
  governor: string;
  party: string;
  population: string;
  lgas: number;
  /** Official state / FCT website from research. */
  officialPortal?: string;
  /** State open-contracting or BPP portal when published. */
  procurementPortal?: string;
  termEndYear?: number;
  ssg?: string;
  speaker?: string;
  governorPhotoUrl?: string;
  emergency: {
    national: string;
    police: string;
    fire: string;
    ambulance: string;
  };
  mdas: { name: string; focus: string; phone: string }[];
  laws: { title: string; category: string; year: number }[];
  highlights: string[];
};

const stateProfilesRaw: Record<NigerianState, StateProfile> = {
  Abia: {
    state: "Abia", capital: "Umuahia", slogan: "God's Own State", zone: "South-East",
    governor: "Alex Otti", party: "LP", population: "3.8M", lgas: 17,
    emergency: { national: "112", police: "08035415408", fire: "08037450831", ambulance: "08035067570" },
    mdas: [
      { name: "Abia State Internal Revenue Service", focus: "Tax & revenue", phone: "0803-000-0000" },
      { name: "Ministry of Commerce & Industry", focus: "Business registration", phone: "0803-111-2233" },
      { name: "Abia Geographic Information System", focus: "Land titles", phone: "0809-222-3344" },
    ],
    laws: [
      { title: "Abia State Revenue Administration Law", category: "Finance", year: 2023 },
      { title: "Abia State Urban Planning Act", category: "Infrastructure", year: 2019 },
    ],
    highlights: ["Aba commercial hub", "Shoe & garment manufacturing", "Oil palm processing"],
  },
  Adamawa: {
    state: "Adamawa", capital: "Yola", slogan: "Land of Beauty", zone: "North-East",
    governor: "Ahmadu Umaru Fintiri", party: "APC", population: "4.2M", lgas: 21,
    emergency: { national: "112", police: "08032003702", fire: "08037037256", ambulance: "08037037257" },
    mdas: [
      { name: "Adamawa State Revenue Board", focus: "Tax collection", phone: "0803-000-0000" },
      { name: "Ministry of Works & Energy", focus: "Roads & power", phone: "0803-111-2233" },
    ],
    laws: [
      { title: "Adamawa State Fiscal Responsibility Law", category: "Finance", year: 2022 },
    ],
    highlights: ["Mubi market", "Yola River", "Agricultural exports"],
  },
  "Akwa Ibom": {
    state: "Akwa Ibom", capital: "Uyo", slogan: "Land of Promise", zone: "South-South",
    governor: "Umo Eno", party: "APC", population: "5.5M", lgas: 31,
    emergency: { national: "112", police: "08039213080", fire: "08039213081", ambulance: "08039213082" },
    mdas: [
      { name: "Akwa Ibom Internal Revenue Service", focus: "Tax & revenue", phone: "0803-000-0000" },
      { name: "Ministry of Economic Development", focus: "Investment", phone: "0803-111-2233" },
    ],
    laws: [
      { title: "Akwa Ibom State Fiscal Responsibility Law", category: "Finance", year: 2021 },
    ],
    highlights: ["Oil & gas hub", "Ibom Air", "Coastal tourism"],
  },
  Anambra: {
    state: "Anambra", capital: "Awka", slogan: "Light of the Nation", zone: "South-East",
    governor: "Charles Soludo", party: "APGA", population: "5.5M", lgas: 21,
    emergency: { national: "112", police: "07039194332", fire: "08033202052", ambulance: "08033202053" },
    mdas: [
      { name: "Anambra Internal Revenue Service", focus: "Tax collection", phone: "0803-000-0000" },
      { name: "Ministry of Commerce & Industry", focus: "MSME support", phone: "0803-111-2233" },
    ],
    laws: [
      { title: "Anambra State Revenue Law", category: "Finance", year: 2020 },
      { title: "Anambra State Investment Promotion Act", category: "Commerce", year: 2022 },
    ],
    highlights: ["Onitsha market", "Nnewi industrial zone", "Soludo reforms"],
  },
  Bauchi: {
    state: "Bauchi", capital: "Bauchi", slogan: "Pearl of Tourism", zone: "North-East",
    governor: "Bala Mohammed", party: "APM", population: "6.5M", lgas: 20,
    emergency: { national: "112", police: "08037000100", fire: "08037000101", ambulance: "08037000102" },
    mdas: [
      { name: "Bauchi State Internal Revenue Service", focus: "Tax", phone: "0803-000-0000" },
      { name: "Ministry of Tourism & Culture", focus: "Tourism", phone: "0803-111-2233" },
    ],
    laws: [{ title: "Bauchi State Fiscal Responsibility Law", category: "Finance", year: 2021 }],
    highlights: ["Yankari Game Reserve", "Agricultural belt", "Solid minerals"],
  },
  Bayelsa: {
    state: "Bayelsa", capital: "Yenagoa", slogan: "Glory of All Lands", zone: "South-South",
    governor: "Douye Diri", party: "APC", population: "2.3M", lgas: 8,
    emergency: { national: "112", police: "08037000100", fire: "08037000101", ambulance: "08037000102" },
    mdas: [
      { name: "Bayelsa State Board of Internal Revenue", focus: "Tax", phone: "0803-000-0000" },
      { name: "Ministry of Environment", focus: "Oil spill response", phone: "0803-111-2233" },
    ],
    laws: [{ title: "Bayelsa State Fiscal Responsibility Law", category: "Finance", year: 2020 }],
    highlights: ["Oil-producing state", "Niger Delta", "Maritime economy"],
  },
  Benue: {
    state: "Benue", capital: "Makurdi", slogan: "Food Basket of the Nation", zone: "North-Central",
    governor: "Hyacinth Alia", party: "APC", population: "5.7M", lgas: 23,
    emergency: { national: "112", police: "08066006447", fire: "08066006448", ambulance: "08066006449" },
    mdas: [
      { name: "Benue State Internal Revenue Service", focus: "Tax", phone: "0803-000-0000" },
      { name: "Ministry of Agriculture", focus: "Food production", phone: "0803-111-2233" },
    ],
    laws: [{ title: "Benue State Revenue Law", category: "Finance", year: 2022 }],
    highlights: ["Yam & cassava hub", "Livestock", "Agricultural exports"],
  },
  Borno: {
    state: "Borno", capital: "Maiduguri", slogan: "Home of Peace", zone: "North-East",
    governor: "Babagana Zulum", party: "APC", population: "5.9M", lgas: 27,
    emergency: { national: "112", police: "08037000100", fire: "08037000101", ambulance: "08037000102" },
    mdas: [
      { name: "Borno State Internal Revenue Service", focus: "Tax", phone: "0803-000-0000" },
      { name: "Ministry of Reconstruction", focus: "Infrastructure rebuild", phone: "0803-111-2233" },
    ],
    laws: [{ title: "Borno State Fiscal Responsibility Law", category: "Finance", year: 2021 }],
    highlights: ["Lake Chad basin", "Reconstruction projects", "Border trade"],
  },
  "Cross River": {
    state: "Cross River", capital: "Calabar", slogan: "The People's Paradise", zone: "South-South",
    governor: "Bassey Otu", party: "APC", population: "3.9M", lgas: 18,
    emergency: { national: "112", police: "08037000100", fire: "08037000101", ambulance: "08037000102" },
    mdas: [
      { name: "Cross River Internal Revenue Service", focus: "Tax", phone: "0803-000-0000" },
      { name: "Ministry of Tourism", focus: "Carnival & hospitality", phone: "0803-111-2233" },
    ],
    laws: [{ title: "Cross River State Revenue Law", category: "Finance", year: 2020 }],
    highlights: ["Calabar Carnival", "Tourism", "Obudu Cattle Ranch"],
  },
  Delta: {
    state: "Delta", capital: "Asaba", slogan: "The Big Heart", zone: "South-South",
    governor: "Sheriff Oborevwori", party: "APC", population: "5.6M", lgas: 25,
    emergency: { national: "112", police: "08037000100", fire: "08037000101", ambulance: "08037000102" },
    mdas: [
      { name: "Delta State Internal Revenue Service", focus: "Tax", phone: "0803-000-0000" },
      { name: "Ministry of Oil & Gas", focus: "Energy sector", phone: "0803-111-2233" },
    ],
    laws: [{ title: "Delta State Fiscal Responsibility Law", category: "Finance", year: 2021 }],
    highlights: ["Oil & gas", "Warri industrial zone", "River transport"],
  },
  Ebonyi: {
    state: "Ebonyi", capital: "Abakaliki", slogan: "Salt of the Nation", zone: "South-East",
    governor: "Francis Nwifuru", party: "APC", population: "2.9M", lgas: 13,
    emergency: { national: "112", police: "08037000100", fire: "08037000101", ambulance: "08037000102" },
    mdas: [
      { name: "Ebonyi State Internal Revenue Service", focus: "Tax", phone: "0803-000-0000" },
      { name: "Ministry of Commerce", focus: "Rice milling", phone: "0803-111-2233" },
    ],
    laws: [{ title: "Ebonyi State Revenue Law", category: "Finance", year: 2022 }],
    highlights: ["Rice production", "Salt mining", "Abakaliki rice"],
  },
  Edo: {
    state: "Edo", capital: "Benin City", slogan: "Heartbeat of the Nation", zone: "South-South",
    governor: "Monday Okpebholo", party: "APC", population: "4.2M", lgas: 18,
    emergency: { national: "112", police: "08037646268", fire: "08037646269", ambulance: "08037646270" },
    mdas: [
      { name: "Edo State Internal Revenue Service", focus: "Tax", phone: "0700-547-547" },
      { name: "Ministry of Commerce & Industry", focus: "Trade", phone: "0803-000-1122" },
      { name: "Edo Geographic Information System", focus: "Land records", phone: "0809-111-3344" },
    ],
    laws: [
      { title: "Edo State Revenue Administration Law 2023", category: "Finance", year: 2023 },
      { title: "Executive Order: Traffic Management Agency", category: "Transportation", year: 2024 },
    ],
    highlights: ["Benin City", "EdoGOV digital reforms", "Oil palm & rubber"],
  },
  Ekiti: {
    state: "Ekiti", capital: "Ado-Ekiti", slogan: "Land of Honour and Integrity", zone: "South-West",
    governor: "Biodun Oyebanji", party: "APC", population: "3.3M", lgas: 16,
    emergency: { national: "112", police: "08037000100", fire: "08037000101", ambulance: "08037000102" },
    mdas: [
      { name: "Ekiti State Internal Revenue Service", focus: "Tax", phone: "0803-000-0000" },
      { name: "Ministry of Agriculture", focus: "Cocoa & kolanut", phone: "0803-111-2233" },
    ],
    laws: [{ title: "Ekiti State Fiscal Responsibility Law", category: "Finance", year: 2021 }],
    highlights: ["Cocoa production", "Higher education hub", "Tourism"],
  },
  Enugu: {
    state: "Enugu", capital: "Enugu", slogan: "Coal City State", zone: "South-East",
    governor: "Peter Mbah", party: "APC", population: "4.4M", lgas: 17,
    emergency: { national: "112", police: "08037000100", fire: "08037000101", ambulance: "08037000102" },
    mdas: [
      { name: "Enugu State Internal Revenue Service", focus: "Tax", phone: "0803-000-0000" },
      { name: "Ministry of Transport", focus: "Roads & rail", phone: "0803-111-2233" },
    ],
    laws: [{ title: "Enugu State Revenue Law", category: "Finance", year: 2022 }],
    highlights: ["Coal heritage", "Smart city projects", "Eastern rail hub"],
  },
  FCT: {
    state: "FCT", capital: "Abuja", slogan: "Centre of Unity", zone: "North-Central",
    governor: "Nyesom Wike (Minister)", party: "APC", population: "3.6M", lgas: 6,
    emergency: { national: "112", police: "08032003913", fire: "08032003914", ambulance: "08032003915" },
    mdas: [
      { name: "FCT Internal Revenue Service", focus: "Tax", phone: "0803-000-0000" },
      { name: "Abuja Metropolitan Management Council", focus: "City admin", phone: "0803-111-2233" },
      { name: "FCT Transport Secretariat", focus: "Transport", phone: "0803-222-3344" },
    ],
    laws: [
      { title: "FCT Area Councils Revenue Law", category: "Finance", year: 2022 },
      { title: "Abuja Environmental Protection Act", category: "Environment", year: 2020 },
    ],
    highlights: ["Federal capital", "Government contracts hub", "Master plan development"],
  },
  Gombe: {
    state: "Gombe", capital: "Gombe", slogan: "Jewel of the Savannah", zone: "North-East",
    governor: "Muhammad Inuwa Yahaya", party: "APC", population: "3.3M", lgas: 11,
    emergency: { national: "112", police: "08037000100", fire: "08037000101", ambulance: "08037000102" },
    mdas: [
      { name: "Gombe State Internal Revenue Service", focus: "Tax", phone: "0803-000-0000" },
    ],
    laws: [{ title: "Gombe State Fiscal Responsibility Law", category: "Finance", year: 2021 }],
    highlights: ["Agricultural zone", "Cotton & groundnut", "Solid minerals"],
  },
  Imo: {
    state: "Imo", capital: "Owerri", slogan: "Eastern Heartland", zone: "South-East",
    governor: "Hope Uzodimma", party: "APC", population: "5.4M", lgas: 27,
    emergency: { national: "112", police: "08037000100", fire: "08037000101", ambulance: "08037000102" },
    mdas: [
      { name: "Imo State Internal Revenue Service", focus: "Tax", phone: "0803-000-0000" },
      { name: "Ministry of Petroleum & Environment", focus: "Oil palm", phone: "0803-111-2233" },
    ],
    laws: [{ title: "Imo State Revenue Law", category: "Finance", year: 2022 }],
    highlights: ["Owerri commercial hub", "Oil palm", "Hospitality"],
  },
  Jigawa: {
    state: "Jigawa", capital: "Dutse", slogan: "The New World", zone: "North-West",
    governor: "Umar Namadi", party: "APC", population: "5.8M", lgas: 27,
    emergency: { national: "112", police: "08037000100", fire: "08037000101", ambulance: "08037000102" },
    mdas: [
      { name: "Jigawa State Internal Revenue Service", focus: "Tax", phone: "0803-000-0000" },
    ],
    laws: [{ title: "Jigawa State Fiscal Responsibility Law", category: "Finance", year: 2021 }],
    highlights: ["Rice production", "Hadejia valley", "Border trade with Niger"],
  },
  Kaduna: {
    state: "Kaduna", capital: "Kaduna", slogan: "Centre of Learning", zone: "North-West",
    governor: "Uba Sani", party: "APC", population: "8.2M", lgas: 23,
    emergency: { national: "112", police: "08037000100", fire: "08037000101", ambulance: "08037000102" },
    mdas: [
      { name: "Kaduna State Internal Revenue Service", focus: "Tax", phone: "0803-000-0000" },
      { name: "Kaduna Investment Promotion Agency", focus: "Investment", phone: "0803-111-2233" },
      { name: "Kaduna Geographic Information Service", focus: "Land titles", phone: "0803-222-3344" },
    ],
    laws: [
      { title: "Kaduna State Revenue Code", category: "Finance", year: 2023 },
      { title: "Kaduna State Open Contracting Regulation", category: "Procurement", year: 2022 },
    ],
    highlights: ["Industrial hub", "Open contracting portal (OCDS)", "Defence industries"],
  },
  Kano: {
    state: "Kano", capital: "Kano", slogan: "Centre of Commerce", zone: "North-West",
    governor: "Abba Kabir Yusuf", party: "APC", population: "13.1M", lgas: 44,
    emergency: { national: "112", police: "08037000100", fire: "08037000101", ambulance: "08037000102" },
    mdas: [
      { name: "Kano State Internal Revenue Service", focus: "Tax", phone: "0803-000-0000" },
      { name: "Ministry of Commerce & Industry", focus: "Trade", phone: "0803-111-2233" },
    ],
    laws: [{ title: "Kano State Revenue Administration Law", category: "Finance", year: 2022 }],
    highlights: ["Largest northern city", "Textile & leather", "Dala hill heritage"],
  },
  Katsina: {
    state: "Katsina", capital: "Katsina", slogan: "Home of Hospitality", zone: "North-West",
    governor: "Dikko Umar Radda", party: "APC", population: "7.8M", lgas: 34,
    emergency: { national: "112", police: "08037000100", fire: "08037000101", ambulance: "08037000102" },
    mdas: [
      { name: "Katsina State Internal Revenue Service", focus: "Tax", phone: "0803-000-0000" },
    ],
    laws: [{ title: "Katsina State Fiscal Responsibility Law", category: "Finance", year: 2021 }],
    highlights: ["Border state", "Agriculture", "Historical emirate"],
  },
  Kebbi: {
    state: "Kebbi", capital: "Birnin Kebbi", slogan: "Land of Equity", zone: "North-West",
    governor: "Nasir Idris", party: "APC", population: "4.4M", lgas: 21,
    emergency: { national: "112", police: "08037000100", fire: "08037000101", ambulance: "08037000102" },
    mdas: [
      { name: "Kebbi State Internal Revenue Service", focus: "Tax", phone: "0803-000-0000" },
    ],
    laws: [{ title: "Kebbi State Revenue Law", category: "Finance", year: 2022 }],
    highlights: ["Argungu fishing festival", "Rice farming", "River Niger"],
  },
  Kogi: {
    state: "Kogi", capital: "Lokoja", slogan: "The Confluence State", zone: "North-Central",
    governor: "Ahmed Usman Ododo", party: "APC", population: "4.5M", lgas: 21,
    emergency: { national: "112", police: "08037000100", fire: "08037000101", ambulance: "08037000102" },
    mdas: [
      { name: "Kogi State Internal Revenue Service", focus: "Tax", phone: "0803-000-0000" },
      { name: "Ministry of Works", focus: "Roads", phone: "0803-111-2233" },
    ],
    laws: [{ title: "Kogi State Fiscal Responsibility Law", category: "Finance", year: 2021 }],
    highlights: ["Confluence of Niger & Benue", "Iron ore", "Cement production"],
  },
  Kwara: {
    state: "Kwara", capital: "Ilorin", slogan: "State of Harmony", zone: "North-Central",
    governor: "AbdulRahman AbdulRazaq", party: "APC", population: "3.2M", lgas: 16,
    emergency: { national: "112", police: "08037000100", fire: "08037000101", ambulance: "08037000102" },
    mdas: [
      { name: "Kwara State Internal Revenue Service", focus: "Tax", phone: "0803-000-0000" },
      { name: "Kwara Investment Promotion Agency", focus: "Investment", phone: "0803-111-2233" },
    ],
    laws: [{ title: "Kwara State Revenue Law", category: "Finance", year: 2022 }],
    highlights: ["Ilorin emirate", "Agriculture", "Harmony reforms"],
  },
  Lagos: {
    state: "Lagos", capital: "Ikeja", slogan: "Centre of Excellence", zone: "South-West",
    governor: "Babajide Sanwo-Olu", party: "APC", population: "15.4M", lgas: 20,
    emergency: { national: "112", police: "08033450247", fire: "08033235823", ambulance: "08022883678" },
    mdas: [
      { name: "Lagos State Internal Revenue Service (LIRS)", focus: "Tax", phone: "0700-000-0000" },
      { name: "Ministry of Commerce & Industry", focus: "Business permits", phone: "0803-000-1122" },
      { name: "Lagos State Building Control Agency", focus: "Construction permits", phone: "0809-111-3344" },
    ],
    laws: [
      { title: "Lagos State Revenue Administration Law", category: "Finance", year: 2023 },
      { title: "Lagos State Urban Planning Law", category: "Infrastructure", year: 2019 },
    ],
    highlights: ["Nigeria's commercial capital", "Tech hub (Yaba)", "Lekki Free Trade Zone"],
  },
  Nasarawa: {
    state: "Nasarawa", capital: "Lafia", slogan: "Home of Solid Minerals", zone: "North-Central",
    governor: "Abdullahi Sule", party: "APC", population: "2.5M", lgas: 13,
    emergency: { national: "112", police: "08037000100", fire: "08037000101", ambulance: "08037000102" },
    mdas: [
      { name: "Nasarawa State Internal Revenue Service", focus: "Tax", phone: "0803-000-0000" },
    ],
    laws: [{ title: "Nasarawa State Revenue Law", category: "Finance", year: 2022 }],
    highlights: ["Solid minerals", "Karu-Lafia corridor", "Agriculture"],
  },
  Niger: {
    state: "Niger", capital: "Minna", slogan: "The Power State", zone: "North-Central",
    governor: "Mohammed Umar Bago", party: "APC", population: "5.6M", lgas: 25,
    emergency: { national: "112", police: "08037000100", fire: "08037000101", ambulance: "08037000102" },
    mdas: [
      { name: "Niger State Internal Revenue Service", focus: "Tax", phone: "0803-000-0000" },
      { name: "Ministry of Power & Dams", focus: "Hydroelectric", phone: "0803-111-2233" },
    ],
    laws: [{ title: "Niger State Fiscal Responsibility Law", category: "Finance", year: 2021 }],
    highlights: ["Kainji & Shiroro dams", "Hydroelectric power", "Agriculture"],
  },
  Ogun: {
    state: "Ogun", capital: "Abeokuta", slogan: "Gateway State", zone: "South-West",
    governor: "Dapo Abiodun", party: "APC", population: "5.2M", lgas: 20,
    emergency: { national: "112", police: "08037000100", fire: "08037000101", ambulance: "08037000102" },
    mdas: [
      { name: "Ogun State Internal Revenue Service", focus: "Tax", phone: "0803-000-0000" },
      { name: "Ogun State Investment Promotion Agency", focus: "Investment", phone: "0803-111-2233" },
    ],
    laws: [{ title: "Ogun State Revenue Law", category: "Finance", year: 2022 }],
    highlights: ["Industrial gateway to Lagos", "Cement & manufacturing", "Olumo Rock tourism"],
  },
  Ondo: {
    state: "Ondo", capital: "Akure", slogan: "Sunshine State", zone: "South-West",
    governor: "Lucky Aiyedatiwa", party: "APC", population: "4.9M", lgas: 18,
    emergency: { national: "112", police: "08037000100", fire: "08037000101", ambulance: "08037000102" },
    mdas: [
      { name: "Ondo State Internal Revenue Service", focus: "Tax", phone: "0803-000-0000" },
    ],
    laws: [{ title: "Ondo State Fiscal Responsibility Law", category: "Finance", year: 2021 }],
    highlights: ["Bitumen deposits", "Cocoa production", "Coastal tourism"],
  },
  Osun: {
    state: "Osun", capital: "Osogbo", slogan: "Land of Virtue", zone: "South-West",
    governor: "Ademola Adeleke", party: "Accord", population: "4.7M", lgas: 30,
    emergency: { national: "112", police: "08037000100", fire: "08037000101", ambulance: "08037000102" },
    mdas: [
      { name: "Osun State Internal Revenue Service", focus: "Tax", phone: "0803-000-0000" },
    ],
    laws: [{ title: "Osun State Revenue Law", category: "Finance", year: 2022 }],
    highlights: ["Osun-Osogbo festival", "Gold mining", "Education hub"],
  },
  Oyo: {
    state: "Oyo", capital: "Ibadan", slogan: "Pace Setter State", zone: "South-West",
    governor: "Seyi Makinde", party: "APM", population: "7.8M", lgas: 33,
    emergency: { national: "112", police: "08037000100", fire: "08037000101", ambulance: "08037000102" },
    mdas: [
      { name: "Oyo State Internal Revenue Service", focus: "Tax", phone: "0803-000-0000" },
      { name: "Oyo State Investment Promotion Agency", focus: "Investment", phone: "0803-111-2233" },
    ],
    laws: [{ title: "Oyo State Revenue Administration Law", category: "Finance", year: 2023 }],
    highlights: ["Ibadan — largest city by area", "Agricultural research", "Pace-setting reforms"],
  },
  Plateau: {
    state: "Plateau", capital: "Jos", slogan: "Home of Peace and Tourism", zone: "North-Central",
    governor: "Caleb Mutfwang", party: "APC", population: "4.7M", lgas: 17,
    emergency: { national: "112", police: "08037000100", fire: "08037000101", ambulance: "08037000102" },
    mdas: [
      { name: "Plateau State Internal Revenue Service", focus: "Tax", phone: "0803-000-0000" },
      { name: "Ministry of Tourism", focus: "Tourism", phone: "0803-111-2233" },
    ],
    laws: [{ title: "Plateau State Fiscal Responsibility Law", category: "Finance", year: 2021 }],
    highlights: ["Jos plateau", "Tourism & mining", "Cool climate agriculture"],
  },
  Rivers: {
    state: "Rivers", capital: "Port Harcourt", slogan: "Treasure Base of the Nation", zone: "South-South",
    governor: "Siminalayi Fubara", party: "APC", population: "7.5M", lgas: 23,
    emergency: { national: "112", police: "08037000100", fire: "08037000101", ambulance: "08037000102" },
    mdas: [
      { name: "Rivers State Internal Revenue Service", focus: "Tax", phone: "0803-000-0000" },
      { name: "Ministry of Energy & Natural Resources", focus: "Oil & gas", phone: "0803-111-2233" },
    ],
    laws: [{ title: "Rivers State Revenue Law", category: "Finance", year: 2022 }],
    highlights: ["Oil & gas hub", "Port Harcourt refinery", "Garden City"],
  },
  Sokoto: {
    state: "Sokoto", capital: "Sokoto", slogan: "Seat of the Caliphate", zone: "North-West",
    governor: "Ahmad Aliyu", party: "APC", population: "5.3M", lgas: 23,
    emergency: { national: "112", police: "08037000100", fire: "08037000101", ambulance: "08037000102" },
    mdas: [
      { name: "Sokoto State Internal Revenue Service", focus: "Tax", phone: "0803-000-0000" },
    ],
    laws: [{ title: "Sokoto State Fiscal Responsibility Law", category: "Finance", year: 2021 }],
    highlights: ["Sokoto caliphate", "Islamic scholarship", "Agriculture & livestock"],
  },
  Taraba: {
    state: "Taraba", capital: "Jalingo", slogan: "Nature's Gift to the Nation", zone: "North-East",
    governor: "Agbu Kefas", party: "APC", population: "3.0M", lgas: 16,
    emergency: { national: "112", police: "08037000100", fire: "08037000101", ambulance: "08037000102" },
    mdas: [
      { name: "Taraba State Internal Revenue Service", focus: "Tax", phone: "0803-000-0000" },
    ],
    laws: [{ title: "Taraba State Revenue Law", category: "Finance", year: 2022 }],
    highlights: ["Mambilla plateau", "Tourism", "Tea & coffee farming"],
  },
  Yobe: {
    state: "Yobe", capital: "Damaturu", slogan: "Pride of the Sahel", zone: "North-East",
    governor: "Mai Mala Buni", party: "APC", population: "3.4M", lgas: 17,
    emergency: { national: "112", police: "08037000100", fire: "08037000101", ambulance: "08037000102" },
    mdas: [
      { name: "Yobe State Internal Revenue Service", focus: "Tax", phone: "0803-000-0000" },
    ],
    laws: [{ title: "Yobe State Fiscal Responsibility Law", category: "Finance", year: 2021 }],
    highlights: ["Sahel agriculture", "Date palm", "Border trade"],
  },
  Zamfara: {
    state: "Zamfara", capital: "Gusau", slogan: "Farming is Our Pride", zone: "North-West",
    governor: "Dauda Lawal", party: "APC", population: "4.5M", lgas: 14,
    emergency: { national: "112", police: "08037000100", fire: "08037000101", ambulance: "08037000102" },
    mdas: [
      { name: "Zamfara State Internal Revenue Service", focus: "Tax", phone: "0803-000-0000" },
    ],
    laws: [{ title: "Zamfara State Revenue Law", category: "Finance", year: 2022 }],
    highlights: ["Gold mining", "Agriculture", "Farming reforms"],
  },
};

const baseProfiles: Record<NigerianState, StateProfile> = stateProfilesRaw;

/** Bundled profiles with research-sourced governance metadata layered on top. */
export const stateProfiles: Record<NigerianState, StateProfile> = Object.fromEntries(
  (Object.entries(baseProfiles) as [NigerianState, StateProfile][]).map(([state, profile]) => [
    state,
    { ...profile, ...stateGovernanceMeta[state] },
  ]),
) as Record<NigerianState, StateProfile>;

export function getStateProfile(state: string): StateProfile | null {
  return stateProfiles[state as NigerianState] ?? null;
}
