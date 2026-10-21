import React, { useState } from 'react';
import { ChevronDown, ChevronRight, ArrowLeft, Lightbulb } from 'lucide-react';
import { CalculationResult, FormData } from '../types';

const fmtBig = (n: number): string => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)         return `${(n / 1_000).toFixed(1)}K`;
  return String(Math.round(n));
};
const fmtNum = (n: number) => new Intl.NumberFormat('es-MX').format(Math.round(n));

const INDUSTRY_PARAMS: Record<string, { daily_update: number; lookback_months: number }> = {
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

const EDITION_LABELS: Record<string, string> = {
  flex:       'Data Cloud Flex (sin descuento)',
  profiles:   'Profiles & Flex (−15%)',
  enterprise: 'Enterprise Profiles & Flex (−30%)',
};

// ── Sub-components ────────────────────────────────────────────────────────

const FormulaBox: React.FC<{ label: string; content: string; variant?: 'symbolic' | 'sub' }> = ({
  label, content, variant = 'symbolic',
}) => (
  <div className={`rounded-lg p-3 mb-2 ${variant === 'symbolic' ? 'bg-gray-900' : 'bg-blue-950'}`}>
    <p className={`text-[10px] font-semibold uppercase tracking-wide mb-1 ${variant === 'symbolic' ? 'text-gray-400' : 'text-blue-400'}`}>
      {label}
    </p>
    <p className={`font-mono text-sm leading-relaxed break-all ${variant === 'symbolic' ? 'text-green-400' : 'text-blue-200'}`}>
      {content}
    </p>
  </div>
);

const ResultBadge: React.FC<{ volume: number; rate: string; credits: number; color: string }> = ({
  volume, rate, credits, color,
}) => (
  <div className="flex flex-col sm:flex-row gap-3 mt-3">
    <div className="flex-1 bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Volumen Anual</p>
      <p className="text-lg font-bold text-gray-700 mt-0.5">{fmtBig(volume)}</p>
      <p className="text-[10px] text-gray-400">filas / año</p>
    </div>
    <div className="flex-1 bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Tarifa Oficial</p>
      <p className="text-sm font-bold text-gray-700 mt-0.5">{rate}</p>
      <p className="text-[10px] text-gray-400">créditos / M filas</p>
    </div>
    <div className="flex-1 rounded-lg p-3 text-center border-2" style={{ borderColor: color, background: `${color}12` }}>
      <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color }}>Créditos</p>
      <p className="text-xl font-extrabold mt-0.5" style={{ color }}>{fmtNum(credits)}</p>
      <p className="text-[10px]" style={{ color, opacity: 0.7 }}>/ año</p>
    </div>
  </div>
);

