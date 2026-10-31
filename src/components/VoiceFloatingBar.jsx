import React, { useState } from 'react';
import useSpeech from './useSpeech';
import { Mic, ArrowUp } from 'lucide-react';

export default function VoiceFloatingBar({ 
  onExecuteVoiceCommand, 
  isProcessingVoiceCommand, 
  onOpenWisprModal 
}) {
  const [command, setCommand] = useState('');
  const { isListening, error, toggle: toggleMic } = useSpeech(setCommand);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!command.trim() || isProcessingVoiceCommand) return;
    onExecuteVoiceCommand(command);
    setCommand('');
  };

  return (
    <div className="voice-bar fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-40">
      {error && <p role="alert" className="notice error">{error}</p>}
      <form
        onSubmit={handleSubmit}
        className="bg-cream-50/95 backdrop-blur-md border border-cream-200/90 rounded-full px-3 py-2 shadow-xl flex items-center justify-between gap-3 transition-all hover:border-cream-300 focus-within:border-terracotta-500 focus-within:ring-2 focus-within:ring-terracotta-500/20"
      >
        {/* Left Mic Button */}
        <button
          type="button"
          aria-label={isListening ? "Stop microphone" : "Start microphone"}
          disabled={isProcessingVoiceCommand}
          onClick={toggleMic}
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
            isListening
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-cream-150 hover:bg-cream-200 text-charcoal-900'
          }`}
          title="Dictate with Wispr Flow or Click to Speak"
        >
          <Mic className="w-4 h-4" />
        </button>

        {/* Input Text */}
        <input
          aria-label="Task command"
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder='Try: "Reassign task 1 to Rahul"...'
          className="flex-1 bg-transparent border-none text-xs sm:text-sm text-charcoal-900 placeholder:text-charcoal-50/70 focus:outline-none"
        />

        {/* Right Wispr Flow Branding */}
        <button type="button"
          onClick={onOpenWisprModal}
          className="hidden sm:flex items-center space-x-1.5 text-xs text-charcoal-100 hover:text-purple-700 cursor-pointer transition-colors px-2 shrink-0 select-none"
        >
          {/* Soundwave icon */}
          <div className="flex items-center space-x-0.5 text-purple-600">
            <span className="w-0.5 h-2 bg-purple-600 rounded-full" />
            <span className="w-0.5 h-3.5 bg-purple-600 rounded-full" />
            <span className="w-0.5 h-2 bg-purple-600 rounded-full" />
          </div>
          <span className="text-[11px] text-charcoal-50">Dictate with <strong className="text-charcoal-900 font-semibold">Wispr Flow</strong></span>
        </button>

        {/* Submit Up-Arrow Button */}
        <button
          aria-label="Apply task command"
          type="submit"
          disabled={!command.trim() || isProcessingVoiceCommand}
          className="w-9 h-9 rounded-full bg-forest-900 hover:bg-black text-white flex items-center justify-center shrink-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
        >
          {isProcessingVoiceCommand ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <ArrowUp className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  );
}
