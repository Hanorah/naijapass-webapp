export const marketplaceCategories = [
  { id: "construction", label: "Construction" },
  { id: "logistics", label: "Logistics" },
  { id: "it", label: "IT & Services" },
  { id: "manufacturing", label: "Manufacturing" },
] as const;

export type MarketplaceCategory = (typeof marketplaceCategories)[number]["id"];

export type ListingStatus = "live" | "pending" | "hidden";

export type WebsiteMode = "url" | "request-build" | "none";

export type MarketplaceListing = {
  id: string;
  name: string;
  category: MarketplaceCategory;
  subcategory: string;
  rating: number;
  reviews: number;
  location: string;
  state: string;
  lga: string;
  distance: string;
  topRated?: boolean;
  integrated?: boolean;
  ownerEmail?: string;
  status: ListingStatus;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  websiteMode?: WebsiteMode;
  image?: string;
  services?: string[];
  yearFounded?: string;
  employees?: string;
  verified?: boolean;
};

export const marketplaceLgas: Record<string, string[]> = {
  FCT: [
    "All LGAs",
    "Municipal",
    "Gwagwalada",
    "Bwari",
    "Kuje",
    "Kwali",
    "Abaji",
  ],
  Lagos: [
    "All LGAs",
    "Eti-Osa",
    "Ikeja",
    "Lagos Island",
    "Surulere",
    "Alimosho",
  ],
  Kano: ["All LGAs", "Kano Municipal", "Nassarawa", "Fagge", "Tarauni"],
  Rivers: ["All LGAs", "Port Harcourt", "Obio-Akpor", "Eleme"],
  Edo: ["All LGAs", "Oredo", "Egor", "Ikpoba-Okha", "Ovia North-East"],
};

const defaultImage =
  "/pexels-meshack-emmanuel-kazanshyi-1267432081-29832529.jpg";

