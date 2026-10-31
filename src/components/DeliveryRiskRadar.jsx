import React from 'react';
import { AlertTriangle, TrendingUp } from 'lucide-react';

export default function DeliveryRiskRadar({ actionItems = [] }) {
  if (!actionItems || actionItems.length === 0) return null;

  let lowRiskCount = 0;
  let mediumRiskCount = 0;
  let highRiskCount = 0;

  const ownerCounts = {};

  actionItems.forEach(item => {
    const isUnassigned = !item.owner || item.owner === 'Unassigned';
    const isNoDeadline = !item.deadline || item.deadline === 'Not specified';
    const isTentative = item.commitment === 'Tentative' || item.commitment === 'Vague';

    if (isUnassigned || isNoDeadline) {
      highRiskCount++;
    } else if (isTentative) {
      mediumRiskCount++;
    } else {
      lowRiskCount++;
    }

    if (!isUnassigned) {
      ownerCounts[item.owner] = (ownerCounts[item.owner] || 0) + 1;
    }
  });

  const overloadedOwners = Object.entries(ownerCounts).filter(entry => entry[1] >= 2);

  const total = actionItems.length;
  const onTrackScore = Math.round(((lowRiskCount * 1.0 + mediumRiskCount * 0.6) / total) * 100);

  return (
    <div className="bg-cream-50 border border-cream-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 my-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cream-200/80 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-charcoal-900 flex items-center">
              <span>Delivery Risk & Execution Reliability Radar</span>
              <span className="ml-2 text-[10px] font-semibold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                AI Risk Model
              </span>
            </h4>
            <p className="text-[11px] text-charcoal-50">
              Linguistic commitment analysis & workload distribution assessment.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-charcoal-50">Sprint On-Track Index:</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            onTrackScore >= 80 
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
              : onTrackScore >= 50 
              ? 'bg-amber-100 text-amber-800 border border-amber-300'
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}>
            {onTrackScore}% Projected Confidence
          </span>
        </div>
      </div>

      {overloadedOwners.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start space-x-2 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold">Capacity Warning Detected:</strong>{' '}
            {overloadedOwners.map(([name, count]) => `${name} (${count} commitments)`).join(', ')}{' '}
            has multiple deliverables assigned in this single meeting. Consider load-balancing to avoid delivery slippage.
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 text-xs">
        <div className="bg-white/70 border border-cream-200 rounded-xl p-2.5 text-center">
          <span className="text-[10px] uppercase font-semibold text-charcoal-50 block mb-0.5">Firm Commitments</span>
          <span className="font-bold text-sm text-emerald-700">{lowRiskCount}</span>
        </div>
        <div className="bg-white/70 border border-cream-200 rounded-xl p-2.5 text-center">
          <span className="text-[10px] uppercase font-semibold text-charcoal-50 block mb-0.5">Tentative / Soft</span>
          <span className="font-bold text-sm text-amber-600">{mediumRiskCount}</span>
        </div>
        <div className="bg-white/70 border border-cream-200 rounded-xl p-2.5 text-center">
          <span className="text-[10px] uppercase font-semibold text-charcoal-50 block mb-0.5">High Risk / Unassigned</span>
          <span className="font-bold text-sm text-red-600">{highRiskCount}</span>
        </div>
      </div>
    </div>
  );
}
