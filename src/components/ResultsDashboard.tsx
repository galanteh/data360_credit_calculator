import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  LabelList,
} from 'recharts';
import { Download, RefreshCw, TrendingUp, Zap, Database, Activity, CheckCircle } from 'lucide-react';
import { CalculationResult, FormData } from '../types';
import { generatePDF } from './PDFExport';

interface ResultsDashboardProps {
  result: CalculationResult;
  formData: FormData;
  onReset: () => void;
}

const fmt = (n: number) => new Intl.NumberFormat('es-MX').format(Math.round(n));
const fmtMoney = (n: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n);

// ── Maturity Gauge ────────────────────────────────────────────────────────
const MaturityGauge: React.FC<{ score: number; level: 1 | 2 | 3 | 4; label: string }> = ({
  score,
  level,
  label,
}) => {
  const [animScore, setAnimScore] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setAnimScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const r = 80;
  const circumference = Math.PI * r; // half circle
  const cx = 110;
  const cy = 100;
  const dashOffset = circumference - (animScore / 100) * circumference;

  const levelColors: Record<number, string> = {
    1: '#FF5D5D',
    2: '#FFB75D',
    3: '#0070D2',
    4: '#4BCA81',
  };
  const color = levelColors[level];

  const levelDescriptions: Record<number, string> = {
    1: 'Los datos están en silos. Alta oportunidad de unificación.',
    2: 'Datos centralizados pero lentos. Optimizar velocidad de activación.',
    3: 'Capacidad omnicanal sólida. Avanzar hacia tiempo real.',
    4: 'Liderazgo en datos. Explorar IA generativa y agentes autónomos.',
  };

  return (
    <div className="flex flex-col items-center">
      <svg width={220} height={130} viewBox={`0 0 220 130`}>
        {/* Background arc */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="#E8EDF4"
          strokeWidth={14}
          strokeLinecap="round"
        />
        {/* Color arc */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)' }}
        />
        {/* Score text */}
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize={36} fontWeight="800" fill={color}>
          {Math.round(animScore)}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize={11} fill="#888">
          / 100
        </text>
        {/* Level labels */}
        <text x={cx - r + 4} y={cy + 20} textAnchor="middle" fontSize={9} fill="#aaa">
          0
        </text>
        <text x={cx + r - 4} y={cy + 20} textAnchor="middle" fontSize={9} fill="#aaa">
          100
        </text>
      </svg>
      <div
        className={`px-4 py-1.5 rounded-full text-sm font-bold mt-1 maturity-badge-${level}`}
      >
        Nivel {level}: {label}
      </div>
      <p className="text-xs text-gray-500 mt-2 text-center max-w-xs">
        {levelDescriptions[level]}
      </p>
    </div>
  );
};

// ── Credit breakdown chart data ───────────────────────────────────────────
const getCreditChartData = (r: CalculationResult) => [
  { name: 'Batch Pipeline', credits: Math.round(r.batchPipelineCredits), fill: '#0070D2' },
  { name: 'Transform', credits: Math.round(r.transformCredits), fill: '#1589EE' },
  { name: 'Stream Eng', credits: Math.round(r.streamEngCredits), fill: '#032D60' },
  { name: 'Stream Prof', credits: Math.round(r.streamProfCredits), fill: '#0C3B6E' },
  { name: 'Stream Transform', credits: Math.round(r.streamTransformCredits), fill: '#3A7FC1' },
  { name: 'Unificación', credits: Math.round(r.unificationCredits), fill: '#FFB75D' },
  { name: 'Calc Insights', credits: Math.round(r.calcInsightsCredits), fill: '#4BCA81' },
  { name: 'Queries', credits: Math.round(r.queryCredits), fill: '#3EB870' },
  { name: 'Segmentación', credits: Math.round(r.segmentationCredits), fill: '#9B59B6' },
  { name: 'Activación', credits: Math.round(r.activationCredits), fill: '#FF5D5D' },
  { name: 'Data Graphs', credits: Math.round(r.dataGraphsCredits), fill: '#E91E8C' },
].filter((d) => d.credits > 0);

// ── Waterfall chart data ──────────────────────────────────────────────────
const getWaterfallData = (r: CalculationResult) => {
  return [
    {
      name: 'Ahorro\nIngeniería',
      value: Math.round(r.engineeringValueSaved),
      base: 0,
      isTotal: false,
      fill: '#4BCA81',
    },
    {
      name: 'Reducción\nMedia Waste',
      value: Math.round(r.mediaWasteReduction),
      base: Math.round(r.engineeringValueSaved),
      isTotal: false,
      fill: '#0070D2',
    },
    {
      name: 'Uplift\nConversión',
      value: Math.round(r.conversionUplift),
      base: Math.round(r.engineeringValueSaved + r.mediaWasteReduction),
      isTotal: false,
      fill: '#FFB75D',
    },
    {
      name: 'Beneficio\nAnual Total',
      value: Math.round(r.totalAnnualBenefit),
      base: 0,
      isTotal: true,
      fill: '#032D60',
    },
  ];
};

// ── Maturity Recommendations ──────────────────────────────────────────────
const RECOMMENDATIONS: Record<number, { title: string; items: string[] }> = {
  1: {
    title: 'Pasos Clave para Avanzar del Nivel 1',
    items: [
      'Prioriza la conexión de al menos 3 fuentes de datos clave (CRM, eCommerce, web) para obtener una visión unificada del cliente.',
      'Implementa Data Cloud con el conector nativo de Sales/Service Cloud para unificación básica de identidad sin código.',
      'Establece un modelo de gobierno de datos y nombra un Data Steward para garantizar la calidad desde el inicio.',
    ],
  },
  2: {
    title: 'Pasos Clave para Avanzar del Nivel 2',
    items: [
      'Activa el streaming de eventos web y mobile para reducir la latencia de datos de días a minutos.',
      'Configura Calculated Insights para automatizar scores de propensión y valor de cliente, eliminando trabajo manual de analítica.',
      'Integra al menos 2 canales de activación directa (email + paid media) para medir ROI de audiencias Data Cloud.',
    ],
  },
  3: {
    title: 'Pasos Clave para Avanzar del Nivel 3',
    items: [
      'Implementa activación en tiempo real hacia todos tus canales usando Triggered Activations y Real-Time Decisions.',
      'Despliega modelos predictivos con Einstein Studio conectados a Data Cloud para next-best-action en cada interacción.',
      'Conecta tu plataforma de Paid Media (DV360, The Trade Desk) para lookalike audiences dinámicos actualizados diariamente.',
    ],
  },
  4: {
    title: 'Maximizando el Nivel 4: Innovación Continua',
    items: [
      'Explora agentes de IA autónomos (Agentforce) que usen Data Cloud como contexto para personalización hiperdinámica.',
      'Implementa Data Sharing para monetizar o compartir datos con partners manteniendo gobernanza y privacidad.',
      'Construye un Customer Data Platform federado que sirva como sistema de record para toda la organización.',
    ],
  },
};

// ── Custom tooltip for credits chart ─────────────────────────────────────
const CreditTooltip: React.FC<{ active?: boolean; payload?: Array<{ value: number; name: string; payload: { fill: string } }> }> = ({
  active,
  payload,
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
      <p className="text-xs font-bold text-gray-800">{payload[0]?.name}</p>
      <p className="text-sm font-bold mt-1" style={{ color: payload[0]?.payload?.fill }}>
        {fmt(payload[0]?.value)} créditos
      </p>
    </div>
  );
};

// ── Waterfall tooltip ─────────────────────────────────────────────────────
const WaterfallTooltip: React.FC<{ active?: boolean; payload?: Array<{ payload: { name: string; value: number; isTotal: boolean } }> }> = ({
  active,
  payload,
}) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
      <p className="text-xs font-bold text-gray-800">{d?.name?.replace('\n', ' ')}</p>
      <p className="text-sm font-bold text-sf-blue mt-1">{fmtMoney(d?.value ?? 0)}</p>
    </div>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────
const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ result, formData, onReset }) => {
  const [exporting, setExporting] = useState(false);
  const creditData = getCreditChartData(result);
  const waterfallData = getWaterfallData(result);
  const recs = RECOMMENDATIONS[result.maturityLevel];

  const handleExport = async () => {
    setExporting(true);
    try {
      await generatePDF(result, formData);
    } catch (e) {
      console.error('PDF export failed', e);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      {/* ── Header Card ── */}
      <div
        className="rounded-2xl overflow-hidden shadow-xl"
        style={{ background: 'linear-gradient(135deg, #032D60 0%, #0070D2 100%)' }}
      >
        <div className="px-6 py-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                {formData.logoBase64 ? (
                  <img
                    src={formData.logoBase64}
                    alt={`${formData.accountName} logo`}
                    className="h-10 max-w-[120px] object-contain rounded bg-white/10 p-1"
                  />
                ) : null}
                <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest">
                  Salesforce Data 360 Credit Calculator
                </p>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                {formData.accountName || 'Estimación Data Cloud'}
              </h1>
              {formData.contactName && (
                <p className="text-blue-200 text-sm mt-1">{formData.contactName}</p>
              )}
              <p className="text-blue-300 text-xs mt-2">
                {new Date().toLocaleDateString('es-MX', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            {/* Primary KPI: Credits + SKUs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="text-center bg-white/10 rounded-2xl px-5 py-4 backdrop-blur min-w-[130px]">
                <p className="text-blue-200 text-xs font-semibold uppercase tracking-wide mb-1">
                  Créditos / Año
                </p>
                <div className="text-3xl font-black leading-tight">{fmt(result.totalCredits)}</div>
                <div className="text-blue-200 text-xs mt-0.5">Data 360 Credits</div>
                <div className="mt-2 bg-white/20 rounded-lg px-2 py-1">
                  <span className="text-white text-xs font-bold">{result.dscSkus} DSC SKU{result.dscSkus !== 1 ? 's' : ''}</span>
                  <span className="text-blue-300 text-xs ml-1">×100K</span>
                </div>
              </div>
              <div className="text-center bg-white/10 rounded-2xl px-4 py-4 backdrop-blur min-w-[110px]">
                <p className="text-blue-200 text-xs font-semibold uppercase tracking-wide mb-1">
                  Madurez
                </p>
                <div className="text-4xl font-black">{result.maturityScore}</div>
                <div className="text-blue-200 text-xs">/100</div>
                <div
                  className={`mt-2 px-2 py-0.5 rounded-full text-xs font-bold maturity-badge-${result.maturityLevel}`}
                >
                  Nv.{result.maturityLevel}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Cards Row 1 — Credits focused ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* PRIMARY: Total Credits */}
        <div className="kpi-card" style={{ borderTop: '3px solid #0070D2', background: 'linear-gradient(135deg, #f0f6ff 0%, #fff 100%)' }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-sf-blue font-semibold uppercase tracking-wide">
                Créditos Totales / Año
              </p>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">
                {fmt(result.totalCredits)}
              </p>
            </div>
            <Database className="w-8 h-8 text-sf-blue opacity-80" />
          </div>
          <p className="text-xs text-gray-400 mt-2">Estimación anual Data 360</p>
        </div>

        {/* DSC SKUs */}
        <div className="kpi-card" style={{ borderTop: '3px solid #4BCA81' }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                DSC SKUs Necesarios
              </p>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">{result.dscSkus}</p>
            </div>
            <Zap className="w-8 h-8 text-sf-green opacity-70" />
          </div>
          <p className="text-xs text-gray-400 mt-2">×100,000 créditos / SKU</p>
        </div>

        {/* Ingestion */}
        <div className="kpi-card" style={{ borderTop: '3px solid #FFB75D' }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                Créditos de Ingesta
              </p>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">
                {fmt(result.ingestionCredits)}
              </p>
            </div>
            <Activity className="w-8 h-8 text-sf-orange opacity-70" />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Batch + Transform
            {result.ingestionCredits < (result.batchPipelineCredits + result.transformCredits) - 1
              ? ' (desc. aplicado)'
              : ''}
          </p>
        </div>

        {/* Streaming */}
        <div className="kpi-card" style={{ borderTop: '3px solid #FF5D5D' }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                Créditos Streaming
              </p>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">
                {fmt(result.streamingCredits)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-sf-red opacity-70" />
          </div>
          <p className="text-xs text-gray-400 mt-2">Eng + Prof + Transform</p>
        </div>
      </div>

      {/* ── Maturity + Credit Chart ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Maturity Gauge */}
        <div className="chart-container lg:col-span-2 flex flex-col items-center justify-center">
          <h2 className="text-base font-bold text-gray-800 mb-4 self-start">
            Nivel de Madurez Digital
          </h2>
          <MaturityGauge
            score={result.maturityScore}
            level={result.maturityLevel}
            label={result.maturityLabel}
          />

          {/* Maturity breakdown */}
          <div className="w-full mt-4 space-y-2">
            {[
              { label: 'Streaming', pct: Math.min(100, ((formData.streamEngPercent + formData.streamProfPercent) / 2) * 0.5) },
              { label: 'Identidad', pct: formData.identityFragmentation >= 3 ? 100 : formData.identityFragmentation === 2 ? 60 : 25 },
              { label: 'Segmentación', pct: formData.segmentCreationTime === 'lt4h' ? 100 : formData.segmentCreationTime === '1-2d' ? 60 : formData.segmentCreationTime === '1w' ? 32 : 12 },
              { label: 'Analítica', pct: Math.min(100, (formData.calcInsightsDay / 15) * 100) },
              { label: 'Canales', pct: Math.min(100, (formData.channels.length / 8) * 100) },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs text-gray-500 mb-0.5">
                  <span>{item.label}</span>
                  <span>{Math.round(item.pct)}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sf-blue rounded-full transition-all duration-1000"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Credit Breakdown */}
        <div className="chart-container lg:col-span-3">
          <h2 className="text-base font-bold text-gray-800 mb-4">
            Distribución de Créditos por Categoría
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={creditData}
              layout="vertical"
              margin={{ top: 0, right: 60, left: 90, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F0F0F0" />
              <XAxis
                type="number"
                tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v))}
                tick={{ fontSize: 10, fill: '#888' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 10, fill: '#555' }}
                width={86}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CreditTooltip />} />
              <Bar dataKey="credits" radius={[0, 4, 4, 0]} maxBarSize={18}>
                {creditData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
                <LabelList
                  dataKey="credits"
                  position="right"
                  formatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}K` : String(v))}
                  style={{ fontSize: 9, fill: '#888' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── ROI Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* ROI Waterfall */}
        <div className="chart-container lg:col-span-3">
          <h2 className="text-base font-bold text-gray-800 mb-1">
            Beneficio Económico Anual Estimado
          </h2>
          <p className="text-xs text-gray-400 mb-4">Contribución por fuente de valor</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={waterfallData}
              margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
              barCategoryGap="30%"
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: '#555' }}
                axisLine={false}
                tickLine={false}
                interval={0}
              />
              <YAxis
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
                tick={{ fontSize: 10, fill: '#888' }}
                axisLine={false}
                tickLine={false}
                width={55}
              />
              <Tooltip content={<WaterfallTooltip />} />
              {/* Invisible base bar for stacking */}
              <Bar dataKey="base" stackId="a" fill="transparent" radius={0} />
              <Bar dataKey="value" stackId="a" radius={[4, 4, 0, 0]} maxBarSize={60}>
                {waterfallData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
                <LabelList
                  dataKey="value"
                  position="top"
                  formatter={(v: number) => fmtMoney(v)}
                  style={{ fontSize: 9, fill: '#555', fontWeight: '600' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ROI KPI Cards */}
        <div className="lg:col-span-2 flex flex-col justify-center gap-4">
          <div className="kpi-card" style={{ borderTop: '3px solid #4BCA81' }}>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
              Ahorro en Ingeniería
            </p>
            <p className="text-xl font-extrabold text-gray-900 mt-1">
              {fmtMoney(result.engineeringValueSaved)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {fmt(result.engineeringHoursSaved)} horas/año ahorradas
            </p>
          </div>
          <div className="kpi-card" style={{ borderTop: '3px solid #0070D2' }}>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
              Reducción Media Waste
            </p>
            <p className="text-xl font-extrabold text-gray-900 mt-1">
              {fmtMoney(result.mediaWasteReduction)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {result.mediaWasteReduction > 0 ? 'Canal Paid Media activo' : 'Sin canal Paid Media'}
            </p>
          </div>
          <div className="kpi-card" style={{ borderTop: '3px solid #FFB75D' }}>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
              Uplift de Conversión
            </p>
            <p className="text-xl font-extrabold text-gray-900 mt-1">
              {fmtMoney(result.conversionUplift)}
            </p>
            <p className="text-xs text-gray-400 mt-1">+2.5% en campañas activadas</p>
          </div>
          <div className="kpi-card" style={{ background: '#032D60', borderTop: '3px solid #1589EE' }}>
            <p className="text-xs text-blue-300 font-medium uppercase tracking-wide">
              Beneficio Anual Total
            </p>
            <p className="text-2xl font-extrabold text-white mt-1">
              {fmtMoney(result.totalAnnualBenefit)}
            </p>
            <p className="text-xs text-blue-300 mt-1">Estimación conservadora</p>
          </div>
        </div>
      </div>

      {/* ── Credit Detail Table ── */}
      <div className="chart-container">
        <h2 className="text-base font-bold text-gray-800 mb-4">
          Desglose Detallado de Créditos
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b-2 border-gray-100">
                <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Categoría
                </th>
                <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">
                  Volumen
                </th>
                <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">
                  Créditos
                </th>
                <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">
                  % del Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                { cat: 'Batch Pipeline', vol: result.batchPipelineVol, cred: result.batchPipelineCredits },
                { cat: 'Transform', vol: result.transformVol, cred: result.transformCredits },
                { cat: 'Stream Engagement', vol: result.streamEngVol, cred: result.streamEngCredits },
                { cat: 'Stream Profiles', vol: result.streamProfVol, cred: result.streamProfCredits },
                { cat: 'Stream Transform', vol: result.streamTransformVol, cred: result.streamTransformCredits },
                { cat: 'Unificación / Identity', vol: result.unificationVol, cred: result.unificationCredits },
                { cat: 'Calculated Insights', vol: result.calcInsightsVol, cred: result.calcInsightsCredits },
                { cat: 'Queries / Data Explorer', vol: result.queryVol, cred: result.queryCredits },
                { cat: 'Segmentación', vol: result.segmentationVol, cred: result.segmentationCredits },
                { cat: 'Activación', vol: result.activationVol, cred: result.activationCredits },
                { cat: 'Data Graphs', vol: 2, cred: result.dataGraphsCredits },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="py-2 text-gray-700 font-medium">{row.cat}</td>
                  <td className="py-2 text-gray-500 text-right font-mono text-xs">
                    {fmt(row.vol)}
                  </td>
                  <td className="py-2 text-gray-800 text-right font-mono font-semibold">
                    {fmt(row.cred)}
                  </td>
                  <td className="py-2 text-gray-400 text-right text-xs">
                    {result.totalCredits > 0
                      ? ((row.cred / result.totalCredits) * 100).toFixed(1)
                      : '0.0'}
                    %
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200 font-bold bg-gray-50">
                <td className="py-3 text-gray-900">Total</td>
                <td className="py-3 text-right" />
                <td className="py-3 text-right text-sf-blue font-mono text-base">
                  {fmt(result.totalCredits)}
                </td>
                <td className="py-3 text-right text-gray-500">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── Recommendations ── */}
      <div className="chart-container">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-5 h-5 text-sf-green" />
          <h2 className="text-base font-bold text-gray-800">{recs.title}</h2>
        </div>
        <div className="space-y-3">
          {recs.items.map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-sf-blue text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Disclaimer ── */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-xs text-amber-800">
          <strong>Aviso:</strong> Esta es una estimación preliminar generada automáticamente con
          base en los parámetros ingresados. Los resultados reales pueden variar. Esta herramienta
          no reemplaza un análisis técnico formal. Se recomienda validar con el equipo de
          Solution Engineering de Salesforce antes de presentar propuestas formales.
        </p>
      </div>

      {/* ── Action Buttons ── */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 no-print">
        <button type="button" className="sf-btn-secondary" onClick={onReset}>
          <RefreshCw className="w-4 h-4" /> Recalcular
        </button>
        <button
          type="button"
          className="sf-btn-primary"
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? (
            <>
              <span className="spinner w-4 h-4 border-2" /> Generando PDF...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" /> Exportar PDF Ejecutivo
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ResultsDashboard;