const TipBox: React.FC<{ tip: string }> = ({ tip }) => (
  <div className="flex items-start gap-2 mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
    <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
    <p className="text-xs text-amber-800 leading-relaxed">{tip}</p>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────

interface Props {
  result: CalculationResult;
  formData: FormData;
  onClose: () => void;
}

const StepByStepBreakdown: React.FC<Props> = ({ result, formData, onClose }) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ batch_pipeline: true });
  const toggle = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  const ip = INDUSTRY_PARAMS[formData.industry] ?? { daily_update: 10, lookback_months: 24 };
  const du        = formData.dailyUpdateOverride ?? ip.daily_update;
  const lb        = ip.lookback_months;
  const N         = formData.profiles;
  const E         = formData.engagement;
  const tf        = formData.engagementTimeframe;
  const rulesets  = formData.identityFragmentation;
  const insights  = formData.calcInsightsDay;
  const queries   = formData.queriesDay;
  const segs      = formData.segments;
  const refresh   = formData.refreshFreq;
  const acts      = formData.activationsYr;

  const rawIngestion  = result.batchPipelineCredits + result.transformCredits;
  const rawStreaming   = result.streamEngCredits + result.streamProfCredits + result.streamTransformCredits;
  const discountFactor = formData.edition === 'profiles' ? 0.85 : formData.edition === 'enterprise' ? 0.70 : 1.0;
  const discountPct    = formData.edition === 'profiles' ? 15  : formData.edition === 'enterprise' ? 30   : 0;
  const ingDiscount    = rawIngestion - result.ingestionCredits;
  const strDiscount    = rawStreaming  - result.streamingCredits;

  interface Section {
    id: string;
    emoji: string;
    title: string;
    color: string;
    credits: number;
    volume: number;
    symbolic: string;
    substituted: string;
    rate: string;
    tip: string;
    note?: string;
  }

  const sections: Section[] = [
    {
      id: 'batch_pipeline',
      emoji: '📥',
      title: 'Batch Pipeline — Ingesta Batch',
      color: '#0070D2',
      credits: result.batchPipelineCredits,
      volume: result.batchPipelineVol,
      symbolic: 'N × (du% ÷ 100) × 365  +  E × (du% ÷ 100) × Timeframe',
      substituted: `${fmtBig(N)} × ${du}% ÷ 100 × 365  +  ${fmtBig(E)} × ${du}% ÷ 100 × ${tf} días`,
      rate: '2,000 créditos / M filas',
      tip: 'El porcentaje de actualización diaria (daily update) afecta directamente esta categoría. Reducir de 15% → 10% recorta ~33%. Revisa también si el timeframe de engagement cubre más historial del necesario.',
      note: 'Modela los registros que ingresan diariamente al sistema más el histórico de engagement reanalizado según el timeframe definido.',
    },
    {
      id: 'batch_transform',
      emoji: '⚙️',
      title: 'Batch Transform — Transformación',
      color: '#1589EE',
      credits: result.transformCredits,
      volume: result.transformVol,
      symbolic: '(N + E) × Lookback_Meses × (365 ÷ 12)',
      substituted: `(${fmtBig(N)} + ${fmtBig(E)}) × ${lb} meses × 30.42`,
      rate: '400 créditos / M filas',
      tip: 'El lookback (meses de historial) es el palanca más efectiva aquí. Pasar de 36 → 12 meses reduce Transform en 66%. Evalúa si realmente necesitas todo el historial acumulado para cada recálculo.',
      note: 'Transforma tanto los perfiles base como el histórico de engagement acumulado, multiplicado por cada mes de análisis hacia atrás.',
    },
    {
      id: 'streaming',
      emoji: '⚡',
      title: 'Streaming — Eng + Profiles + Transform',
      color: '#032D60',
      credits: result.streamEngCredits + result.streamProfCredits + result.streamTransformCredits,
      volume: result.streamEngVol + result.streamProfVol + result.streamTransformVol,
      symbolic: 'E × (str_eng% ÷ 100) × 365  +  N × (str_prof% ÷ 100) × 365  +  sum_stream × 0.5',
      substituted: `${fmtBig(E)} × ${formData.streamEngPercent}% ÷ 100 × 365  +  ${fmtBig(N)} × ${formData.streamProfPercent}% ÷ 100 × 365  +  (stream_eng + stream_prof) × 0.5`,
      rate: '5,000 créditos / M filas (¡5× más que batch!)',
      tip: 'Streaming tiene la tarifa más alta del modelo. Actívalo sólo para los datos que requieren frescura en tiempo real; el resto mantenlo en batch nocturno para optimizar créditos.',
      note: (result.streamEngCredits + result.streamProfCredits + result.streamTransformCredits) < 1
        ? '⚠️ Sin streaming configurado en esta estimación (str_eng% y str_prof% = 0%). El volumen es 0.'
        : undefined,
    },
    {
      id: 'identity',
      emoji: '🔗',
      title: 'Identity Resolution — Resolución de Identidad',
      color: '#FFB75D',
      credits: result.unificationCredits,
      volume: result.unificationVol,
      symbolic: '[N × Rulesets × (12 + (du% ÷ 100) × 365)] ÷ 3',
      substituted: `[${fmtBig(N)} × ${rulesets} × (12 + ${du}% ÷ 100 × 365)] ÷ 3`,
      rate: '100,000 créditos / M filas ← ¡La tarifa más alta del modelo!',
      tip: 'Esta es la categoría más cara (50× más que batch). Cada Identity Resolution Rule Set adicional multiplica el volumen linealmente. Consolida reglas similares y elimina rulesets redundantes.',
      note: 'Simula la consolidación de grafos de identidad y la reconciliación de duplicados para construir el golden record.',
    },
    {
      id: 'insights',
      emoji: '🧮',
      title: 'Calculated Insights — Analítica Calculada',
      color: '#4BCA81',
      credits: result.calcInsightsCredits,
      volume: result.calcInsightsVol,
      symbolic: '(Insights_Día × 365 × N × Lookback_Meses) ÷ 8',
      substituted: `(${insights} × 365 × ${fmtBig(N)} × ${lb}) ÷ 8`,
      rate: '15 créditos / M filas',
      tip: 'Cada Calculated Insight opera sobre el universo completo de perfiles × lookback. Consolidar insights similares o usar ventanas de tiempo menores reduce esta categoría drásticamente.',
    },
    {
      id: 'queries',
      emoji: '🔍',
      title: 'Queries / Data Explorer — Consultas Analíticas',
      color: '#3EB870',
      credits: result.queryCredits,
      volume: result.queryVol,
      symbolic: '(Queries_Día × 365 × E × (du% ÷ 100) × Lookback) ÷ Timeframe',
      substituted: `(${queries} × 365 × ${fmtBig(E)} × ${du}% ÷ 100 × ${lb}) ÷ ${tf}`,
      rate: '2 créditos / M filas (tarifa más baja)',
      tip: 'La tarifa es muy baja, pero queries full-scan diarias sobre todo el engagement pueden acumular. Usa snapshots pre-agregados o filtra por rango de tiempo en lugar de full-scan.',
    },
    {
      id: 'segmentation',
      emoji: '🎯',
      title: 'Segmentación — Audience Segmentation',
      color: '#9B59B6',
      credits: result.segmentationCredits,
      volume: result.segmentationVol,
      symbolic: 'Segmentos × Refresh × 365 × N × (1 + E÷N) × (du% ÷ 100)',
      substituted: `${segs} × ${refresh} × 365 × ${fmtBig(N)} × (1 + ${fmtBig(E)}÷${fmtBig(N)}) × ${du}% ÷ 100`,
      rate: '20 créditos / M filas',
      tip: 'La frecuencia de refresh es el mayor lever: 4× → 1× por día reduce esta categoría en 75%. También consolidar segmentos similares o reducir el número de audiencias activas tiene impacto significativo.',
    },
    {
      id: 'activation',
      emoji: '🚀',
      title: 'Activación — Audience Activation',
      color: '#FF5D5D',
      credits: result.activationCredits,
      volume: result.activationVol,
      symbolic: 'Activaciones_Año × N × 0.33',
      substituted: `${fmtBig(acts)} activaciones × ${fmtBig(N)} × 0.33`,
      rate: '10 créditos / M filas',
      tip: 'El factor 0.33 refleja que tipicamente un segmento activo representa ~33% del total de perfiles. Diseñar segmentos más específicos y reducir activaciones redundantes optimiza esta categoría.',
      note: 'La constante 0.33 es un parámetro estándar del modelo V3 que representa el ratio de cobertura promedio de audiencia por activación.',
    },
  ];

  const paramsSummary = [
    { label: 'Perfiles (N)',     value: fmtBig(N) },
    { label: 'Engagement (E)',   value: fmtBig(E) },
    { label: 'Daily Update',     value: `${du}%` },
    { label: 'Lookback',         value: `${lb} meses` },
    { label: 'IR Rulesets',      value: String(rulesets) },
    { label: 'Segmentos',        value: String(segs) },
    { label: 'Refresh/día',      value: `${refresh}×` },
    { label: 'Edición',          value: EDITION_LABELS[formData.edition] },
  ];

  return (
    <div className="animate-fade-in space-y-5 pb-12">
      {/* Back navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-2 text-sf-blue text-sm font-semibold hover:text-blue-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Dashboard
        </button>
        <span className="text-xs text-gray-400 hidden sm:block">{formData.accountName}</span>
      </div>

      {/* Hero banner */}
      <div
        className="rounded-2xl overflow-hidden shadow-lg"
        style={{ background: 'linear-gradient(135deg, #0d1b2a 0%, #032D60 60%, #0070D2 100%)' }}
      >
        <div className="px-6 py-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🎓</span>
            <div>
              <h1 className="text-xl font-bold">Desglose Paso a Paso</h1>
              <p className="text-blue-200 text-sm">Metodología Oficial V3 — Salesforce Data 360</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur">
              <p className="text-blue-200 text-[11px] font-semibold uppercase tracking-wide mb-2">
                Paso 1 — Volumen Anual
              </p>
              <p className="text-white text-sm leading-relaxed">
                Estima el total de filas procesadas al año según los parámetros operativos del cliente: N, engagement, frecuencias, lookback, etc.
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur">
              <p className="text-blue-200 text-[11px] font-semibold uppercase tracking-wide mb-2">
                Paso 2 — Conversión a Créditos
              </p>
              <p className="font-mono text-sm text-white">
                Créditos = (Volumen × Tarifa) ÷ 1,000,000
              </p>
              <p className="text-blue-300 text-xs mt-1">Cada categoría tiene su tarifa oficial (ver abajo)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Client parameters chip row */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Parámetros del Cliente Utilizados
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {paramsSummary.map((p) => (
            <div key={p.label} className="bg-gray-50 rounded-lg p-2 text-center">
              <p className="text-[10px] text-gray-400">{p.label}</p>
              <p className="text-xs font-bold text-gray-700 mt-0.5 leading-tight">{p.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Category Accordions */}
      {sections.map((sec) => {
        const isOpen = !!expanded[sec.id];
        const pct = result.totalCredits > 0 ? ((sec.credits / result.totalCredits) * 100).toFixed(1) : '0.0';
        return (
          <div key={sec.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <button
              type="button"
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
              onClick={() => toggle(sec.id)}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl flex-shrink-0">{sec.emoji}</span>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{sec.title}</p>
                  {!isOpen && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {fmtNum(sec.credits)} créditos &middot; {pct}% del total
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: `${sec.color}18`, color: sec.color }}
                >
                  {fmtNum(sec.credits)}
                </span>
                {isOpen
                  ? <ChevronDown className="w-4 h-4 text-gray-400" />
                  : <ChevronRight className="w-4 h-4 text-gray-400" />
                }
              </div>
            </button>

            {isOpen && (
              <div className="px-5 pb-5 border-t border-gray-100">
                {sec.note && (
                  <div className="mt-3 text-xs text-gray-500 italic bg-gray-50 rounded-lg p-3 leading-relaxed">
                    {sec.note}
                  </div>
                )}
                <div className="mt-3">
                  <FormulaBox label="Fórmula Teórica" content={sec.symbolic} variant="symbolic" />
                  <FormulaBox label="Sustitución con Datos del Cliente" content={sec.substituted} variant="sub" />
                </div>
                <ResultBadge volume={sec.volume} rate={sec.rate} credits={sec.credits} color={sec.color} />
                <TipBox tip={sec.tip} />
              </div>
            )}
          </div>
        );
      })}

      {/* Edition Discount Section */}
      <div className="bg-white rounded-2xl border-2 border-blue-200 overflow-hidden shadow-sm">
        <button
          type="button"
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-blue-50 transition-colors text-left"
          onClick={() => toggle('edition_discount')}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🏷️</span>
            <div>
              <p className="font-semibold text-gray-800 text-sm">
                Descuento por Edición — {EDITION_LABELS[formData.edition]}
              </p>
              {!expanded['edition_discount'] && (
                <p className="text-xs text-blue-500 mt-0.5">
                  Aplicado sobre Ingesta + Streaming · Ahorro: {fmtNum(ingDiscount + strDiscount)} créditos
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
            {discountPct > 0 && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                −{discountPct}%
              </span>
            )}
            {expanded['edition_discount']
              ? <ChevronDown className="w-4 h-4 text-gray-400" />
              : <ChevronRight className="w-4 h-4 text-gray-400" />
            }
          </div>
        </button>

        {expanded['edition_discount'] && (
          <div className="px-5 pb-5 border-t border-gray-100">
            <div className="mt-4 text-xs text-gray-500 bg-gray-50 rounded-lg p-3 mb-4 leading-relaxed">
              El descuento por edición se aplica <strong>únicamente</strong> sobre los créditos de{' '}
              <strong>Ingesta (Batch Pipeline + Transform)</strong> y <strong>Streaming</strong>.
              Las categorías de Identity Resolution, Calculated Insights, Queries, Segmentación,
              Activación y Data Graphs <strong>NO</strong> reciben descuento.
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] text-gray-400 uppercase tracking-wide border-b border-gray-100">
                  <th className="text-left pb-2">Categoría</th>
                  <th className="text-right pb-2">Créditos Brutos</th>
                  <th className="text-right pb-2">Factor</th>
                  <th className="text-right pb-2">Créditos Netos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <tr>
                  <td className="py-2 text-gray-700">Ingesta (Batch + Transform)</td>
                  <td className="py-2 text-right font-mono text-gray-500">{fmtNum(rawIngestion)}</td>
                  <td className="py-2 text-right font-mono text-blue-600">× {discountFactor.toFixed(2)}</td>
                  <td className="py-2 text-right font-mono font-bold text-gray-800">{fmtNum(result.ingestionCredits)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-700">Streaming (Eng + Prof + Transform)</td>
                  <td className="py-2 text-right font-mono text-gray-500">{fmtNum(rawStreaming)}</td>
                  <td className="py-2 text-right font-mono text-blue-600">× {discountFactor.toFixed(2)}</td>
                  <td className="py-2 text-right font-mono font-bold text-gray-800">{fmtNum(result.streamingCredits)}</td>
                </tr>
                <tr className="bg-blue-50">
                  <td className="py-2 font-semibold text-blue-700">Ahorro Total</td>
                  <td className="py-2 text-right font-mono text-gray-500">{fmtNum(rawIngestion + rawStreaming)}</td>
                  <td className="py-2 text-right font-mono text-blue-600">−{discountPct}%</td>
                  <td className="py-2 text-right font-mono font-bold text-blue-700">
                    −{fmtNum(ingDiscount + strDiscount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SKU Calculation */}
      <div className="bg-white rounded-2xl border-2 border-green-200 overflow-hidden shadow-sm">
        <button
          type="button"
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-green-50 transition-colors text-left"
          onClick={() => toggle('sku')}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">📦</span>
            <div>
              <p className="font-semibold text-gray-800 text-sm">
                Cálculo de SKUs — Data Services Credits (DSC)
              </p>
              {!expanded['sku'] && (
                <p className="text-xs text-green-600 mt-0.5">
                  ⌈{fmtNum(result.totalCredits)} ÷ 100,000⌉ = {result.dscSkus} SKU{result.dscSkus !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-700">
              {result.dscSkus} SKU{result.dscSkus !== 1 ? 's' : ''}
            </span>
            {expanded['sku']
              ? <ChevronDown className="w-4 h-4 text-gray-400" />
              : <ChevronRight className="w-4 h-4 text-gray-400" />
            }
          </div>
        </button>

        {expanded['sku'] && (
          <div className="px-5 pb-5 border-t border-gray-100">
            <div className="mt-4">
              <FormulaBox
                label="Fórmula de SKUs"
                content={`⌈ Total Créditos ÷ 100,000 ⌉  =  ⌈ ${fmtNum(result.totalCredits)} ÷ 100,000 ⌉  =  ${result.dscSkus} SKU${result.dscSkus !== 1 ? 's' : ''}`}
                variant="symbolic"
              />
              <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-700 font-semibold uppercase tracking-wide">Resultado Comercial</p>
                  <p className="text-4xl font-black text-green-700 mt-1">{result.dscSkus}</p>
                  <p className="text-sm text-green-600">DSC SKU{result.dscSkus !== 1 ? 's' : ''}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-green-600">= {fmtNum(result.dscSkus * 100_000)} créditos comprometidos</p>
                  <p className="text-xs text-green-500 mt-1">Redondeo siempre hacia arriba (⌈ceiling⌉)</p>
                </div>
              </div>
              <TipBox tip={`Un SKU = 100,000 créditos anuales, siempre redondeado hacia arriba. Para esta estimación: ⌈${fmtNum(result.totalCredits)} ÷ 100,000⌉ = ${result.dscSkus} SKUs necesarios.`} />
            </div>
          </div>
        )}
      </div>

      {/* Grand Total summary */}
      <div
        className="rounded-2xl p-6 text-white shadow-lg"
        style={{ background: 'linear-gradient(135deg, #032D60 0%, #0070D2 100%)' }}
      >
        <p className="text-blue-200 text-[11px] font-semibold uppercase tracking-wide mb-4">
          Consolidación Final de Créditos
        </p>
        <div className="space-y-2">
          {[
            { label: 'Ingesta (post descuento)',   value: result.ingestionCredits },
            { label: 'Streaming (post descuento)', value: result.streamingCredits },
            { label: 'Identity Resolution',        value: result.unificationCredits },
            { label: 'Calculated Insights',        value: result.calcInsightsCredits },
            { label: 'Queries / Data Explorer',    value: result.queryCredits },
            { label: 'Segmentación',               value: result.segmentationCredits },
            { label: 'Activación',                 value: result.activationCredits },
            { label: 'Data Graphs (×2 grafos)',    value: result.dataGraphsCredits },
          ].map((row) => (
            <div key={row.label} className="flex justify-between items-center">
              <span className="text-blue-200 text-xs">{row.label}</span>
              <span className="font-mono text-white text-xs font-semibold">{fmtNum(row.value)}</span>
            </div>
          ))}
          <div className="border-t border-white/20 pt-3 mt-1 flex justify-between items-center">
            <span className="text-white font-bold text-sm">TOTAL CRÉDITOS / AÑO</span>
            <span className="font-mono text-white text-xl font-extrabold">{fmtNum(result.totalCredits)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-blue-300 text-xs">⌈{fmtNum(result.totalCredits)} ÷ 100,000⌉</span>
            <span className="text-blue-300 text-xs font-semibold">
              = {result.dscSkus} DSC SKU{result.dscSkus !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom back button */}
      <div className="flex justify-start">
        <button type="button" className="sf-btn-secondary" onClick={onClose}>
          <ArrowLeft className="w-4 h-4" /> Volver al Dashboard
        </button>
      </div>
    </div>
  );
};

export default StepByStepBreakdown;
