import farmBefore from "@/assets/farm-before.jpg";
import farmAfter from "@/assets/farm-after.jpg";

export type FarmStatus = "regenerating" | "transitioning" | "degraded";

export interface Intervention {
  label: string;
  applied: boolean;
  date?: string;
}

export interface Farm {
  id: string;
  name: string;
  farmer: string;
  location: string;
  crop: string;
  sizeHa: number;
  status: FarmStatus;
  // map coords in normalized 0..100 viewport
  x: number;
  y: number;
  soilBefore: number;
  soilNow: number;
  moistureDelta: number;   // %
  costDelta: number;       // % (negative = reduction)
  yieldSignal: "early-positive" | "stable" | "declining" | "strong-positive";
  rvs: number;
  rvsBreakdown: { soil: number; yield: number; cost: number; adoption: number };
  interventions: Intervention[];
  nextRecommendation: string;
  beforeImage: string;
  afterImage: string;
  feedback: string;
  daysInProgram: number;
}

export const farms: Farm[] = [
  {
    id: "F-002",
    name: "Farm #2 — Wanjiru Plot",
    farmer: "Mary Wanjiru",
    location: "Kiambu, Nairobi peri-urban",
    crop: "Maize + beans (intercrop)",
    sizeHa: 0.6,
    status: "regenerating",
    x: 38, y: 42,
    soilBefore: 42, soilNow: 58,
    moistureDelta: 15, costDelta: -10, yieldSignal: "early-positive",
    rvs: 72,
    rvsBreakdown: { soil: 40, yield: 25, cost: 20, adoption: 15 },
    interventions: [
      { label: "Compost", applied: true, date: "Day 3" },
      { label: "Mulch", applied: true, date: "Day 7" },
      { label: "Water optimization", applied: false },
    ],
    nextRecommendation: "Increase compost density in north plot",
    beforeImage: farmBefore,
    afterImage: farmAfter,
    feedback: "Soil softer, easier to work",
    daysInProgram: 12,
  },
  {
    id: "F-003",
    name: "Farm #3 — Otieno Plot",
    farmer: "Samuel Otieno",
    location: "Kasarani, Nairobi peri-urban",
    crop: "Kale, spinach",
    sizeHa: 0.3,
    status: "regenerating",
    x: 56, y: 30,
    soilBefore: 38, soilNow: 54,
    moistureDelta: 18, costDelta: -12, yieldSignal: "strong-positive",
    rvs: 78,
    rvsBreakdown: { soil: 42, yield: 28, cost: 22, adoption: 15 },
    interventions: [
      { label: "Compost", applied: true, date: "Today" },
      { label: "Mulch", applied: true, date: "Day 5" },
      { label: "Water optimization", applied: true, date: "Day 9" },
    ],
    nextRecommendation: "Begin cover-cropping legumes between rows",
    beforeImage: farmBefore,
    afterImage: farmAfter,
    feedback: "Greens recovering visibly week over week",
    daysInProgram: 14,
  },
  {
    id: "F-007",
    name: "Farm #7 — Achieng Plot",
    farmer: "Grace Achieng",
    location: "Ruai, Nairobi peri-urban",
    crop: "Maize",
    sizeHa: 0.8,
    status: "degraded",
    x: 72, y: 64,
    soilBefore: 35, soilNow: 33,
    moistureDelta: -4, costDelta: 0, yieldSignal: "declining",
    rvs: 28,
    rvsBreakdown: { soil: 14, yield: 4, cost: 4, adoption: 6 },
    interventions: [
      { label: "Compost", applied: false },
      { label: "Mulch", applied: false },
      { label: "Water optimization", applied: false },
    ],
    nextRecommendation: "Urgent: apply compost + mulch within 5 days",
    beforeImage: farmBefore,
    afterImage: farmBefore,
    feedback: "Worried about next season",
    daysInProgram: 4,
  },
  {
    id: "F-011",
    name: "Farm #11 — Mwangi Plot",
    farmer: "Peter Mwangi",
    location: "Limuru, Nairobi peri-urban",
    crop: "Tomato",
    sizeHa: 0.4,
    status: "transitioning",
    x: 28, y: 60,
    soilBefore: 40, soilNow: 47,
    moistureDelta: 8, costDelta: -5, yieldSignal: "stable",
    rvs: 54,
    rvsBreakdown: { soil: 26, yield: 12, cost: 10, adoption: 6 },
    interventions: [
      { label: "Compost", applied: true, date: "Day 6" },
      { label: "Mulch", applied: false },
      { label: "Water optimization", applied: true, date: "Day 8" },
    ],
    nextRecommendation: "Add mulch layer to reduce evaporation",
    beforeImage: farmBefore,
    afterImage: farmAfter,
    feedback: "Watering less often now",
    daysInProgram: 10,
  },
  {
    id: "F-014",
    name: "Farm #14 — Njeri Plot",
    farmer: "Ann Njeri",
    location: "Githunguri, Nairobi peri-urban",
    crop: "Sweet potato",
    sizeHa: 0.5,
    status: "transitioning",
    x: 48, y: 70,
    soilBefore: 41, soilNow: 49,
    moistureDelta: 10, costDelta: -7, yieldSignal: "stable",
    rvs: 58,
    rvsBreakdown: { soil: 28, yield: 14, cost: 10, adoption: 6 },
    interventions: [
      { label: "Compost", applied: true, date: "Day 4" },
      { label: "Mulch", applied: true, date: "Day 9" },
      { label: "Water optimization", applied: false },
    ],
    nextRecommendation: "Install drip line on east row",
    beforeImage: farmBefore,
    afterImage: farmAfter,
    feedback: "Soil holds water longer",
    daysInProgram: 11,
  },
  {
    id: "F-019",
    name: "Farm #19 — Kamau Plot",
    farmer: "John Kamau",
    location: "Thika Rd corridor",
    crop: "Maize + cowpea",
    sizeHa: 0.7,
    status: "regenerating",
    x: 64, y: 50,
    soilBefore: 44, soilNow: 61,
    moistureDelta: 16, costDelta: -11, yieldSignal: "early-positive",
    rvs: 74,
    rvsBreakdown: { soil: 40, yield: 26, cost: 20, adoption: 14 },
    interventions: [
      { label: "Compost", applied: true, date: "Day 2" },
      { label: "Mulch", applied: true, date: "Day 6" },
      { label: "Water optimization", applied: false },
    ],
    nextRecommendation: "Add small water harvesting swale",
    beforeImage: farmBefore,
    afterImage: farmAfter,
    feedback: "Cowpea sprouting strong",
    daysInProgram: 13,
  },
  {
    id: "F-022",
    name: "Farm #22 — Akinyi Plot",
    farmer: "Lucy Akinyi",
    location: "Embakasi East",
    crop: "Kale",
    sizeHa: 0.25,
    status: "degraded",
    x: 22, y: 28,
    soilBefore: 32, soilNow: 31,
    moistureDelta: -2, costDelta: 2, yieldSignal: "declining",
    rvs: 22,
    rvsBreakdown: { soil: 10, yield: 4, cost: 2, adoption: 6 },
    interventions: [
      { label: "Compost", applied: false },
      { label: "Mulch", applied: false },
      { label: "Water optimization", applied: false },
    ],
    nextRecommendation: "Schedule field agent visit this week",
    beforeImage: farmBefore,
    afterImage: farmBefore,
    feedback: "Crop wilting again",
    daysInProgram: 3,
  },
  {
    id: "F-027",
    name: "Farm #27 — Mutiso Plot",
    farmer: "David Mutiso",
    location: "Ruiru",
    crop: "Maize",
    sizeHa: 0.55,
    status: "regenerating",
    x: 80, y: 38,
    soilBefore: 43, soilNow: 60,
    moistureDelta: 17, costDelta: -13, yieldSignal: "strong-positive",
    rvs: 80,
    rvsBreakdown: { soil: 42, yield: 28, cost: 22, adoption: 16 },
    interventions: [
      { label: "Compost", applied: true, date: "Day 3" },
      { label: "Mulch", applied: true, date: "Day 7" },
      { label: "Water optimization", applied: true, date: "Day 10" },
    ],
    nextRecommendation: "Document for case study — eligible for funding",
    beforeImage: farmBefore,
    afterImage: farmAfter,
    feedback: "Best season I have seen",
    daysInProgram: 15,
  },
];

