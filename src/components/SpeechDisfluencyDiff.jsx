import React, { useState } from 'react';
import { Mic, CheckCircle2 } from 'lucide-react';

export default function SpeechDisfluencyDiff({ transcript }) {
  const [showCleaned, setShowCleaned] = useState(false);

  if (!transcript) return null;

  const renderHighlightedTranscript = () => {
    const fillerRegex = /\b(um|uh)\b/i;
    const parts = transcript.split(/(\b(?:um|uh)\b|no wait|wait no|actually|instead)/gi);

    return parts.map((part, idx) => {
      if (fillerRegex.test(part)) {
        return (
          <span 
            key={idx} 
            className="line-through text-red-500/70 bg-red-50 px-1 rounded text-xs font-mono select-none"
            title="Filler highlighted in this display; source evidence is preserved"
          >
            {part}
          </span>
        );
      }
      if (/no wait|wait no|actually|instead/i.test(part)) {
        return (
          <span 
            key={idx} 
            className="bg-amber-100 text-amber-900 border border-amber-300 font-bold px-1.5 py-0.5 rounded text-xs mx-0.5 inline-flex items-center"
            title="Possible self-correction; verify against the source"
          >
            ⚡ {part}
          </span>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div className="bg-cream-50 border border-purple-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3 my-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-100 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-charcoal-900 flex items-center">
              <span>Speech Disfluency & Self-Correction Diff</span>
              <span className="ml-2 text-[10px] font-semibold px-2 py-0.2 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                Transcript preview
              </span>
            </h4>
            <p className="text-[11px] text-charcoal-50">
              Highlights possible fillers and corrections. Original evidence stays unchanged.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 text-xs">
          <button
            type="button"
            onClick={() => setShowCleaned(false)}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              !showCleaned 
                ? 'bg-purple-700 text-white shadow-sm' 
                : 'text-charcoal-100 hover:bg-cream-200'
            }`}
          >
            Disfluency Diff View
          </button>
          <button
            type="button"
            onClick={() => setShowCleaned(true)}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              showCleaned 
                ? 'bg-purple-700 text-white shadow-sm' 
                : 'text-charcoal-100 hover:bg-cream-200'
            }`}
          >
            Sanitized Output
          </button>
        </div>
      </div>

      <div className="bg-white/80 border border-cream-200 rounded-xl p-3.5 text-xs text-charcoal-900 leading-relaxed font-mono">
        {!showCleaned ? (
          renderHighlightedTranscript()
        ) : (
          <div className="space-y-2">
            <div className="flex items-center space-x-1.5 text-emerald-700 font-semibold mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Reading preview — dates and intent still need review:</span>
            </div>
            <p className="text-charcoal-800">
              {transcript
                .replace(/\b(um|uh)\b/gi, '')
                .replace(/\s+/g, ' ')
                .trim()}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between text-[11px] text-charcoal-50 pt-1">
        <div className="flex items-center space-x-3">
          <span className="flex items-center">
            <span className="w-2 h-2 rounded bg-red-400 mr-1" /> Stripped Filler
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 rounded bg-amber-400 mr-1" /> Self-Correction Point
          </span>
        </div>
        <span className="font-mono text-emerald-700 font-semibold">
          Display aid — no measured accuracy score
        </span>
      </div>
    </div>
  );
}
