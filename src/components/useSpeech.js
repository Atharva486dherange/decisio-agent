import { useEffect, useRef, useState } from 'react';
export default function useSpeech(onFinal, continuous = false) {
  const callback = useRef(onFinal);
  useEffect(() => { callback.current = onFinal; }, [onFinal]);
  const recognition = useRef(null);
  const [isListening, setListening] = useState(false);
  const [error, setError] = useState('');
  const supported = typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  useEffect(() => () => { if (recognition.current) { recognition.current.onend = null; recognition.current.onresult = null; recognition.current.onerror = null; recognition.current.abort(); } }, []);
  function toggle() {
    if (recognition.current) { recognition.current.stop(); return; }
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) { setError('Browser speech recognition is unavailable. Dictate with Wispr Flow into the field, or type.'); return; }
    const instance = new Recognition();
    recognition.current = instance;
    instance.continuous = continuous;
    instance.interimResults = false;
    instance.lang = 'en-US';
    instance.onstart = () => setListening(true);
    instance.onresult = event => {
      for (let i = event.resultIndex; i < event.results.length; i++) if (event.results[i].isFinal) callback.current(event.results[i][0].transcript);
    };
    instance.onerror = event => setError(event.error === 'not-allowed' ? 'Microphone access was denied. Allow access in your browser, or use typing and Wispr Flow.' : 'Speech capture stopped. Retry or type your text.');
    instance.onend = () => { recognition.current = null; setListening(false); };
    setError('');
    try { instance.start(); } catch { recognition.current = null; setListening(false); setError('Could not start the microphone. Try again.'); }
  }
  return { isListening, error, supported, toggle };
}
