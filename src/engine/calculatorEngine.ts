import { FormData, CalculationResult } from '../types';

const INDUSTRY_DEFAULTS: Record<string, { daily_update: number; lookback_months: number }> = {
  financial_services: { daily_update: 7,  lookback_months: 36 },
  healthcare:         { daily_update: 5,  lookback_months: 36 },
  manufacturing:      { daily_update: 4,  lookback_months: 12 },
  consumer_goods:     { daily_update: 12, lookback_months: 24 },
  retail:             { daily_update: 12, lookback_months: 24 },
  communications:     { daily_update: 20, lookback_months: 18 },
  media:              { daily_update: 25, lookback_months: 12 },
  automotive:         { daily_update: 5,  lookback_months: 24 },
  education:          { daily_update: 6,  lookback_months: 24 },
  travel_hospitality: { daily_update: 12, lookback_months: 24 },
};

export function calculate(form: FormData): CalculationResult {
  const industry = INDUSTRY_DEFAULTS[form.industry] || { daily_update: 10, lookback_months: 24 };
  const N = form.profiles;
  const engagement = form.engagement;
  const daily_update = form.dailyUpdateOverride ?? industry.daily_update;
  const lookback_months = industry.lookback_months;
  const stream_eng = form.streamEngPercent;
  const stream_prof = form.streamProfPercent;
  const ir_rulesets = form.identityFragmentation;
  const calc_insights_day = form.calcInsightsDay;
  const queries_day = form.queriesDay;
  const segments = form.segments;
  const refresh_freq = form.refreshFreq;
  const activations_yr = form.activationsYr;
  const engagement_timeframe = form.engagementTimeframe;
  const graphs = 2;

  // VOLUME CALCULATIONS
  const batch_pipeline_vol =
    N * (daily_update / 100) * 365 +
    engagement * (daily_update / 100) * engagement_timeframe;

  const transform_vol = (N + engagement) * lookback_months * (365 / 12);

  const stream_eng_vol = engagement * (stream_eng / 100) * 365;
  const stream_prof_vol = N * (stream_prof / 100) * 365;
  const stream_transform_vol = (stream_eng_vol + stream_prof_vol) * 0.5;

  const unification_vol = (N * ir_rulesets * (12 + (daily_update / 100) * 365)) / 3;

  const calc_insights_vol = (calc_insights_day * 365 * N * lookback_months) / 8;

  const query_vol =
    (queries_day * 365 * engagement * (daily_update / 100) * lookback_months) / engagement_timeframe;

  const segmentation_vol =
    segments * refresh_freq * 365 * N * (1 + engagement / N) * (daily_update / 100);

  const activation_vol = activations_yr * N * 0.33;

  // CREDIT CALCULATIONS (per million rows)
  const batch_pipeline_credits = (batch_pipeline_vol * 2000) / 1_000_000;
  const transform_credits = (transform_vol * 400) / 1_000_000;
  const stream_eng_credits = (stream_eng_vol * 5000) / 1_000_000;
  const stream_prof_credits = (stream_prof_vol * 5000) / 1_000_000;
  const stream_transform_credits = (stream_transform_vol * 5000) / 1_000_000;
  const unification_credits = (unification_vol * 100000) / 1_000_000;
  const calc_insights_credits = (calc_insights_vol * 15) / 1_000_000;
  const query_credits = (query_vol * 2) / 1_000_000;
  const segmentation_credits = (segmentation_vol * 20) / 1_000_000;
  const activation_credits = (activation_vol * 10) / 1_000_000;
  const data_graphs_credits = graphs * 500;

  // Edition adjustments
  let ingestionCredits = batch_pipeline_credits + transform_credits;
  let streamingCredits = stream_eng_credits + stream_prof_credits + stream_transform_credits;

  if (form.edition === 'profiles') {
    ingestionCredits *= 0.85;
    streamingCredits *= 0.85;
  } else if (form.edition === 'enterprise') {
    ingestionCredits *= 0.70;
    streamingCredits *= 0.70;
  }

  const totalCredits =
    ingestionCredits +
    streamingCredits +
    unification_credits +
    calc_insights_credits +
    query_credits +
    segmentation_credits +
    activation_credits +
    data_graphs_credits;

  const dscSkus = Math.ceil(totalCredits / 100000);

  // MATURITY SCORE
  let maturityScore = 0;
  // Streaming capability (0-25)
  maturityScore += Math.min(25, ((stream_eng + stream_prof) / 2) * 0.5);
  // Identity resolution complexity (0-20)
  maturityScore += ir_rulesets >= 3 ? 20 : ir_rulesets === 2 ? 12 : 5;
  // Segmentation speed (0-25)
  const segTime = form.segmentCreationTime;
  maturityScore += segTime === 'lt4h' ? 25 : segTime === '1-2d' ? 15 : segTime === '1w' ? 8 : 3;
  // Analytics depth (0-20)
  maturityScore += Math.min(20, (calc_insights_day / 15) * 20);
  // Channel activation breadth (0-10)
  maturityScore += Math.min(10, form.channels.length * 2.5);

  maturityScore = Math.min(100, Math.round(maturityScore));
  const maturityLevel = maturityScore <= 25 ? 1 : maturityScore <= 50 ? 2 : maturityScore <= 75 ? 3 : 4;
  const maturityLabels: Record<number, string> = {
    1: 'Silos Desconectados',
    2: 'Datos Centralizados Lentos',
    3: 'Omnicanalidad Estructurada',
    4: 'Activación Autónoma en Tiempo Real',
  };

  // ROI CALCULATIONS
  const currentHoursPerSegment =
    segTime === 'lt4h' ? 2 : segTime === '1-2d' ? 12 : segTime === '1w' ? 40 : 80;
  const engineeringHoursSaved = (segments * (currentHoursPerSegment - 0.5) * 52) / 12;
  const hourlyRate = 45;
  const engineeringValueSaved = engineeringHoursSaved * hourlyRate;

  // Media waste reduction
  const hasDigitalMedia = form.channels.includes('paid_media');
  const estimatedMediaSpend = hasDigitalMedia ? activations_yr * 50 : 0;
  const mediaWasteReduction = estimatedMediaSpend * 0.15;

  // Conversion uplift
  const avgCampaignValue = N * 0.02 * 50;
  const conversionUplift = avgCampaignValue * 0.025;

  const totalAnnualBenefit = engineeringValueSaved + mediaWasteReduction + conversionUplift;

  return {
    batchPipelineVol: batch_pipeline_vol,
    transformVol: transform_vol,
    streamEngVol: stream_eng_vol,
    streamProfVol: stream_prof_vol,
    streamTransformVol: stream_transform_vol,
    unificationVol: unification_vol,
    calcInsightsVol: calc_insights_vol,
    queryVol: query_vol,
    segmentationVol: segmentation_vol,
    activationVol: activation_vol,
    batchPipelineCredits: batch_pipeline_credits,
    transformCredits: transform_credits,
    streamEngCredits: stream_eng_credits,
    streamProfCredits: stream_prof_credits,
    streamTransformCredits: stream_transform_credits,
    unificationCredits: unification_credits,
    calcInsightsCredits: calc_insights_credits,
    queryCredits: query_credits,
    segmentationCredits: segmentation_credits,
    activationCredits: activation_credits,
    dataGraphsCredits: data_graphs_credits,
    ingestionCredits,
    streamingCredits,
    totalCredits,
    dscSkus,
    maturityScore,
    maturityLevel: maturityLevel as 1 | 2 | 3 | 4,
    maturityLabel: maturityLabels[maturityLevel],
    engineeringHoursSaved,
    engineeringValueSaved,
    mediaWasteReduction,
    conversionUplift,
    totalAnnualBenefit,
  };
}
