import { useSyncExternalStore } from "react";
import { farms as seedFarms, witnessFeed as seedFeed, territoryMetrics as seedMetrics, Farm } from "@/data/farms";

export type FeedKind = "action" | "outcome" | "voice" | "alert" | "risk";
export interface FeedItem {
  id: number;
  time: string;
  farm: string;
  text: string;
  kind: FeedKind;
  ts: number;
}

export interface TrendPoint {
  day: number;          // 1..30
  rvs: number;
  soil: number;
  moisture: number;     // % retention
  income: number;       // % uplift
}

export interface FieldSubmission {
  id: string;
  farmId: string;
  agent: string;
  photo?: string;       // dataURL
  soilCondition: "dry" | "moist" | "saturated" | "cracked" | "dark-rich";
  moisturePct: number;  // 0..100
  notes: string;
  intervention?: "compost" | "mulch" | "water" | "none";
  ts: number;
}

interface State {
  farms: Farm[];
  feed: FeedItem[];
  trends: Record<string, TrendPoint[]>; // per farm id
  territoryTrend: TrendPoint[];
  submissions: FieldSubmission[];
  loopSyncTs: number;
}

/* -------- helpers -------- */

const seededRandom = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};

const buildTrend = (farm: Farm): TrendPoint[] => {
  const rand = seededRandom(farm.id.charCodeAt(2) * 7 + farm.rvs);
  const days = 30;
  const startRvs = Math.max(8, farm.rvs - (farm.status === "regenerating" ? 38 : farm.status === "transitioning" ? 22 : 6));
  const startSoil = farm.soilBefore;
  const startMoist = 55 + (farm.moistureDelta < 0 ? farm.moistureDelta : -farm.moistureDelta);
  const startIncome = 0;
  const pts: TrendPoint[] = [];
  for (let d = 1; d <= days; d++) {
    const t = d / days;
    const noise = (rand() - 0.5) * 3;
    const rvs = Math.max(5, Math.min(100, startRvs + (farm.rvs - startRvs) * t + noise));
    const soil = Math.max(20, Math.min(100, startSoil + (farm.soilNow - startSoil) * t + noise * 0.6));
    const moisture = Math.max(20, Math.min(100, startMoist + (farm.moistureDelta + (farm.status === "degraded" ? -5 : 10)) * t + noise));
    const income = Math.max(-10, Math.min(40, startIncome + (farm.status === "degraded" ? -2 : 18) * t + noise * 0.4));
    pts.push({ day: d, rvs: +rvs.toFixed(1), soil: +soil.toFixed(1), moisture: +moisture.toFixed(1), income: +income.toFixed(1) });
  }
  return pts;
};

const buildTerritoryTrend = (perFarm: Record<string, TrendPoint[]>): TrendPoint[] => {
  const days = 30;
  const ids = Object.keys(perFarm);
  const out: TrendPoint[] = [];
  for (let d = 1; d <= days; d++) {
    const sum = ids.reduce(
      (acc, id) => {
        const p = perFarm[id][d - 1];
        acc.rvs += p.rvs; acc.soil += p.soil; acc.moisture += p.moisture; acc.income += p.income;
        return acc;
      },
      { rvs: 0, soil: 0, moisture: 0, income: 0 },
    );
    out.push({
      day: d,
      rvs: +(sum.rvs / ids.length).toFixed(1),
      soil: +(sum.soil / ids.length).toFixed(1),
      moisture: +(sum.moisture / ids.length).toFixed(1),
      income: +(sum.income / ids.length).toFixed(1),
    });
  }
  return out;
};

const computeStatus = (rvs: number, soilDelta: number): Farm["status"] => {
  if (rvs >= 65 && soilDelta >= 6) return "regenerating";
  if (rvs <= 35 || soilDelta <= 0) return "degraded";
  return "transitioning";
};

/* -------- initial state -------- */

const trends0: Record<string, TrendPoint[]> = {};
seedFarms.forEach((f) => (trends0[f.id] = buildTrend(f)));

