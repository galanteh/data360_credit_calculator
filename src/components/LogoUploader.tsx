import React, { useCallback, useRef, useState } from 'react';
import { Upload, X, Image } from 'lucide-react';

interface LogoUploaderProps {
  logoBase64?: string;
  onChange: (base64: string | undefined) => void;
  compact?: boolean;
}

const ACCEPTED = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
const MAX_SIZE_MB = 2;

const LogoUploader: React.FC<LogoUploaderProps> = ({ logoBase64, onChange, compact = false }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  const processFile = useCallback(
    (file: File) => {
      setError('');
      if (!ACCEPTED.includes(file.type)) {
        setError('Formato no soportado. Usa PNG, JPG o SVG.');
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`El archivo supera ${MAX_SIZE_MB}MB.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => onChange(e.target?.result as string);
      reader.readAsDataURL(file);
    },
    [onChange]
  );

  const handleFiles = (files: FileList | null) => {
    if (files && files[0]) processFile(files[0]);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [processFile]
  );

  if (compact && logoBase64) {
    return (
      <div className="flex items-center gap-2">
        <img
          src={logoBase64}
          alt="Logo cliente"
          className="h-8 max-w-[80px] object-contain rounded"
        />
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="text-gray-400 hover:text-red-500 transition-colors"
          title="Quitar logo"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div>
      {logoBase64 ? (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
          <img
            src={logoBase64}
            alt="Logo cargado"
            className="h-12 max-w-[140px] object-contain rounded"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-700">Logo cargado</p>
            <p className="text-xs text-gray-400">Se incluirá en el encabezado del PDF</p>
          </div>
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
            title="Quitar logo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
            dragging
              ? 'border-sf-blue bg-blue-50'
              : 'border-gray-200 bg-gray-50 hover:border-sf-blue hover:bg-blue-50/40'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            {dragging ? (
              <Upload className="w-5 h-5 text-sf-blue" />
            ) : (
              <Image className="w-5 h-5 text-sf-blue" />
            )}
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold text-gray-700">
              {dragging ? 'Suelta el archivo aquí' : 'Arrastra o haz clic para subir el logo'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, SVG — máx. {MAX_SIZE_MB}MB</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(',')}
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default LogoUploader;
