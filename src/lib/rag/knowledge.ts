import { stateProfiles } from "@/data/stateProfiles";
import { federalTenders } from "@/data/federalTenders";
import type { NigerianState } from "@/data/states";

type KnowledgeChunk = {
  id: string;
  state?: NigerianState;
  category: string;
  text: string;
  keywords: string[];
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

function buildChunks(): KnowledgeChunk[] {
  const chunks: KnowledgeChunk[] = [];

  for (const profile of Object.values(stateProfiles)) {
    chunks.push({
      id: `${profile.state}-overview`,
      state: profile.state,
      category: "overview",
      text: `${profile.state} (${profile.slogan}): Capital is ${profile.capital}. Governor: ${profile.governor} (${profile.party}). Zone: ${profile.zone}. Population: ~${profile.population}. ${profile.lgas} LGAs.${profile.officialPortal ? ` Official website: ${profile.officialPortal}.` : ""}${profile.procurementPortal ? ` Procurement portal: ${profile.procurementPortal}.` : ""} Key sectors: ${profile.highlights.join(", ")}.`,
      keywords: tokenize(`${profile.state} ${profile.capital} ${profile.governor} ${profile.slogan}`),
    });

    chunks.push({
      id: `${profile.state}-emergency`,
      state: profile.state,
      category: "emergency",
      text: `Emergency contacts in ${profile.state}: National emergency line 112. State police: ${profile.emergency.police}. Fire service: ${profile.emergency.fire}. Ambulance: ${profile.emergency.ambulance}. Open the Emergency section in NaijaPass for hospitals and stations near you.`,
      keywords: tokenize(`emergency police fire ambulance hospital ${profile.state}`),
    });

    for (const mda of profile.mdas) {
      chunks.push({
        id: `${profile.state}-mda-${mda.name.slice(0, 20)}`,
        state: profile.state,
        category: "mda",
        text: `${mda.name} (${profile.state}): ${mda.focus}. Contact: ${mda.phone}. Find full MDA directory in State Hub.`,
        keywords: tokenize(`${mda.name} ${mda.focus} permit license ${profile.state}`),
      });
    }

    for (const law of profile.laws) {
      chunks.push({
        id: `${profile.state}-law-${law.year}`,
        state: profile.state,
        category: "law",
        text: `${law.title} (${law.category}, ${law.year}) — ${profile.state} state law. Search State Hub for the full document.`,
        keywords: tokenize(`${law.title} ${law.category} law permit ${profile.state}`),
      });
    }
  }

  for (const tender of federalTenders) {
    chunks.push({
      id: `tender-${tender.reference}`,
      state: tender.state as NigerianState | undefined,
      category: "procurement",
      text: `Tender: ${tender.title}. Reference: ${tender.reference}. Agency: ${tender.mda}. State: ${tender.state ?? "Federal"}. Sector: ${tender.sector}. Value: ₦${tender.value.toLocaleString()}. Deadline: ${tender.deadline}. Status: ${tender.status}.`,
      keywords: tokenize(`${tender.title} ${tender.sector} tender bid contract procurement ${tender.state}`),
    });
  }

  chunks.push({
    id: "general-help",
    category: "help",
    text: "NaijaPass helps you find state laws, emergency contacts, open tenders, and verified businesses across Nigeria's 36 states and FCT. Use State Hub for laws and MDAs, Procurement for tenders, Directory for businesses, and Emergency for contacts.",
    keywords: tokenize("help naijapass portal state hub procurement directory emergency"),
  });

  return chunks;
}

let cachedChunks: KnowledgeChunk[] | null = null;

function getChunks(): KnowledgeChunk[] {
  if (!cachedChunks) cachedChunks = buildChunks();
  return cachedChunks;
}

export function retrieveContext(query: string, state: string, limit = 5): string {
  const queryTokens = tokenize(query);
  const chunks = getChunks();

  const scored = chunks
    .map((chunk) => {
      let score = 0;
      for (const qt of queryTokens) {
        if (chunk.keywords.some((k) => k.includes(qt) || qt.includes(k))) score += 2;
        if (chunk.text.toLowerCase().includes(qt)) score += 1;
      }
      if (chunk.state === state) score += 4;
      if (chunk.category === "emergency" && queryTokens.some((t) => ["emergency", "police", "hospital", "fire", "ambulance"].includes(t))) {
        score += 5;
      }
      if (chunk.category === "procurement" && queryTokens.some((t) => ["tender", "bid", "contract", "procurement", "rfp"].includes(t))) {
        score += 5;
      }
      return { chunk, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  if (scored.length === 0) {
    const profile = stateProfiles[state as NigerianState];
    if (profile) {
      return `${profile.state} (${profile.slogan}): Governor ${profile.governor}. Capital: ${profile.capital}. For emergencies dial 112 or state police ${profile.emergency.police}.`;
    }
    return "Check State Hub, Procurement, or Emergency in the portal for details.";
  }

  return scored.map((s) => s.chunk.text).join("\n\n");
}

export function ragAnswer(query: string, state: string): string {
  const q = query.toLowerCase();
  const profile = stateProfiles[state as NigerianState];

  if (!profile) {
    return "Pick your state from the header dropdown, then ask again.";
  }

  if (q.includes("emergency") || q.includes("police") || q.includes("hospital") || q.includes("fire")) {
    return `In ${profile.state}, dial 112 for national emergency. State police: ${profile.emergency.police}. Fire: ${profile.emergency.fire}. Ambulance: ${profile.emergency.ambulance}. Open Emergency in the portal for hospitals and stations near you.`;
  }

  if (q.includes("tender") || q.includes("contract") || q.includes("bid") || q.includes("procurement")) {
    const context = retrieveContext(query, state, 3);
    return `Here's what's open for ${profile.state}:\n\n${context}\n\nOpen Procurement for the full list with deadlines and documents.`;
  }

  if (q.includes("permit") || q.includes("law") || q.includes("licence") || q.includes("license")) {
    const mdaList = profile.mdas.map((m) => `• ${m.name} — ${m.focus} (${m.phone})`).join("\n");
    return `For permits and laws in ${profile.state}, start with these agencies:\n\n${mdaList}\n\nState Hub has the full regulatory library for ${profile.governor}'s administration.`;
  }

  if (q.includes("governor") || q.includes("capital") || q.includes("who is")) {
    return `${profile.state} (${profile.slogan}): Governor ${profile.governor} (${profile.party}). Capital: ${profile.capital}. ${profile.lgas} LGAs, ~${profile.population} people. Known for: ${profile.highlights.join(", ")}.`;
  }

  const context = retrieveContext(query, state, 4);
  return `Here's what I found for ${profile.state}:\n\n${context}`;
}
