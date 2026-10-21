export interface FormData {
  // Block 1
  industry: string;
  profiles: number; // N
  connectedSystems: number;
  connectedSystemsSelected: string[];
  engagement: number; // historical interactions

  // Block 2
  streamEngPercent: number; // stream_eng (0-100)
  streamProfPercent: number; // stream_prof (0-100)
  identityFragmentation: 1 | 2 | 3; // ir_rulesets

  // Block 3
  segmentCreationTime: string; // maps to segments count
  segments: number; // 30-200
  refreshFreq: number; // default 1
  calcInsightsDay: number; // 3-15
  queriesDay: number; // 10-500

  // Block 4
  channels: string[];
  activationsYr: number;
  engagementTimeframe: number; // default 30

  // Meta
  accountName: string;
  contactName: string;
  logoBase64?: string;

  // Internal override (used by demo data only, not exposed in UI)
  dailyUpdateOverride?: number;
}

export interface CalculationResult {
  // Volumes
  batchPipelineVol: number;
  transformVol: number;
  streamEngVol: number;
  streamProfVol: number;
  streamTransformVol: number;
  unificationVol: number;
  calcInsightsVol: number;
  queryVol: number;
  segmentationVol: number;
  activationVol: number;

  // Credits
  batchPipelineCredits: number;
  transformCredits: number;
  streamEngCredits: number;
  streamProfCredits: number;
  streamTransformCredits: number;
  unificationCredits: number;
  calcInsightsCredits: number;
  queryCredits: number;
  segmentationCredits: number;
  activationCredits: number;
  dataGraphsCredits: number;

  // Totals
  ingestionCredits: number;
  streamingCredits: number;
  totalCredits: number;

  // Maturity
  maturityScore: number;
  maturityLevel: 1 | 2 | 3 | 4;
  maturityLabel: string;

  // ROI
  engineeringHoursSaved: number;
  engineeringValueSaved: number;
  mediaWasteReduction: number;
  conversionUplift: number;
  totalAnnualBenefit: number;
}
