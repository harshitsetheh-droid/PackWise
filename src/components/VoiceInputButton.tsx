import React, { useState } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { useVoiceToText } from '../hooks/useVoiceToText';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  tooltip?: string;
  continuous?: boolean;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  className = '',
  size = 'md',
  tooltip = 'Click to describe with your microphone (Voice-to-Text)',
  continuous = false,
}) => {
  const [showErrorToast, setShowErrorToast] = useState<boolean>(false);

  const {
    isListening,
    isSupported,
    errorMessage,
    toggleListening,
  } = useVoiceToText({
    continuous,
    interimResults: true,
    onResult: (text) => {
      onTranscript(text);
    },
    onError: () => {
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 5000);
    },
  });

  const sizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-sm',
    lg: 'p-2.5 text-base',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => toggleListening((text) => onTranscript(text))}
        className={`rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
          sizeClasses[size]
        } ${
          isListening
            ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-400/50 animate-pulse shadow-md'
            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 hover:border-emerald-500 shadow-2xs'
        } ${className}`}
        title={isListening ? 'Listening... Click to stop recording' : tooltip}
        aria-label={isListening ? 'Stop microphone voice input' : 'Start microphone voice input'}
      >
        {isListening ? (
          <>
            <MicOff className={`${iconSizes[size]} text-white shrink-0`} />
            <span className="hidden sm:inline text-[11px] font-extrabold uppercase tracking-wide">
              Listening...
            </span>
            <span className="flex items-center gap-0.5 ml-0.5">
              <span className="w-1 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1 h-4 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1 h-2 bg-white rounded-full animate-bounce"></span>
            </span>
          </>
        ) : (
          <>
            <Mic className={`${iconSizes[size]} text-emerald-800 shrink-0`} />
            <span className="sr-only">Voice Input</span>
          </>
        )}
      </button>

      {/* Listening Status Floating Indicator */}
      {isListening && (
        <div className="absolute right-0 -top-8 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg flex items-center gap-1 whitespace-nowrap z-50 animate-in fade-in slide-in-from-bottom-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          <span>Speak clearly into microphone...</span>
        </div>
      )}

      {/* Error Toast */}
      {showErrorToast && errorMessage && (
        <div className="absolute right-0 -bottom-10 bg-amber-50 text-amber-900 border border-amber-300 text-[10px] font-semibold px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1.5 whitespace-nowrap z-50 animate-in fade-in">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>{errorMessage}</span>
          <button
            onClick={() => setShowErrorToast(false)}
            className="ml-1 text-slate-400 hover:text-slate-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Fallback tooltip if not supported */}
      {!isSupported && (
        <span className="hidden group-hover:block absolute bottom-full mb-1 text-[10px] bg-slate-800 text-white p-1 rounded whitespace-nowrap">
          Voice recognition supported on Chrome, Safari, and Edge
        </span>
      )}
    </div>
  );
};
