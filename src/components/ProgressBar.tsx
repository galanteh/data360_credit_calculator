import React from 'react';
import { CheckCircle } from 'lucide-react';

interface ProgressBarProps {
  currentStep: number;
}

const STEPS = [
  { label: 'Escala y Datos', sublabel: 'Industria y volúmenes' },
  { label: 'Unificación', sublabel: 'Streaming e identidad' },
  { label: 'Analítica', sublabel: 'Segmentación e insights' },
  { label: 'Activación', sublabel: 'Canales y edición' },
];

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep }) => {
  return (
    <div className="w-full px-4 py-6">
      {/* Mobile: simple pill indicators */}
      <div className="flex sm:hidden items-center justify-between mb-2">
        {STEPS.map((step, idx) => (
          <div
            key={idx}
            className={`h-2 rounded-full flex-1 mx-0.5 transition-all duration-300 ${
              idx + 1 < currentStep
                ? 'bg-sf-green'
                : idx + 1 === currentStep
                ? 'bg-sf-blue'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <p className="sm:hidden text-center text-sm text-gray-500 font-medium">
        Paso {currentStep} de {STEPS.length}: {STEPS[currentStep - 1]?.label}
      </p>

      {/* Desktop: full step indicators */}
      <div className="hidden sm:flex items-start justify-between relative">
        {/* Connecting line behind steps */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 z-0" style={{ left: '12.5%', right: '12.5%' }} />
        {/* Progress line */}
        <div
          className="absolute top-5 h-0.5 bg-sf-blue z-0 transition-all duration-500"
          style={{
            left: '12.5%',
            width: `${((currentStep - 1) / (STEPS.length - 1)) * 75}%`,
          }}
        />

        {STEPS.map((step, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;
          const isFuture = stepNum > currentStep;

          return (
            <div key={idx} className="flex flex-col items-center z-10 flex-1">
              {/* Circle */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  isCompleted
                    ? 'bg-sf-green text-white shadow-md'
                    : isActive
                    ? 'bg-sf-blue text-white shadow-lg ring-4 ring-blue-100'
                    : 'bg-white border-2 border-gray-200 text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <span>{stepNum}</span>
                )}
              </div>

              {/* Labels */}
              <div className="mt-2 text-center">
                <p
                  className={`text-xs font-semibold leading-tight ${
                    isActive
                      ? 'text-sf-blue'
                      : isCompleted
                      ? 'text-sf-green'
                      : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </p>
                <p
                  className={`text-xs leading-tight mt-0.5 ${
                    isActive || isCompleted ? 'text-gray-500' : 'text-gray-300'
                  }`}
                >
                  {step.sublabel}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressBar;
