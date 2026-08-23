import type { NigerianState } from "@/data/states";

/**
 * Governor portrait URLs from RESEARCH.md (Aug 2026).
 * Osun and Sokoto omitted — research attached the wrong predecessor's photo.
 * Wikimedia entries are preferred where available.
 */
export const stateGovernorPhotos: Partial<Record<NigerianState, string>> = {
  Abia: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Alex_Otti_Official_Portrait.jpg",
  Adamawa: "https://adamawastate.gov.ng/wp-content/uploads/2023/06/fintiri_portrait.jpg",
  "Akwa Ibom": "https://invest.akwaibomstate.gov.ng/wp-content/uploads/2023/06/umo_eno.jpg",
  Anambra: "https://anambrastate.gov.ng/assets/images/soludo_official.jpg",
  Bauchi: "https://bauchistate.gov.ng/media/bala_mohammed.jpg",
  Bayelsa: "https://bayelsastate.gov.ng/images/douye_diri_portrait.jpg",
  Benue: "https://benuestate.gov.ng/media/fr_alia_official.jpg",
  Borno: "https://bornostate.gov.ng/wp-content/uploads/2023/05/prof_zulum.jpg",
  "Cross River": "https://dppib.cr.gov.ng/images/bassey_otu_portrait.jpg",
  Delta: "https://deltastate.gov.ng/wp-content/uploads/2023/06/sheriff_oborevwori.jpg",
  Ebonyi: "https://ebonyistate.gov.ng/media/nwifuru_official.jpg",
  Edo: "https://edostate.gov.ng/images/monday_okpebholo.jpg",
  Ekiti: "https://ekitistate.gov.ng/wp-content/uploads/2022/10/oyebanji_portrait.jpg",
  Enugu: "https://enugustate.gov.ng/media/peter_mbah_portrait.jpg",
  FCT: "https://fct.gov.ng/images/nyesom_wike_minister.jpg",
  Gombe: "https://gombestate.gov.ng/images/inuwa_yahaya.jpg",
  Imo: "https://imostate.gov.ng/wp-content/uploads/2024/01/hope_uzodinma.jpg",
  Jigawa: "https://jigawastate.gov.ng/images/umar_namadi.jpg",
  Kaduna: "https://kdsg.gov.ng/wp-content/uploads/2023/06/uba_sani_portrait.jpg",
  Kano: "https://kanostate.gov.ng/images/abba_kabir_yusuf.jpg",
  Katsina: "https://katsinastate.gov.ng/wp-content/uploads/2023/06/dikko_radda.jpg",
  Kebbi: "https://kebbistate.gov.ng/images/nasir_idris.jpg",
  Kogi: "https://kogistate.gov.ng/media/ahmed_ododo.jpg",
  Kwara: "https://upload.wikimedia.org/wikipedia/commons/8/87/AbdulRahman_AbdulRasaq_%28cropped%29.jpg",
  Lagos: "https://upload.wikimedia.org/wikipedia/commons/e/e4/Babajide_sanwo_olu_official_portrait.jpg",
  Nasarawa: "https://nasarawastate.gov.ng/images/abdullahi_sule.jpg",
  Niger: "https://nigerstate.gov.ng/wp-content/uploads/2023/06/bago_portrait.jpg",
  Ogun: "https://ogunstate.gov.ng/images/dapo_abiodun.jpg",
  Ondo: "https://ondostate.gov.ng/media/lucky_aiyedatiwa.jpg",
  Oyo: "https://oyostate.gov.ng/images/seyi_makinde.jpg",
  Plateau: "https://plateaustate.gov.ng/media/caleb_mutfwang.jpg",
  Rivers: "https://riversstate.gov.ng/images/sim_fubara.jpg",
  Taraba: "https://tarabastate.gov.ng/media/agbu_kefas.jpg",
  Yobe: "https://yobestate.gov.ng/images/mai_mala_buni.jpg",
  Zamfara: "https://zamfarastate.gov.ng/media/dauda_lawal.jpg",
};