export const witnessFeed = [
  { id: 1, time: "just now", farm: "F-003", text: "Compost applied → Farm #3", kind: "action" as const },
  { id: 2, time: "2m ago",   farm: "F-002", text: "Mary's soil moisture increased +12% (Day 10)", kind: "outcome" as const },
  { id: 3, time: "8m ago",   farm: "F-014", text: "Farmer feedback: 'Soil softer, easier to work'", kind: "voice" as const },
  { id: 4, time: "14m ago",  farm: "F-019", text: "Mulch applied → Farm #19 north strip", kind: "action" as const },
  { id: 5, time: "21m ago",  farm: "F-027", text: "Farm #27 qualifies for micro-funding", kind: "alert" as const },
  { id: 6, time: "37m ago",  farm: "F-007", text: "Soil degradation detected → Farm #7", kind: "risk" as const },
  { id: 7, time: "1h ago",   farm: "F-011", text: "Water inefficiency detected → Farm #11", kind: "risk" as const },
  { id: 8, time: "1h ago",   farm: "F-002", text: "Yield signal turned early-positive on Farm #2", kind: "outcome" as const },
  { id: 9, time: "2h ago",   farm: "F-003", text: "Field agent uploaded photo evidence — Farm #3", kind: "action" as const },
];

export const territoryMetrics = {
  soilHealth: 49,           // avg index
  soilHealthDelta: +6,
  waterRetention: 71,       // %
  waterDelta: +9,
  incomeSignal: 18,         // % uplift indicator
  incomeDelta: +4,
  loopActive: 75,           // % of farms with active regen loop
  loopDelta: +12,
  totalRVS: 466,
  rvsGrowth: 23,
  interventions: { compost: 8, mulching: 6, water: 5 },
};