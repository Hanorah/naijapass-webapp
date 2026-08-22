export const directoryCategories = [
  { id: "hospitality", label: "Hospitality", icon: "bed" },
  { id: "health", label: "Health & Medical", icon: "plus" },
  { id: "retail", label: "Retail & Commerce", icon: "bag" },
  { id: "professional", label: "Professional Services", icon: "briefcase" },
  { id: "education", label: "Education", icon: "grad" },
  { id: "transport", label: "Transport", icon: "truck" },
] as const;

export type DirectoryCategory = (typeof directoryCategories)[number]["id"];

export type WebsiteMode = "url" | "request-build" | "none";

export type Business = {
  id: string;
  name: string;
  category: DirectoryCategory;
  subcategory: string;
  rating: number;
  reviews: number;
  address: string;
  lga: string;
  state: string;
  hours: string;
  openNow: boolean;
  verified: boolean;
  pos: boolean;
  tags: string[];
  phone: string;
  image: string;
  description?: string;
  email?: string;
  website?: string;
  websiteMode?: WebsiteMode;
  services?: string[];
  yearFounded?: string;
  employees?: string;
};

export function getBusinessById(id: string): Business | undefined {
  return businesses.find((b) => b.id === id);
}

export const businesses: Business[] = [
  {
    id: "eko-signature",
    name: "Eko Signature Hotel & Suites",
    category: "hospitality",
    subcategory: "Hotel",
    rating: 4.8,
    reviews: 312,
    address: "Victoria Island, Lagos",
    lga: "Eti-Osa",
    state: "Lagos",
    hours: "Open 24/7",
    openNow: true,
    verified: true,
    pos: true,
    tags: ["POS", "Free Wi-Fi", "Parking"],
    phone: "+234 201 277 0000",
    email: "reservations@ekohotels.com",
    website: "https://www.ekohotels.com",
    websiteMode: "url",
    description:
      "Premium hospitality and conference facilities serving government, corporate, and civic events in Lagos.",
    services: ["Accommodation", "Conference halls", "Catering", "Event planning"],
    yearFounded: "1977",
    employees: "800+",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "radisson-blu",
    name: "Radisson Blu Anchorage",
    category: "hospitality",
    subcategory: "Hotel",
    rating: 4.6,
    reviews: 198,
    address: "Ozumba Mbadiwe, VI",
    lga: "Eti-Osa",
    state: "Lagos",
    hours: "Open 24/7",
    openNow: true,
    verified: true,
    pos: true,
    tags: ["POS", "Free Wi-Fi", "Pool"],
    phone: "+234 201 277 1100",
    image:
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "lagoon-hospital",
    name: "Lagoon Hospitals",
    category: "health",
    subcategory: "Hospital",
    rating: 4.5,
    reviews: 421,
    address: "Ikoyi, Lagos",
    lga: "Eti-Osa",
    state: "Lagos",
    hours: "Open 24/7",
    openNow: true,
    verified: true,
    pos: true,
    tags: ["POS", "Emergency", "Pharmacy"],
    phone: "+234 201 271 1000",
    image:
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "palms-mall",
    name: "The Palms Shopping Mall",
    category: "retail",
    subcategory: "Mall",
    rating: 4.3,
    reviews: 880,
    address: "Lekki, Lagos",
    lga: "Eti-Osa",
    state: "Lagos",
    hours: "Closes 9:00 PM",
    openNow: true,
    verified: true,
    pos: true,
    tags: ["POS", "Parking", "Food Court"],
    phone: "+234 201 270 0001",
    image:
      "https://images.unsplash.com/photo-1519567241046-7f0346c72a4d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "pwc-lagos",
    name: "PwC Nigeria",
    category: "professional",
    subcategory: "Consulting",
    rating: 4.7,
    reviews: 64,
    address: "Landmark Towers, VI",
    lga: "Eti-Osa",
    state: "Lagos",
    hours: "Closes 6:00 PM",
    openNow: false,
    verified: true,
    pos: false,
    tags: ["Advisory", "Tax", "Audit"],
    phone: "+234 201 271 1700",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "ikeja-city-mall",
    name: "Ikeja City Mall",
    category: "retail",
    subcategory: "Mall",
    rating: 4.2,
    reviews: 1024,
    address: "Alausa, Ikeja",
    lga: "Ikeja",
    state: "Lagos",
    hours: "Closes 9:00 PM",
    openNow: true,
    verified: true,
    pos: true,
    tags: ["POS", "Cinema", "Free Wi-Fi"],
    phone: "+234 201 460 0000",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "eko-hotel",
    name: "Eko Hotel & Suites",
    category: "hospitality",
    subcategory: "Hotel",
    rating: 4.4,
    reviews: 540,
    address: "Adetokunbo Ademola, VI",
    lga: "Eti-Osa",
    state: "Lagos",
    hours: "Open 24/7",
    openNow: true,
    verified: true,
    pos: true,
    tags: ["POS", "Conference", "Beach"],
    phone: "+234 201 277 7000",
    image:
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "redemption-camp-clinic",
    name: "Reddington Hospital",
    category: "health",
    subcategory: "Hospital",
    rating: 4.4,
    reviews: 210,
    address: "Victoria Island, Lagos",
    lga: "Eti-Osa",
    state: "Lagos",
    hours: "Open 24/7",
    openNow: true,
    verified: false,
    pos: true,
    tags: ["POS", "Lab", "Delivery"],
    phone: "+234 201 280 1260",
    image:
      "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "abuja-continental",
    name: "Transcorp Hilton Abuja",
    category: "hospitality",
    subcategory: "Hotel",
    rating: 4.7,
    reviews: 420,
    address: "Maitama, Abuja",
    lga: "Municipal",
    state: "FCT",
    hours: "Open 24/7",
    openNow: true,
    verified: true,
    pos: true,
    tags: ["POS", "Conference", "Parking"],
    phone: "+234 9 461 3000",
    websiteMode: "url",
    website: "https://www.hilton.com",
    description: "Flagship hospitality and conference venue for federal and diplomatic events.",
    services: ["Accommodation", "Conference", "Catering"],
    yearFounded: "1987",
    employees: "900+",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "kano-city-clinic",
    name: "Aminu Kano Teaching Hospital Clinics",
    category: "health",
    subcategory: "Hospital",
    rating: 4.3,
    reviews: 188,
    address: "Zaria Road, Kano",
    lga: "Nassarawa",
    state: "Kano",
    hours: "Open 24/7",
    openNow: true,
    verified: true,
    pos: true,
    tags: ["POS", "Lab", "Emergency"],
    phone: "+234 64 200 000",
    description: "Teaching hospital clinics serving Kano and surrounding LGAs.",
    services: ["Outpatient", "Diagnostics", "Emergency"],
    yearFounded: "1988",
    employees: "2,000+",
    image:
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "ph-oil-services",
    name: "Port Harcourt Civic Supplies",
    category: "retail",
    subcategory: "Industrial Supplies",
    rating: 4.2,
    reviews: 64,
    address: "Trans-Amadi, Port Harcourt",
    lga: "Port Harcourt",
    state: "Rivers",
    hours: "Mon–Sat 8am–6pm",
    openNow: true,
    verified: true,
    pos: true,
    tags: ["POS", "Bulk", "Delivery"],
    phone: "+234 803 555 0199",
    description: "Industrial and civic project supplies for Rivers State contractors.",
    services: ["PPE", "Hardware", "Delivery"],
    yearFounded: "2005",
    employees: "120+",
    image:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "benin-legal-chambers",
    name: "Benin Civic Chambers",
    category: "professional",
    subcategory: "Legal Services",
    rating: 4.5,
    reviews: 47,
    address: "Ring Road, Benin City",
    lga: "Oredo",
    state: "Edo",
    hours: "Mon–Fri 9am–5pm",
    openNow: true,
    verified: true,
    pos: false,
    tags: ["Contracts", "Advisory"],
    phone: "+234 802 111 3344",
    description: "Procurement advisory and contract counsel for Edo public-sector work.",
    services: ["Contracts", "Compliance", "Dispute support"],
    yearFounded: "2012",
    employees: "25+",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
  },
];

export const directoryLgasByState: Record<string, string[]> = {
  Lagos: [
    "All LGAs",
    "Eti-Osa",
    "Ikeja",
    "Surulere",
    "Alimosho",
    "Lagos Island",
  ],
  FCT: ["All LGAs", "Municipal", "Gwagwalada", "Bwari"],
  Kano: ["All LGAs", "Kano Municipal", "Nassarawa", "Fagge"],
  Rivers: ["All LGAs", "Port Harcourt", "Obio-Akpor", "Eleme"],
  Edo: ["All LGAs", "Oredo", "Egor", "Ikpoba-Okha"],
};

export const lagosLgas = directoryLgasByState.Lagos;
