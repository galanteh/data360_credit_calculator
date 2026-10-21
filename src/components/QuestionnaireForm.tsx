import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, AlertTriangle, Info } from 'lucide-react';
import { FormData } from '../types';
import { INDUSTRY_OPTIONS, CHANNEL_OPTIONS } from '../data/industryDefaults';
import LogoUploader from './LogoUploader';

interface QuestionnaireFormProps {
  step: number;
  formData: FormData;
  onChange: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
  onCalculate: () => void;
}

const formatNumber = (n: number) =>
  new Intl.NumberFormat('es-MX').format(n);

const PROFILE_QUICK = [500_000, 1_000_000, 2_000_000, 5_000_000, 10_000_000];
const SEGMENT_CREATION_OPTIONS = [
  { value: 'lt4h', label: '< 4 horas', description: 'Capacidad en tiempo casi real', icon: '⚡' },
  { value: '1-2d', label: '1-2 días', description: 'Proceso batch diario/nocturno', icon: '🌙' },
  { value: '1w', label: '~1 semana', description: 'Ciclo semanal manual', icon: '📅' },
  { value: 'manual', label: 'Manual / Ad-hoc', description: 'Sin proceso definido', icon: '🔧' },
];
const EDITION_OPTIONS = [
  {
    value: 'flex',
    label: 'Data Cloud Flex',
    description: 'Precio estándar por crédito. Máxima flexibilidad.',
    badge: 'Estándar',
    badgeColor: 'bg-gray-100 text-gray-700',
  },
  {
    value: 'profiles',
    label: 'Data Cloud Profiles',
    description: '15% descuento en ingesta y streaming. Basado en perfiles.',
    badge: '-15%',
    badgeColor: 'bg-blue-100 text-sf-blue',
  },
  {
    value: 'enterprise',
    label: 'Data Cloud Enterprise',
    description: '30% descuento en ingesta y streaming. Máximo valor.',
    badge: '-30%',
    badgeColor: 'bg-green-100 text-green-700',
  },
];
const IDENTITY_OPTIONS = [
  {
    value: 1,
    label: 'Simple',
    description: 'Un sistema fuente, pocas duplicaciones. Reglas básicas de identidad.',
    examples: 'Ej: Solo CRM, pocos canales digitales',
  },
  {
    value: 2,
    label: 'Moderada',
    description: 'Múltiples sistemas, matching por email y teléfono. Deduplicación regular.',
    examples: 'Ej: CRM + eCommerce + puntos de venta',
  },
  {
    value: 3,
    label: 'Compleja',
    description: 'Alta fragmentación. Probabilistic matching. Múltiples identidades por cliente.',
    examples: 'Ej: Omnicanal completo, B2B2C, datos de terceros',
  },
];

const SliderField: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  tooltip?: string;
  onChange: (v: number) => void;
  formatValue?: (v: number) => string;
}> = ({ label, value, min, max, step = 1, unit = '', tooltip, onChange, formatValue }) => {
  const pct = ((value - min) / (max - min)) * 100;
  const display = formatValue ? formatValue(value) : `${formatNumber(value)}${unit}`;
  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          {label}
          {tooltip && (
            <span className="group relative cursor-help">
              <Info className="w-3.5 h-3.5 text-gray-400" />
              <span className="hidden group-hover:block absolute left-0 top-5 bg-gray-800 text-white text-xs rounded p-2 w-56 z-50 shadow-lg">
                {tooltip}
              </span>
            </span>
          )}
        </label>
        <span className="text-sm font-bold text-sf-blue bg-blue-50 px-3 py-0.5 rounded-full">
          {display}
        </span>
      </div>
      <div className="relative">
        <div
          className="absolute top-2.5 left-0 h-1.5 rounded-full bg-sf-blue pointer-events-none"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          className="sf-slider"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{formatValue ? formatValue(min) : `${formatNumber(min)}${unit}`}</span>
        <span>{formatValue ? formatValue(max) : `${formatNumber(max)}${unit}`}</span>
      </div>
    </div>
  );
};

