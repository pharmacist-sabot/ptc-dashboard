// src/types/index.ts

export type RecommendationNo = 1 | 2 | 3;

export type ActionStatus
  = | 'not_started'
    | 'in_progress'
    | 'completed'
    | 'delayed'
    | 'blocked';

export type ActionItem = {
  id: string;
  recNo: RecommendationNo;
  no: number;
  plan: string;
  subItems: string[];
  timeline: string; // display string e.g. "เม.ย. – มิ.ย. 68"
  startMonth: number; // 1-12 (fiscal year: Oct=1)
  endMonth: number; // 1-12
  kpis: string[];
  target: string;
  owners: string[];
  reportCycle: string;
  haRef: string; // HA II-6 reference
  // runtime fields (from GSheet)
  status: ActionStatus;
  progressPct: number; // 0-100
  actualValue: string; // actual KPI value recorded
  notes: string;
  blockers: string;
  lastUpdated: string; // ISO date
  updatedBy: string;
};

export type Recommendation = {
  no: RecommendationNo;
  title: string;
  shortTitle: string;
  color: string; // tailwind color key
  actions: ActionItem[];
};

export type DashboardSummary = {
  totalActions: number;
  completed: number;
  inProgress: number;
  delayed: number;
  blocked: number;
  notStarted: number;
  overallPct: number;
};

export type UpdatePayload = {
  id: string;
  status: ActionStatus;
  progressPct: number;
  actualValue: string;
  notes: string;
  blockers: string;
  updatedBy: string;
};

export type GSheetRow = {
  id: string;
  status: string;
  progressPct: string;
  actualValue: string;
  notes: string;
  blockers: string;
  lastUpdated: string;
  updatedBy: string;
};
