import React from 'react';
import { Clock, Check, ShieldAlert, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ConflictLedger({ 
  conflicts, 
  onResolveConflict 
}) {
  if (!conflicts || conflicts.length === 0) {
    return null;
  }

  const handleSupersede = (conflict) => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch {}
    onResolveConflict(conflict.id, 'supersede');
  };

  const handleKeepBoth = (conflict) => {
    onResolveConflict(conflict.id, 'keep_both');
  };

  const handleFlagTeam = (conflict) => {
    onResolveConflict(conflict.id, 'flag_team');
  };

  return (
    <div className="bg-amber-950/20 border-2 border-amber-500/40 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden my-6 animate-in fade-in slide-in-from-top-4 duration-300">
      {/* Visual Indicator Banner */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-amber-500/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base sm:text-lg font-bold text-amber-200">
                Decision Conflict Detected!
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 uppercase tracking-wider">
                Action Required
              </span>
            </div>
            <p className="text-xs text-amber-300/80">
              The agent compared today's spoken agreements against your historical Decision Ledger and identified contradictory commitments.
            </p>
          </div>
        </div>
      </div>

      {/* List of Detected Conflicts */}
      <div className="space-y-4">
        {conflicts.map((conf) => (
          <div 
            key={conf.id}
            className="bg-slate-900/90 rounded-xl border border-amber-500/30 p-4 sm:p-5 shadow-inner"
          >
            {/* Conflict Title & Severity */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {conf.type || "Commitment Clash"}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Severity: <strong className="text-red-400">{conf.severity || "High"}</strong>
              </span>
            </div>

            {/* Explanation */}
            <p className="text-sm text-slate-200 mb-4 font-medium leading-relaxed">
              {conf.explanation}
            </p>

            {/* Side-by-Side Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {/* Past Decision */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 relative">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                  <span className="font-semibold text-slate-300 flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    Past Meeting ({conf.pastMeetingTitle || "Sprint 12"})
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase">Existing Baseline</span>
                </div>
                <div className="text-sm font-semibold text-slate-200 mb-2">
                  {conf.pastAgreed}
                </div>
                {conf.pastQuote && (
                  <div className="text-xs italic text-slate-400 border-l-2 border-slate-700 pl-2">
                    "{conf.pastQuote}"
                  </div>
                )}
              </div>

              {/* New Meeting Decision */}
              <div className="bg-indigo-950/30 border border-indigo-500/40 rounded-xl p-3.5 relative">
                <div className="flex items-center justify-between text-xs text-indigo-300 mb-1.5">
                  <span className="font-semibold text-indigo-200 flex items-center">
                    <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                    Today's Meeting Decision
                  </span>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono uppercase">
                    Proposed Change
                  </span>
                </div>
                <div className="text-sm font-semibold text-indigo-100 mb-2">
                  {conf.newAgreed}
                </div>
                {conf.newQuote && (
                  <div className="text-xs italic text-indigo-300/80 border-l-2 border-indigo-500/60 pl-2">
                    "{conf.newQuote}"
                  </div>
                )}
              </div>
            </div>

            {/* Resolution Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800">
              <span className="text-xs text-slate-400 font-medium">
                Choose resolution strategy:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleKeepBoth(conf)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                >
                  Keep Both (Dual Tracks)
                </button>
                <button
                  onClick={() => handleFlagTeam(conf)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors"
                >
                  Flag for Team Retrospective
                </button>
                <button
                  onClick={() => handleSupersede(conf)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 flex items-center space-x-1.5 transition-all"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Supersede Past Decision</span>
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