export const seedMarketplaceListings: MarketplaceListing[] = [
  {
    id: "julius-berger",
    name: "Julius Berger Nigeria",
    category: "construction",
    subcategory: "Heavy Construction & Engineering",
    rating: 4.8,
    reviews: 124,
    location: "Central Area, Abuja",
    state: "FCT",
    lga: "Municipal",
    distance: "2.4 km",
    topRated: true,
    integrated: true,
    status: "live",
    verified: true,
    description:
      "Leading civil engineering and construction firm delivering roads, bridges, and public infrastructure across Nigeria.",
    phone: "+234 9 461 3000",
    email: "info@julius-berger.com",
    website: "https://www.julius-berger.com",
    websiteMode: "url",
    image:
      "/pexels-harrun-muhammad-116282236-33806113.jpg",
    services: ["Highways", "Bridges", "Building construction", "Project management"],
    yearFounded: "1970",
    employees: "5,000+",
  },
  {
    id: "gig-logistics",
    name: "GIG Logistics",
    category: "logistics",
    subcategory: "Freight & Material Transport",
    rating: 4.2,
    reviews: 89,
    location: "Utako, Abuja",
    state: "FCT",
    lga: "Municipal",
    distance: "5.1 km",
    status: "live",
    verified: true,
    description:
      "Nationwide freight and last-mile logistics for contractors and government supply chains.",
    phone: "+234 700 444 4444",
    websiteMode: "request-build",
    image:
      "/pexels-shotbywrz-734724649-18431682.jpg",
    services: ["Freight", "Warehousing", "Last-mile delivery"],
    yearFounded: "2006",
    employees: "1,000+",
  },
  {
    id: "dangote-cement-idu",
    name: "Dangote Cement Depot",
    category: "manufacturing",
    subcategory: "Building Materials",
    rating: 3.8,
    reviews: 45,
    location: "Idu Industrial, Abuja",
    state: "FCT",
    lga: "Municipal",
    distance: "8.6 km",
    status: "live",
    verified: true,
    description: "Bulk cement and building materials supply for public and private works.",
    phone: "+234 1 448 0810",
    website: "https://www.dangotecement.com",
    websiteMode: "url",
    image: defaultImage,
    services: ["Cement supply", "Bulk orders", "Dealer network"],
    yearFounded: "1992",
    employees: "10,000+",
  },
  {
    id: "ccecc-nigeria",
    name: "CCECC Nigeria Limited",
    category: "construction",
    subcategory: "Civil Works & Rail",
    rating: 4.5,
    reviews: 67,
    location: "Wuse 2, Abuja",
    state: "FCT",
    lga: "Municipal",
    distance: "3.8 km",
    integrated: true,
    status: "live",
    verified: true,
    description:
      "Civil works and rail infrastructure contractor with active federal and state project portfolios.",
    phone: "+234 9 291 4000",
    websiteMode: "none",
    image:
      "/pexels-daggash-farhan-1851897902-30220079.jpg",
    services: ["Rail", "Civil works", "Urban infrastructure"],
    yearFounded: "1981",
    employees: "2,000+",
  },
  {
    id: "andela-lagos",
    name: "Andela Nigeria",
    category: "it",
    subcategory: "Software Engineering Services",
    rating: 4.7,
    reviews: 112,
    location: "Victoria Island, Lagos",
    state: "Lagos",
    lga: "Eti-Osa",
    distance: "1.2 km",
    topRated: true,
    integrated: true,
    status: "live",
    verified: true,
    description:
      "Software engineering and digital transformation partner for government and enterprise platforms.",
    phone: "+234 1 700 0000",
    website: "https://andela.com",
    websiteMode: "url",
    image:
      "/pexels-daggash-farhan-1851897902-30220079.jpg",
    services: ["Software engineering", "Cloud", "Product teams"],
    yearFounded: "2014",
    employees: "500+",
  },
  {
    id: "red-star-express",
    name: "Red Star Express",
    category: "logistics",
    subcategory: "Courier & Last-Mile Delivery",
    rating: 4.1,
    reviews: 203,
    location: "Ikeja, Lagos",
    state: "Lagos",
    lga: "Ikeja",
    distance: "4.0 km",
    status: "live",
    verified: true,
    description: "Courier and express logistics across Nigeria’s major corridors.",
    phone: "+234 1 271 5555",
    website: "https://www.redstarplc.com",
    websiteMode: "url",
    image:
      "/pexels-shotbywrz-734724649-18431682.jpg",
    services: ["Courier", "Express freight", "Mailroom"],
    yearFounded: "1992",
    employees: "2,500+",
  },
  {
    id: "systemspecs",
    name: "SystemSpecs",
    category: "it",
    subcategory: "Payments & Enterprise Software",
    rating: 4.6,
    reviews: 58,
    location: "Yaba, Lagos",
    state: "Lagos",
    lga: "Lagos Island",
    distance: "6.3 km",
    integrated: true,
    status: "live",
    verified: true,
    description:
      "Enterprise payments and government technology solutions including Remita integrations.",
    phone: "+234 1 271 6000",
    website: "https://www.systemspecs.com.ng",
    websiteMode: "url",
    image:
      "/pexels-meshack-emmanuel-kazanshyi-1267432081-29832529.jpg",
    services: ["Payments", "ERP", "GovTech"],
    yearFounded: "1991",
    employees: "300+",
  },
  {
    id: "dangote-refinery-logistics",
    name: "Dangote Industries Logistics",
    category: "logistics",
    subcategory: "Bulk Freight & Port Haulage",
    rating: 4.0,
    reviews: 41,
    location: "Lekki Free Zone",
    state: "Lagos",
    lga: "Eti-Osa",
    distance: "18 km",
    status: "live",
    verified: true,
    description: "Bulk freight and port haulage supporting industrial and public projects.",
    websiteMode: "request-build",
    image:
      "/pexels-daggash-farhan-1851897902-30220079.jpg",
    services: ["Port haulage", "Bulk freight", "Fleet"],
    yearFounded: "2010",
    employees: "1,500+",
  },
  {
    id: "kano-roads-ltd",
    name: "Kano Roads & Civil Works",
    category: "construction",
    subcategory: "Road Construction",
    rating: 4.4,
    reviews: 67,
    location: "Nassarawa, Kano",
    state: "Kano",
    lga: "Nassarawa",
    distance: "3.1 km",
    status: "live",
    verified: true,
    description:
      "State and LGA road rehabilitation, drainage, and pavement marking for northern corridors.",
    phone: "+234 803 200 1100",
    websiteMode: "request-build",
    image:
      "/pexels-shotbywrz-734724649-18431669.jpg",
    services: ["Roads", "Drainage", "Asphalt"],
    yearFounded: "2008",
    employees: "220+",
  },
  {
    id: "arewa-tech-labs",
    name: "Arewa Tech Labs",
    category: "it",
    subcategory: "Civic Software",
    rating: 4.5,
    reviews: 39,
    location: "Kano Municipal",
    state: "Kano",
    lga: "Kano Municipal",
    distance: "1.8 km",
    status: "live",
    verified: true,
    integrated: true,
    description: "Digital registries, land systems, and citizen portals for northern states.",
    phone: "+234 806 441 2200",
    website: "https://example.com",
    websiteMode: "url",
    image:
      "/pexels-harrun-muhammad-116282236-33806113.jpg",
    services: ["GovTech", "Mobile apps", "Data platforms"],
    yearFounded: "2016",
    employees: "80+",
  },
  {
    id: "rivers-marine-logistics",
    name: "Rivers Marine Logistics",
    category: "logistics",
    subcategory: "Port & Marine Haulage",
    rating: 4.3,
    reviews: 54,
    location: "Port Harcourt",
    state: "Rivers",
    lga: "Port Harcourt",
    distance: "2.2 km",
    status: "live",
    verified: true,
    description: "Port haulage, barge support, and industrial logistics for South-South projects.",
    phone: "+234 803 900 4400",
    websiteMode: "request-build",
    image:
      "/pexels-shotbywrz-734724649-18431682.jpg",
    services: ["Port haulage", "Barge", "Warehousing"],
    yearFounded: "2004",
    employees: "350+",
  },
  {
    id: "ph-steel-works",
    name: "PH Steel & Fabrication",
    category: "manufacturing",
    subcategory: "Steel Fabrication",
    rating: 4.2,
    reviews: 28,
    location: "Eleme, Rivers",
    state: "Rivers",
    lga: "Eleme",
    distance: "9.4 km",
    status: "live",
    verified: true,
    description: "Structural steel, tanks, and fabrication for energy and public works.",
    phone: "+234 805 112 7788",
    websiteMode: "none",
    image:
      "/pexels-harrun-muhammad-116282236-33806113.jpg",
    services: ["Fabrication", "Welding", "Structural steel"],
    yearFounded: "1999",
    employees: "160+",
  },
  {
    id: "edo-civic-build",
    name: "Edo Civic Builders",
    category: "construction",
    subcategory: "Public Buildings",
    rating: 4.6,
    reviews: 71,
    location: "Oredo, Benin City",
    state: "Edo",
    lga: "Oredo",
    distance: "1.5 km",
    topRated: true,
    status: "live",
    verified: true,
    description: "Schools, clinics, and LGA facilities across Edo with verified delivery records.",
    phone: "+234 802 555 0190",
    websiteMode: "request-build",
    image:
      "/pexels-harrun-muhammad-116282236-33806113.jpg",
    services: ["Public buildings", "Retrofits", "Fit-out"],
    yearFounded: "2011",
    employees: "190+",
  },
  {
    id: "benin-fleet-services",
    name: "Benin Fleet Services",
    category: "logistics",
    subcategory: "Fleet & Plant Hire",
    rating: 4.1,
    reviews: 33,
    location: "Egor, Benin City",
    state: "Edo",
    lga: "Egor",
    distance: "4.7 km",
    status: "live",
    verified: true,
    description: "Plant hire and fleet support for road and sanitation contracts in Edo State.",
    phone: "+234 807 330 2211",
    websiteMode: "none",
    image:
      "/pexels-harrun-muhammad-116282236-33806113.jpg",
    services: ["Plant hire", "Tippers", "Crew transport"],
    yearFounded: "2013",
    employees: "95+",
  },
];

export const businessTypes = [
  "Sole Proprietorship",
  "Business Name (BN)",
  "Private Limited (Ltd)",
  "Public Limited (PLC)",
  "Partnership",
  "Incorporated Trustees",
];

export function stateDisplayName(state: string) {
  return state === "FCT" ? "Abuja (FCT)" : state;
}

export function getListingById(
  listings: MarketplaceListing[],
  id: string,
): MarketplaceListing | undefined {
  return listings.find((item) => item.id === id);
}
