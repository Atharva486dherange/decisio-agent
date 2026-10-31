import React, { useState } from 'react';
import { Mic, CornerDownLeft, CheckCircle2 } from 'lucide-react';

export default function VoiceCommandBar({ 
  onExecuteVoiceCommand, 
  isProcessingVoiceCommand, 
  lastVoiceFeedback 
}) {
  const [commandText, setCommandText] = useState('');
  const [isDictating, setIsDictating] = useState(false);

  const sampleCommands = [
    "Approve all tasks, but assign the second item to Rahul",
    "Approve all and make load testing High priority",
    "Approve everything and set deadline to this Friday"
  ];

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!commandText.trim()) return;
    onExecuteVoiceCommand(commandText);
  };

  const handlePickSample = (sample) => {
    setCommandText(sample);
    onExecuteVoiceCommand(sample);
  };

  const toggleMic = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Dictate directly into this box using Wispr Flow (Hold your Wispr hotkey)!");
      return;
    }

    if (isDictating) {
      setIsDictating(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsDictating(true);
      recognition.onresult = (event) => {
        const spoken = event.results[0][0].transcript;
        setCommandText(spoken);
        setIsDictating(false);
        onExecuteVoiceCommand(spoken);
      };
      recognition.onerror = () => setIsDictating(false);
      recognition.onend = () => setIsDictating(false);

      try {
        recognition.start();
      } catch {
        setIsDictating(false);
      }
    }
  };

  return (
    <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-4 sm:p-5 shadow-xl my-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center">
              Voice-Driven Review & Modification
              <span className="ml-2 text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Wispr Flow Native
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              Speak changes naturally — e.g. "approve all except second item, assign that to Rahul".
            </p>
          </div>
        </div>

        {/* Quick Sample Prompts */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] uppercase font-semibold text-slate-500">Quick Test:</span>
          {sampleCommands.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => handlePickSample(sample)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            >
              "{sample.slice(0, 32)}..."
            </button>
          ))}
        </div>
      </div>

      {/* Spoken Command Input Form */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          type="text"
          value={commandText}
          onChange={(e) => setCommandText(e.target.value)}
          placeholder="Dictate with Wispr Flow or type review instructions..."
          className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-4 pr-24 py-3 text-sm text-slate-200 placeholder-slate-500 font-mono transition-colors"
        />

        <div className="absolute right-2 flex items-center space-x-1.5">
          <button
            type="button"
            onClick={toggleMic}
            className={`p-2 rounded-lg transition-colors ${
              isDictating 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Click to speak command"
          >
            <Mic className="w-4 h-4" />
          </button>

          <button
            type="submit"
            disabled={isProcessingVoiceCommand || !commandText.trim()}
            className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-slate-800 disabled:text-slate-500 transition-colors"
            title="Execute voice command"
          >
            {isProcessingVoiceCommand ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <CornerDownLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </form>

      {/* Last Voice Execution Feedback Badge */}
      {lastVoiceFeedback && (
        <div className="mt-3 flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-lg animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium">{lastVoiceFeedback}</span>
        </div>
      )}
    </div>
  );
}