let state: State = {
  farms: seedFarms,
  feed: seedFeed.map((f, i) => ({ ...f, ts: Date.now() - i * 60_000 })),
  trends: trends0,
  territoryTrend: buildTerritoryTrend(trends0),
  submissions: [],
  loopSyncTs: Date.now(),
};

/* -------- pub/sub -------- */

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
const getSnapshot = () => state;

export const useSanctum = <T,>(selector: (s: State) => T): T =>
  useSyncExternalStore(subscribe, () => selector(getSnapshot()), () => selector(getSnapshot()));

/* -------- actions -------- */

let feedCounter = 1000;
const pushFeed = (item: Omit<FeedItem, "id" | "ts" | "time">) => {
  const ts = Date.now();
  const newItem: FeedItem = { ...item, id: ++feedCounter, ts, time: "just now" };
  // re-stamp older items
  const feed = [newItem, ...state.feed.slice(0, 40)].map((it) => ({ ...it, time: relTime(ts - it.ts) }));
  state = { ...state, feed, loopSyncTs: ts };
};

const relTime = (ms: number) => {
  const s = Math.floor(ms / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
};

const refreshFeedTimes = () => {
  const now = Date.now();
  state = { ...state, feed: state.feed.map((it) => ({ ...it, time: relTime(now - it.ts) })) };
  emit();
};
setInterval(refreshFeedTimes, 15_000);

export const submitFieldReport = (input: Omit<FieldSubmission, "id" | "ts">) => {
  const sub: FieldSubmission = { ...input, id: `S-${Date.now()}`, ts: Date.now() };

  const farms = state.farms.map((f) => {
    if (f.id !== sub.farmId) return f;

    // moisture delta drift toward submitted reading
    const newMoistureDelta = Math.round((f.moistureDelta + (sub.moisturePct - 55) / 4));
    // soil shift influenced by condition + intervention
    const condBoost = sub.soilCondition === "dark-rich" ? 3 : sub.soilCondition === "moist" ? 1 : sub.soilCondition === "cracked" ? -2 : sub.soilCondition === "dry" ? -1 : 0;
    const ivBoost = sub.intervention === "compost" ? 3 : sub.intervention === "mulch" ? 2 : sub.intervention === "water" ? 1 : 0;
    const newSoilNow = Math.max(20, Math.min(100, f.soilNow + condBoost + ivBoost));
    const soilDelta = newSoilNow - f.soilBefore;

    const adoptionBoost = sub.intervention && sub.intervention !== "none" ? 3 : 1;
    const newRvs = Math.max(5, Math.min(100, f.rvs + Math.round((condBoost + ivBoost + adoptionBoost) * 0.8)));

    const interventions = f.interventions.map((iv) => {
      if (sub.intervention === "compost" && iv.label === "Compost") return { ...iv, applied: true, date: "Just now" };
      if (sub.intervention === "mulch" && iv.label === "Mulch") return { ...iv, applied: true, date: "Just now" };
      if (sub.intervention === "water" && iv.label === "Water optimization") return { ...iv, applied: true, date: "Just now" };
      return iv;
    });

    return {
      ...f,
      moistureDelta: newMoistureDelta,
      soilNow: newSoilNow,
      rvs: newRvs,
      interventions,
      status: computeStatus(newRvs, soilDelta),
      feedback: sub.notes || f.feedback,
      daysInProgram: f.daysInProgram + 1,
    };
  });

  // append a synthetic data point to the trend (replace last day)
  const trends = { ...state.trends };
  const farm = farms.find((x) => x.id === sub.farmId);
  if (farm) {
    const series = trends[farm.id] ? [...trends[farm.id]] : buildTrend(farm);
    const last = series[series.length - 1];
    series[series.length - 1] = {
      ...last,
      rvs: farm.rvs,
      soil: farm.soilNow,
      moisture: Math.max(20, Math.min(100, 60 + farm.moistureDelta)),
      income: Math.max(-10, Math.min(40, last.income + 0.6)),
    };
    trends[farm.id] = series;
  }

  state = { ...state, farms, submissions: [sub, ...state.submissions], trends, territoryTrend: buildTerritoryTrend(trends) };

  // feed events
  if (sub.intervention && sub.intervention !== "none") {
    pushFeed({ farm: sub.farmId, kind: "action", text: `${labelOf(sub.intervention)} applied → ${sub.farmId} (field agent ${sub.agent})` });
  } else {
    pushFeed({ farm: sub.farmId, kind: "action", text: `Field report submitted → ${sub.farmId} (${sub.soilCondition.replace("-", " ")})` });
  }
  if (sub.notes) {
    pushFeed({ farm: sub.farmId, kind: "voice", text: `Farmer feedback: "${sub.notes}"` });
  }
  if (farm && farm.status === "regenerating") {
    pushFeed({ farm: sub.farmId, kind: "outcome", text: `${sub.farmId} crossed regenerating threshold (RVS ${farm.rvs})` });
  }
  if (farm && farm.status === "degraded") {
    pushFeed({ farm: sub.farmId, kind: "risk", text: `Risk persists at ${sub.farmId} — needs urgent intervention` });
  }

  emit();
};

const labelOf = (i: NonNullable<FieldSubmission["intervention"]>) =>
  i === "compost" ? "Compost" : i === "mulch" ? "Mulch" : "Water optimization";

/* -------- derived selectors -------- */

export const selectAlerts = (s: State) => {
  return s.farms
    .map((f) => {
      if (f.status === "degraded") {
        return {
          farmId: f.id,
          severity: "high" as const,
          title: `Soil degradation — ${f.farmer}`,
          reason: `RVS ${f.rvs}, soil ${f.soilNow}/100, moisture ${f.moistureDelta}%`,
          recommendation: f.nextRecommendation,
        };
      }
      if (f.moistureDelta < 5 && f.status === "transitioning") {
        return {
          farmId: f.id,
          severity: "med" as const,
          title: `Water inefficiency — ${f.farmer}`,
          reason: `Moisture only +${f.moistureDelta}% after Day ${f.daysInProgram}`,
          recommendation: "Apply mulch + drip line on dry rows",
        };
      }
      const compostMissing = !f.interventions.find((i) => i.label === "Compost")?.applied;
      if (compostMissing && f.status !== "regenerating") {
        return {
          farmId: f.id,
          severity: "low" as const,
          title: `Compost missing — ${f.farmer}`,
          reason: "Compost not applied yet — limits soil rebuild",
          recommendation: "Schedule compost delivery this week",
        };
      }
      return null;
    })
    .filter(Boolean) as Array<{ farmId: string; severity: "high" | "med" | "low"; title: string; reason: string; recommendation: string }>;
};

export const selectTerritoryMetrics = (s: State) => {
  const total = s.farms.length || 1;
  const soilHealth = Math.round(s.farms.reduce((a, f) => a + f.soilNow, 0) / total);
  const waterRetention = Math.round(60 + s.farms.reduce((a, f) => a + f.moistureDelta, 0) / total);
  const incomeSignal = Math.round(s.farms.reduce((a, f) => a + Math.max(0, -f.costDelta), 0) / total) + 6;
  const loopActive = Math.round(
    (s.farms.filter((f) => f.interventions.some((i) => i.applied)).length / total) * 100,
  );
  return {
    soilHealth,
    soilHealthDelta: soilHealth - 43,
    waterRetention,
    waterDelta: waterRetention - 62,
    incomeSignal,
    incomeDelta: 4,
    loopActive,
    loopDelta: loopActive - 60,
    totalRVS: s.farms.reduce((a, f) => a + f.rvs, 0),
    rvsGrowth: 23,
    interventions: {
      compost: s.farms.filter((f) => f.interventions.find((i) => i.label === "Compost")?.applied).length,
      mulching: s.farms.filter((f) => f.interventions.find((i) => i.label === "Mulch")?.applied).length,
      water: s.farms.filter((f) => f.interventions.find((i) => i.label === "Water optimization")?.applied).length,
    },
  };
};

// keep seedMetrics import alive (for tree-shaking visibility)
export const _seed = seedMetrics;