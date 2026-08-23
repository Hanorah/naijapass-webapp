import type { NigerianState } from "@/data/states";

/** Research-sourced governance fields merged into bundled state profiles. */
export type StateGovernanceMeta = {
  governor?: string;
  party?: string;
  officialPortal?: string;
  procurementPortal?: string;
  termEndYear?: number;
  ssg?: string;
  speaker?: string;
  /** Direct HTTPS URL to an official portrait; blank until research supplies one. */
  governorPhotoUrl?: string;
};

function portal(host: string) {
  return host.startsWith("http") ? host : `https://${host}`;
}

/**
 * Sourced from public/test research (Aug 2026).
 * Portal hostnames verified against state .gov.ng patterns where the research
 * accidentally pointed at nggovernorsforum.org (Bauchi, Rivers).
 */
export const stateGovernanceMeta: Record<NigerianState, StateGovernanceMeta> = {
  Abia: {
    governor: "Alex Otti",
    party: "LP",
    officialPortal: portal("abiastate.gov.ng"),
    termEndYear: 2027,
    speaker: "Emmanuel Ihuoma Emeruwa",
  },
  Adamawa: {
    governor: "Ahmadu Umaru Fintiri",
    party: "PDP",
    officialPortal: portal("adamawastate.gov.ng"),
    procurementPortal: portal("bpp.adamawastate.gov.ng"),
    termEndYear: 2027,
  },
  "Akwa Ibom": {
    governor: "Umo Eno",
    party: "PDP",
    officialPortal: portal("invest.akwaibomstate.gov.ng"),
    procurementPortal: portal("eprocurement.akwaibomstate.gov.ng"),
    termEndYear: 2027,
  },
  Anambra: {
    governor: "Charles Soludo",
    party: "APGA",
    officialPortal: portal("anambrastate.gov.ng"),
    termEndYear: 2026,
    speaker: "Somtochukwu Udeze",
  },
  Bauchi: {
    governor: "Bala Mohammed",
    party: "PDP",
    officialPortal: portal("bauchistate.gov.ng"),
    procurementPortal: portal("procurement.bauchistate.gov.ng"),
    termEndYear: 2027,
  },
  Bayelsa: {
    governor: "Douye Diri",
    party: "PDP",
    officialPortal: portal("bayelsastate.gov.ng"),
    procurementPortal: portal("bpp.bayelsastate.gov.ng"),
    termEndYear: 2028,
  },
  Benue: {
    governor: "Hyacinth Alia",
    party: "APC",
    officialPortal: portal("benuestate.gov.ng"),
    procurementPortal: portal("procurement.benuestate.gov.ng"),
    termEndYear: 2027,
  },
  Borno: {
    governor: "Babagana Zulum",
    party: "APC",
    officialPortal: portal("bornostate.gov.ng"),
    procurementPortal: portal("bpp.bornostate.gov.ng"),
    termEndYear: 2027,
    ssg: "Malam Bukar Tijani",
  },
  "Cross River": {
    governor: "Bassey Otu",
    party: "APC",
    officialPortal: portal("crossriverstate.gov.ng"),
    procurementPortal: portal("ocds.crossriverstate.gov.ng"),
    termEndYear: 2027,
    ssg: "Tina Banku Agbor",
  },
  Delta: {
    governor: "Sheriff Oborevwori",
    party: "PDP",
    officialPortal: portal("deltastate.gov.ng"),
    procurementPortal: portal("eprocurement.deltastate.gov.ng"),
    termEndYear: 2027,
    ssg: "Kingsley Eze Emu",
  },
  Ebonyi: {
    governor: "Francis Nwifuru",
    party: "APC",
    officialPortal: portal("ebonyistate.gov.ng"),
    termEndYear: 2027,
    ssg: "Kenneth Ugbala",
    speaker: "Moses Ije Odunwa",
  },
  Edo: {
    governor: "Monday Okpebholo",
    party: "APC",
    officialPortal: portal("edostate.gov.ng"),
    termEndYear: 2028,
  },
  Ekiti: {
    governor: "Biodun Oyebanji",
    party: "APC",
    officialPortal: portal("ekitistate.gov.ng"),
    procurementPortal: portal("bpp.ekitistate.gov.ng"),
    termEndYear: 2026,
  },
  Enugu: {
    governor: "Peter Mbah",
    party: "PDP",
    officialPortal: portal("enugustate.gov.ng"),
    procurementPortal: portal("bpp.enugustate.gov.ng"),
    termEndYear: 2027,
    speaker: "Uche Ugwu",
  },
  FCT: {
    governor: "Nyesom Wike (Minister)",
    party: "APC",
    officialPortal: portal("fct.gov.ng"),
    procurementPortal: portal("procurement.fcta.gov.ng"),
    termEndYear: 2027,
  },
  Gombe: {
    governor: "Muhammad Inuwa Yahaya",
    party: "APC",
    officialPortal: portal("gombestate.gov.ng"),
    termEndYear: 2027,
  },
  Imo: {
    governor: "Hope Uzodimma",
    party: "APC",
    officialPortal: portal("imostate.gov.ng"),
    termEndYear: 2028,
    speaker: "Chike Olemgbe",
  },
  Jigawa: {
    governor: "Umar Namadi",
    party: "APC",
    officialPortal: portal("jigawastate.gov.ng"),
    termEndYear: 2027,
    ssg: "Baba Malam Wali",
  },
  Kaduna: {
    governor: "Uba Sani",
    party: "APC",
    officialPortal: portal("kdsg.gov.ng"),
    termEndYear: 2027,
    ssg: "Abdulkadir Mayere",
  },
  Kano: {
    governor: "Abba Kabir Yusuf",
    party: "NNPP",
    officialPortal: portal("kanostate.gov.ng"),
    termEndYear: 2027,
  },
  Katsina: {
    governor: "Dikko Umar Radda",
    party: "APC",
    officialPortal: portal("katsinastate.gov.ng"),
    procurementPortal: portal("bpp.katsinastate.gov.ng"),
    termEndYear: 2027,
  },
  Kebbi: {
    governor: "Nasir Idris",
    party: "APC",
    officialPortal: portal("kebbistate.gov.ng"),
    procurementPortal: portal("procurement.kebbistate.gov.ng"),
    termEndYear: 2027,
  },
  Kogi: {
    governor: "Ahmed Usman Ododo",
    party: "APC",
    officialPortal: portal("kogistate.gov.ng"),
    procurementPortal: portal("statetenders.kogistate.gov.ng"),
    termEndYear: 2028,
    speaker: "Aliyu Umar Yusuf",
  },
  Kwara: {
    governor: "AbdulRahman AbdulRazaq",
    party: "APC",
    officialPortal: portal("kwarastate.gov.ng"),
    termEndYear: 2027,
  },
  Lagos: {
    governor: "Babajide Sanwo-Olu",
    party: "APC",
    officialPortal: portal("lagosstate.gov.ng"),
    procurementPortal: portal("lagosppa.gov.ng"),
    termEndYear: 2027,
    ssg: "Teslim Igbalaye",
    speaker: "Mudashiru Obasa",
  },
  Nasarawa: {
    governor: "Abdullahi Sule",
    party: "APC",
    officialPortal: portal("nasarawastate.gov.ng"),
    procurementPortal: portal("e-procurement.nasarawastate.gov.ng"),
    termEndYear: 2027,
  },
  Niger: {
    governor: "Mohammed Umar Bago",
    party: "APC",
    officialPortal: portal("nigerstate.gov.ng"),
    procurementPortal: portal("bpp.nigerstate.gov.ng"),
    termEndYear: 2027,
  },
  Ogun: {
    governor: "Dapo Abiodun",
    party: "APC",
    officialPortal: portal("ogunstate.gov.ng"),
    procurementPortal: portal("ogbpp.ogunstate.gov.ng"),
    termEndYear: 2027,
  },
  Ondo: {
    governor: "Lucky Aiyedatiwa",
    party: "APC",
    officialPortal: portal("ondostate.gov.ng"),
    procurementPortal: portal("odappa.ng"),
    termEndYear: 2029,
  },
  Osun: {
    governor: "Ademola Adeleke",
    party: "PDP",
    officialPortal: portal("osunstate.gov.ng"),
    procurementPortal: portal("bpp.osunstate.gov.ng"),
    termEndYear: 2026,
  },
  Oyo: {
    governor: "Seyi Makinde",
    party: "PDP",
    officialPortal: portal("oyostate.gov.ng"),
    procurementPortal: portal("bpp.oyostate.gov.ng"),
    termEndYear: 2027,
  },
  Plateau: {
    governor: "Caleb Mutfwang",
    party: "PDP",
    officialPortal: portal("plateaustate.gov.ng"),
    procurementPortal: portal("ocds.plateaustate.gov.ng"),
    termEndYear: 2027,
  },
  Rivers: {
    governor: "Siminalayi Fubara",
    party: "PDP",
    officialPortal: portal("riversstate.gov.ng"),
    procurementPortal: portal("bpp.riversstate.gov.ng"),
    termEndYear: 2027,
    ssg: "Ibibia Lucky Worika",
  },
  Sokoto: {
    governor: "Ahmad Aliyu",
    party: "APC",
    officialPortal: portal("sokotostate.gov.ng"),
    procurementPortal: portal("bpp.sokotostate.gov.ng"),
    termEndYear: 2027,
  },
  Taraba: {
    governor: "Agbu Kefas",
    party: "PDP",
    officialPortal: portal("tarabastate.gov.ng"),
    procurementPortal: portal("procurement.tarabastate.gov.ng"),
    termEndYear: 2027,
  },
  Yobe: {
    governor: "Mai Mala Buni",
    party: "APC",
    officialPortal: portal("yobestate.gov.ng"),
    procurementPortal: portal("bpp.yobestate.gov.ng"),
    termEndYear: 2027,
    ssg: "Baba Malam Wali",
  },
  Zamfara: {
    governor: "Dauda Lawal",
    party: "PDP",
    officialPortal: portal("zamfarastate.gov.ng"),
    procurementPortal: portal("bpp.zamfara.gov.ng"),
    termEndYear: 2027,
    ssg: "Abubakar M. Nakwada",
  },
};
