import React, { useState, useCallback } from 'react';
import ProgressBar from './components/ProgressBar';
import QuestionnaireForm from './components/QuestionnaireForm';
import ResultsDashboard from './components/ResultsDashboard';
import LogoUploader from './components/LogoUploader';
import { FormData, CalculationResult } from './types';
import { calculate } from './engine/calculatorEngine';

const DEFAULT_FORM_DATA: FormData = {
  // Block 1
  industry: '',
  profiles: 1_000_000,
  connectedSystems: 3,
  engagement: 5_000_000,

  // Block 2
  streamEngPercent: 20,
  streamProfPercent: 10,
  identityFragmentation: 2,

  // Block 3
  segmentCreationTime: '1-2d',
  segments: 50,
  refreshFreq: 1,
  calcInsightsDay: 5,
  queriesDay: 50,

  // Block 4
  channels: [],
  activationsYr: 500,
  engagementTimeframe: 30,
  edition: 'flex',

  // Meta
  accountName: '',
  contactName: '',
  logoBase64: undefined,
};

// Steren reference case — expected result: ~11.17M credits (official reference: ~11.27M)
// Difference due to retail daily_update locked at 10% vs engine default 15%.
const STEREN_DEMO_DATA: FormData = {
  industry: 'retail',
  profiles: 2_000_000,
  connectedSystems: 5,
  engagement: 9_000_000,
  streamEngPercent: 0,
  streamProfPercent: 0,
  identityFragmentation: 2,
  segmentCreationTime: '1-2d',
  segments: 200,
  refreshFreq: 1,
  calcInsightsDay: 5,
  queriesDay: 50,
  channels: ['email', 'paid_media'],
  activationsYr: 1000,
  engagementTimeframe: 30,
  edition: 'profiles',
  accountName: 'Steren',
  contactName: 'Caso de Prueba Oficial',
  logoBase64: undefined,
  dailyUpdateOverride: 10,
};

type AppStep = 1 | 2 | 3 | 4 | 5; // 5 = results

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(1);
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM_DATA);
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleNext = useCallback(() => {
    setStep((s) => Math.min(s + 1, 4) as AppStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleBack = useCallback(() => {
    setStep((s) => Math.max(s - 1, 1) as AppStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleCalculate = useCallback(() => {
    setLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Brief artificial delay for UX polish
    setTimeout(() => {
      const result = calculate(formData);
      setResults(result);
      setStep(5);
      setLoading(false);
    }, 800);
  }, [formData]);

  const handleReset = useCallback(() => {
    setStep(1);
    setResults(null);
    setFormData(DEFAULT_FORM_DATA);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleLoadDemo = useCallback(() => {
    setStep(1);
    setResults(null);
    setFormData(STEREN_DEMO_DATA);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#F3F6FB' }}>
      {/* Top navigation bar */}
      <nav className="sticky top-0 z-50 shadow-sm" style={{ background: 'linear-gradient(135deg, #032D60 0%, #0070D2 100%)' }}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Salesforce Cloud logo SVG */}
            <svg width="28" height="20" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path
                d="M11.5 3C12.7 1.2 14.7 0 17 0C20.3 0 23 2.7 23 6C23 6.3 23 6.5 22.9 6.8C24.2 7.3 25.1 8.5 25.1 10C25.1 11.9 23.6 13.4 21.7 13.4H7C4.8 13.4 3 11.6 3 9.4C3 7.4 4.5 5.8 6.4 5.5C6.1 5 6 4.5 6 4C6 2 7.6 0.5 9.5 0.5C10.2 0.5 10.9 0.7 11.5 1.1V3Z"
                fill="white"
                opacity="0.9"
              />
            </svg>
            <div>
              <div className="text-white font-bold text-sm leading-tight">Salesforce Data 360</div>
              <div className="text-blue-200 text-xs">Credit Calculator</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Logo preview in nav when uploaded */}
            {formData.logoBase64 && (
              <div className="hidden sm:flex items-center bg-white/10 rounded-lg px-2 py-1">
                <LogoUploader
                  logoBase64={formData.logoBase64}
                  onChange={(v) => handleChange({ logoBase64: v })}
                  compact
                />
              </div>
            )}

            {step < 5 && (
              <>
                <span className="text-blue-200 text-xs font-medium hidden sm:block">
                  Paso {step} de 4
                </span>
                <button
                  type="button"
                  onClick={handleLoadDemo}
                  className="text-blue-200 text-xs font-medium bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-all border border-white/20 hidden sm:flex items-center gap-1.5"
                  title="Precarga el caso de referencia Steren (2M perfiles, resultado ~11.17M créditos)"
                >
                  🧪 Demo Steren
                </button>
              </>
            )}
            {step === 5 && (
              <button
                type="button"
                onClick={handleReset}
                className="text-white text-xs font-semibold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-all"
              >
                ↩ Nueva Estimación
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 pb-16">
        {/* Loading overlay */}
        {loading && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
            <div className="spinner" />
            <div className="text-center">
              <p className="font-bold text-gray-800 text-lg">Calculando tu estimación...</p>
              <p className="text-gray-500 text-sm mt-1">Procesando {(formData.profiles / 1_000_000).toFixed(1)}M perfiles</p>
            </div>
          </div>
        )}

        {step < 5 && (
          <>
            {/* Progress bar */}
            <div className="sf-card mt-6 mb-4 px-2">
              <ProgressBar currentStep={step} />
            </div>

            {/* Form container */}
            <div className="sf-card p-6">
              <QuestionnaireForm
                step={step}
                formData={formData}
                onChange={handleChange}
                onNext={handleNext}
                onBack={handleBack}
                onCalculate={handleCalculate}
              />
            </div>
          </>
        )}

        {step === 5 && results && (
          <div className="mt-6">
            <ResultsDashboard
              result={results}
              formData={formData}
              onReset={handleReset}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-8 py-4">
        <div className="max-w-5xl mx-auto px-4 text-center text-xs text-gray-400">
          Salesforce Data 360 Credit Calculator &copy; {new Date().getFullYear()} &nbsp;|&nbsp;
          Estimación preliminar sujeta a validación técnica con Solution Engineering
        </div>
      </footer>
    </div>
  );
};

export default App;
