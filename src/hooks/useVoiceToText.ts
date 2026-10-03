import { useState, useEffect, useRef, useCallback } from 'react';

// Web Speech API interface declarations for TypeScript compatibility
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

interface UseVoiceToTextOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
}

export function useVoiceToText(options: UseVoiceToTextOptions = {}) {
  const {
    lang = 'en-US',
    continuous = false,
    interimResults = true,
    onResult,
    onError,
  } = options;

  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionClass =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      setIsSupported(Boolean(SpeechRecognitionClass));
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Recognition might already be stopped
      }
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(
    (customCallback?: (text: string) => void) => {
      setErrorMessage(null);

      if (typeof window === 'undefined') {
        const err = 'Voice recognition is not available in this environment';
        setErrorMessage(err);
        if (onError) onError(err);
        return;
      }

      const SpeechRecognitionClass =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognitionClass) {
        const err = 'Web Speech API is not supported by your browser. Please use Chrome, Edge, or Safari.';
        setErrorMessage(err);
        if (onError) onError(err);
        return;
      }

      // If already listening, stop first
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }

      try {
        const recognition = new SpeechRecognitionClass();
        recognition.continuous = continuous;
        recognition.interimResults = interimResults;
        recognition.lang = lang;

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const item = event.results[i];
            if (item && item[0]) {
              currentTranscript += item[0].transcript;
            }
          }

          if (currentTranscript.trim()) {
            setTranscript(currentTranscript);
            if (customCallback) {
              customCallback(currentTranscript);
            }
            if (onResult) {
              onResult(currentTranscript);
            }
          }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          let friendlyError = 'Speech recognition error occurred';
          if (event.error === 'not-allowed') {
            friendlyError = 'Microphone permission was denied. Please allow microphone access.';
          } else if (event.error === 'no-speech') {
            friendlyError = 'No speech was detected. Please try again.';
          } else if (event.error === 'network') {
            friendlyError = 'Network error during voice transcription.';
          }

          setErrorMessage(friendlyError);
          setIsListening(false);
          if (onError) onError(friendlyError);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to start microphone';
        setErrorMessage(msg);
        setIsListening(false);
        if (onError) onError(msg);
      }
    },
    [continuous, interimResults, lang, onResult, onError]
  );

  const toggleListening = useCallback(
    (customCallback?: (text: string) => void) => {
      if (isListening) {
        stopListening();
      } else {
        startListening(customCallback);
      }
    },
    [isListening, startListening, stopListening]
  );

  return {
    isListening,
    transcript,
    isSupported,
    errorMessage,
    startListening,
    stopListening,
    toggleListening,
  };
}