const QuestionnaireForm: React.FC<QuestionnaireFormProps> = ({
  step,
  formData,
  onChange,
  onNext,
  onBack,
  onCalculate,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (step === 1) {
      if (!formData.industry) errs.industry = 'Selecciona una industria';
      if (!formData.accountName.trim()) errs.accountName = 'Ingresa el nombre de la cuenta';
    }
    if (step === 4) {
      if (formData.channels.length === 0) errs.channels = 'Selecciona al menos un canal';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      if (step === 4) onCalculate();
      else onNext();
    }
  };

  const engagementWarning =
    formData.engagement > 0 && formData.profiles > 0 && formData.engagement < formData.profiles * 2;

  // ── STEP 1 ───────────────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Escala y Fuentes de Datos</h2>
          <p className="text-gray-500 mt-1 text-sm">
            Define el volumen de datos para dimensionar el consumo de créditos Data 360
          </p>
        </div>

        {/* Account / Contact / Logo */}
        <div className="sf-card p-5 space-y-4">
          <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide text-sf-blue">
            Información de la Oportunidad
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Nombre de la Cuenta *
              </label>
              <input
                className={`sf-input ${errors.accountName ? 'border-red-400' : ''}`}
                placeholder="Ej: Grupo Financiero XYZ"
                value={formData.accountName}
                onChange={(e) => onChange({ accountName: e.target.value })}
              />
              {errors.accountName && (
                <p className="text-red-500 text-xs mt-1">{errors.accountName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Nombre del Contacto
              </label>
              <input
                className="sf-input"
                placeholder="Ej: Ana Martínez, Director de Marketing"
                value={formData.contactName}
                onChange={(e) => onChange({ contactName: e.target.value })}
              />
            </div>
          </div>

          {/* Logo upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Logotipo del Cliente
              <span className="ml-1.5 text-xs font-normal text-gray-400">(opcional — aparece en el PDF ejecutivo)</span>
            </label>
            <LogoUploader
              logoBase64={formData.logoBase64}
              onChange={(v) => onChange({ logoBase64: v })}
            />
          </div>
        </div>

        {/* Industry */}
        <div className="sf-card p-5">
          <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide text-sf-blue mb-4">
            Industria *
          </h3>
          {errors.industry && (
            <p className="text-red-500 text-xs mb-3">{errors.industry}</p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {INDUSTRY_OPTIONS.map((ind) => (
              <button
                key={ind.value}
                type="button"
                onClick={() => {
                  onChange({
                    industry: ind.value,
                    profiles: formData.profiles || ind.defaultProfiles,
                    engagement: formData.engagement || ind.defaultEngagement,
                  });
                  setErrors((e) => ({ ...e, industry: '' }));
                }}
                className={`option-card text-left ${formData.industry === ind.value ? 'selected' : ''}`}
              >
                <div className="text-2xl mb-1">{ind.icon}</div>
                <div className="text-xs font-semibold text-gray-800 leading-tight">{ind.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Profiles */}
        <div className="sf-card p-5">
          <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide text-sf-blue mb-4">
            Volumen de Datos
          </h3>

          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Perfiles Unificados (N)
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {PROFILE_QUICK.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => onChange({ profiles: v })}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    formData.profiles === v
                      ? 'bg-sf-blue text-white border-sf-blue'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-sf-blue hover:text-sf-blue'
                  }`}
                >
                  {v >= 1_000_000 ? `${v / 1_000_000}M` : `${v / 1000}K`}
                </button>
              ))}
            </div>
            <input
              type="number"
              className="sf-input"
              placeholder="O ingresa un número personalizado"
              value={formData.profiles || ''}
              min={10000}
              step={100000}
              onChange={(e) => onChange({ profiles: Number(e.target.value) })}
            />
            <p className="text-xs text-gray-400 mt-1">
              Actualmente: <strong>{formatNumber(formData.profiles)}</strong> perfiles
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Interacciones / Registros de Engagement Histórico
              <span className="ml-1 text-xs text-gray-400">(transacciones, eventos, etc.)</span>
            </label>
            <input
              type="number"
              className="sf-input"
              placeholder="Ej: 10000000"
              value={formData.engagement || ''}
              min={0}
              step={500000}
              onChange={(e) => onChange({ engagement: Number(e.target.value) })}
            />
            <p className="text-xs text-gray-400 mt-1">
              Actualmente: <strong>{formatNumber(formData.engagement)}</strong> registros
            </p>
            {engagementWarning && (
              <div className="warning-box mt-2 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <span>
                  El volumen de engagement parece bajo en relación con el número de perfiles.
                  ¿Están incluidas todas las fuentes de datos?
                </span>
              </div>
            )}
          </div>

          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Sistemas Conectados (fuentes de datos)
            </label>
            <SliderField
              label=""
              value={formData.connectedSystems}
              min={1}
              max={20}
              unit=" sistemas"
              onChange={(v) => onChange({ connectedSystems: v })}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="button" className="sf-btn-primary" onClick={handleNext}>
            Siguiente <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ── STEP 2 ───────────────────────────────────────────────────────────────
  if (step === 2) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Unificación e Identidad</h2>
          <p className="text-gray-500 mt-1 text-sm">
            Configura las capacidades de streaming y resolución de identidad
          </p>
        </div>

        {/* Streaming */}
        <div className="sf-card p-5">
          <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide text-sf-blue mb-4">
            Ingestión en Streaming
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            ¿Qué porcentaje de tus datos llega en tiempo real vs. batch?
          </p>

          <SliderField
            label="% de Engagement en Streaming"
            value={formData.streamEngPercent}
            min={0}
            max={100}
            unit="%"
            tooltip="Porcentaje de eventos/transacciones que se procesan en tiempo real (no batch nocturno)"
            onChange={(v) => onChange({ streamEngPercent: v })}
          />

          <SliderField
            label="% de Actualizaciones de Perfil en Streaming"
            value={formData.streamProfPercent}
            min={0}
            max={100}
            unit="%"
            tooltip="Porcentaje de actualizaciones de perfil que ocurren en tiempo real"
            onChange={(v) => onChange({ streamProfPercent: v })}
          />

          <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-800">
            <strong>Impacto:</strong> Mayor streaming = más créditos en tiempo real pero mayor
            frescura de datos para activaciones.
          </div>
        </div>

        {/* Identity fragmentation */}
        <div className="sf-card p-5">
          <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide text-sf-blue mb-4">
            Complejidad de Resolución de Identidad
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            ¿Qué tan fragmentada está la identidad del cliente a través de tus sistemas?
          </p>
          <div className="space-y-3">
            {IDENTITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ identityFragmentation: opt.value as 1 | 2 | 3 })}
                className={`w-full text-left option-card ${
                  formData.identityFragmentation === opt.value ? 'selected' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-sm text-gray-800">{opt.label}</div>
                    <div className="text-xs text-gray-600 mt-0.5">{opt.description}</div>
                    <div className="text-xs text-gray-400 mt-1 italic">{opt.examples}</div>
                  </div>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ml-3 ${
                      opt.value === 1 ? 'bg-green-500' : opt.value === 2 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                  >
                    {opt.value}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <button type="button" className="sf-btn-secondary" onClick={onBack}>
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>
          <button type="button" className="sf-btn-primary" onClick={handleNext}>
            Siguiente <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ── STEP 3 ───────────────────────────────────────────────────────────────
  if (step === 3) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Analítica y Segmentación</h2>
          <p className="text-gray-500 mt-1 text-sm">
            Define la profundidad de tus capacidades analíticas
          </p>
        </div>

        {/* Segmentation */}
        <div className="sf-card p-5">
          <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide text-sf-blue mb-4">
            Capacidad de Segmentación Actual
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            ¿Cuánto tiempo tarda hoy en crear un segmento de audiencia listo para activar?
          </p>
          <div className="grid grid-cols-2 gap-3">
            {SEGMENT_CREATION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ segmentCreationTime: opt.value })}
                className={`option-card text-center ${
                  formData.segmentCreationTime === opt.value ? 'selected' : ''
                }`}
              >
                <div className="text-2xl mb-1">{opt.icon}</div>
                <div className="font-semibold text-sm text-gray-800">{opt.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{opt.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Segment count and refresh */}
        <div className="sf-card p-5 space-y-5">
          <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide text-sf-blue">
            Parámetros de Segmentación
          </h3>

          <SliderField
            label="Número de Segmentos Activos"
            value={formData.segments}
            min={5}
            max={500}
            step={5}
            tooltip="Cantidad de segmentos de audiencia que se calculan regularmente"
            onChange={(v) => onChange({ segments: v })}
          />

          <SliderField
            label="Frecuencia de Actualización (veces/día)"
            value={formData.refreshFreq}
            min={1}
            max={24}
            unit="x/día"
            tooltip="¿Con qué frecuencia se recalculan los segmentos?"
            onChange={(v) => onChange({ refreshFreq: v })}
          />

          <SliderField
            label="Ventana de Engagement (días lookback)"
            value={formData.engagementTimeframe}
            min={7}
            max={365}
            step={7}
            unit=" días"
            tooltip="¿Cuántos días hacia atrás se analizan las interacciones?"
            onChange={(v) => onChange({ engagementTimeframe: v })}
          />
        </div>

        {/* Analytics depth */}
        <div className="sf-card p-5 space-y-5">
          <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide text-sf-blue">
            Profundidad Analítica
          </h3>

          <SliderField
            label="Calculated Insights por Día"
            value={formData.calcInsightsDay}
            min={1}
            max={30}
            tooltip="Modelos analíticos, scores y métricas calculadas sobre perfiles"
            onChange={(v) => onChange({ calcInsightsDay: v })}
          />

          <SliderField
            label="Consultas Data Explorer / día"
            value={formData.queriesDay}
            min={5}
            max={1000}
            step={5}
            tooltip="Consultas SQL y exploraciones ad-hoc en Data Cloud"
            onChange={(v) => onChange({ queriesDay: v })}
          />
        </div>

        <div className="flex justify-between">
          <button type="button" className="sf-btn-secondary" onClick={onBack}>
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>
          <button type="button" className="sf-btn-primary" onClick={handleNext}>
            Siguiente <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ── STEP 4 ───────────────────────────────────────────────────────────────
  if (step === 4) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Activación y Edición</h2>
          <p className="text-gray-500 mt-1 text-sm">
            Define los canales de activación y la edición de Data Cloud
          </p>
        </div>

        {/* Channels */}
        <div className="sf-card p-5">
          <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide text-sf-blue mb-4">
            Canales de Activación *
          </h3>
          {errors.channels && (
            <p className="text-red-500 text-xs mb-3">{errors.channels}</p>
          )}
          <p className="text-xs text-gray-500 mb-4">
            Selecciona todos los canales a los que activarás audiencias desde Data Cloud
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CHANNEL_OPTIONS.map((ch) => {
              const selected = formData.channels.includes(ch.value);
              return (
                <button
                  key={ch.value}
                  type="button"
                  onClick={() => {
                    const updated = selected
                      ? formData.channels.filter((c) => c !== ch.value)
                      : [...formData.channels, ch.value];
                    onChange({ channels: updated });
                    setErrors((e) => ({ ...e, channels: '' }));
                  }}
                  className={`option-card text-center py-4 ${selected ? 'selected' : ''}`}
                >
                  <div className="text-2xl mb-1">{ch.icon}</div>
                  <div className="text-xs font-semibold text-gray-800 leading-tight">{ch.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Activations per year */}
        <div className="sf-card p-5 space-y-5">
          <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide text-sf-blue">
            Parámetros de Activación
          </h3>
          <SliderField
            label="Activaciones Totales por Año"
            value={formData.activationsYr}
            min={50}
            max={5000}
            step={50}
            tooltip="Número de campañas/activaciones de audiencia que se ejecutan por año. Típico: 500–2,500 (ej. 12 campañas/mes × 52 semanas)"
            onChange={(v) => onChange({ activationsYr: v })}
          />
        </div>

        {/* Edition */}
        <div className="sf-card p-5">
          <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide text-sf-blue mb-4">
            Edición de Data Cloud
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            La edición determina el precio por crédito y las capacidades incluidas
          </p>
          <div className="space-y-3">
            {EDITION_OPTIONS.map((ed) => (
              <button
                key={ed.value}
                type="button"
                onClick={() => onChange({ edition: ed.value as 'flex' | 'profiles' | 'enterprise' })}
                className={`w-full text-left option-card ${formData.edition === ed.value ? 'selected' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm text-gray-800">{ed.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{ed.description}</div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${ed.badgeColor}`}>
                    {ed.badge}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="sf-card p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-sf-blue flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800">
              <strong>Listo para calcular.</strong> Al presionar "Calcular" se generará la
              estimación de consumo anual de créditos Data 360, el desglose por categoría (Ingesta, Streaming,
              Unificación, Analítica, Segmentación, Activación), los SKUs equivalentes y el impacto financiero (ROI).
              Estimación preliminar.
            </p>
          </div>
        </div>

        <div className="flex justify-between">
          <button type="button" className="sf-btn-secondary" onClick={onBack}>
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>
          <button
            type="button"
            className="sf-btn-primary text-base px-8 py-3 shadow-lg"
            onClick={handleNext}
          >
            ⚡ Calcular Ahora
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default QuestionnaireForm;
