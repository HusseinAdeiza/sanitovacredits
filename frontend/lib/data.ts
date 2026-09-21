// Demo/seed data per the OKX Dev Day brief. The FRONTEND reads live on-chain
// state (supply, balances, purchases, retirements) from the deployed contract;
// this table mirrors the seeded metadata (name, location, coordinates, price,
// initial supply) and adds the UI-only category + the "NGO PDF" before-state.
// Coordinates = real Nigerian state capitals (WGS84).

export type Category = "water" | "sanitation" | "waste" | "health";

export const CATEGORY_META: Record<Category, { label: string; color: string; desc: string }> = {
  water:      { label: "Safe Water",       color: "#16a34a", desc: "Households gaining safe water access" },
  sanitation: { label: "Sanitation",       color: "#2563eb", desc: "Latrines and safe sanitation built" },
  waste:      { label: "Waste Treatment",  color: "#ea580c", desc: "Tons of waste safely treated" },
  health:     { label: "Public Health",    color: "#dc2626", desc: "Disease cases prevented" },
};

export type SeedCredit = {
  id: number;
  name: string;
  location: string;
  lat: number;
  lng: number;
  impactUnit: string;
  pricePerUnitOKB: string;
  initialSupply: number;
  category: Category;
  // The "before" state: the unverifiable NGO PDF this replaces.
  pdf: {
    org: string;
    title: string;
    period: string;
    claim: string;
    pages: number;
    verification: string; // how (poorly) it was verified
  };
};

export const SEED_CREDITS: SeedCredit[] = [
  {
    id: 0,
    name: "Safe Water Access — Kogi State",
    location: "Lokoja, Kogi State, Nigeria",
    lat: 7.8, lng: 6.74,
    impactUnit: "households served",
    pricePerUnitOKB: "0.001",
    initialSupply: 1000,
    category: "water",
    pdf: {
      org: "Rural Water NGO",
      title: "Borehole & Borehole Rehabilitation Report — 2026 Q2",
      period: "Jan – Jun 2026",
      claim: "1,000 households now have access to a functional borehole within 2 km.",
      pages: 24,
      verification: "Self-reported by implementing partner; no third-party site inspection.",
    },
  },
  {
    id: 1,
    name: "Latrine Construction — Lagos",
    location: "Ikorodu, Lagos, Nigeria",
    lat: 6.5244, lng: 3.3792,
    impactUnit: "latrines built",
    pricePerUnitOKB: "0.002",
    initialSupply: 500,
    category: "sanitation",
    pdf: {
      org: "Community Sanitation Trust",
      title: "Vernacular Latrine Construction Completion Report",
      period: "Mar – Aug 2026",
      claim: "500 household latrines completed across 12 communities.",
      pages: 18,
      verification: "Photos attached; coordinates and counts not independently checked.",
    },
  },
  {
    id: 2,
    name: "Waste Safely Treated — Abuja",
    location: "Kwali, FCT Abuja, Nigeria",
    lat: 9.0765, lng: 7.3986,
    impactUnit: "tonnes treated",
    pricePerUnitOKB: "0.0015",
    initialSupply: 2000,
    category: "waste",
    pdf: {
      org: "Municipal Sanitation Co-op",
      title: "Solid Waste Treatment & Disposal Statement",
      period: "2026 H1",
      claim: "2,000 tonnes of mixed waste diverted from open dumping and treated.",
      pages: 12,
      verification: "Scale-tick summaries only; no chain-of-custody or lab records.",
    },
  },
  {
    id: 3,
    name: "Disease Cases Prevented — Kano",
    location: "Kano Municipal, Kano State, Nigeria",
    lat: 12.0022, lng: 8.592,
    impactUnit: "cases prevented",
    pricePerUnitOKB: "0.003",
    initialSupply: 300,
    category: "health",
    pdf: {
      org: "State Health Outreach",
      title: "WASH-linked Disease Prevention Impact Memo",
      period: "2026 YTD",
      claim: "300 projected cholera/typhoid cases averted through improved water access.",
      pages: 8,
      verification: "Modelled estimate; no reported-case baseline or surveillance data.",
    },
  },
];

// Center of the 4 demo states, framed to fit all pins (incl. Lagos far west).
export const NIGERIA_CENTER: [number, number] = [9.0, 6.3];
export const NIGERIA_ZOOM = 5;
