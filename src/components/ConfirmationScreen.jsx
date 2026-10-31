import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, User, Calendar, Sparkles, ArrowRight, Edit2, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ConfirmationScreen({
  extractionData,
  onCommitToExecution,
  onUpdateActionItem
}) {
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});

  if (!extractionData) return null;

  const { summary, decisions, actionItems } = extractionData;

  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setEditValues({
      task: item.task,
      owner: item.owner,
      deadline: item.deadline,
      priority: item.priority
    });
  };

  const handleSaveEdit = (id) => {
    onUpdateActionItem(id, editValues);
    setEditingId(null);
  };

  const handleToggleStatus = (id, currentStatus) => {
    const nextStatus = currentStatus === 'approved' ? 'rejected' : 'approved';
    onUpdateActionItem(id, { reviewStatus: nextStatus });
  };

  const handleCommitAll = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}
    onCommitToExecution();
  };

  return (
    <div className="space-y-6 my-6">
      
      {/* Executive Summary Card */}
      {summary && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-md">
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" />
            <span>AI Executive Synthesis</span>
          </div>
          <p className="text-slate-200 text-sm sm:text-base leading-relaxed font-medium">
            {summary}
          </p>
        </div>
      )}

      {/* Decisions Extracted */}
      {decisions && decisions.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center">
              <span>Decisions Formally Agreed</span>
              <span className="ml-2 text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
                {decisions.length}
              </span>
            </h3>
            <span className="text-xs text-slate-400">Synced to ledger upon approval</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {decisions.map((dec) => (
              <div 
                key={dec.id}
                className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                  <span className="font-semibold text-indigo-300">{dec.topic || "Consensus"}</span>
                  <span className="text-[11px] text-slate-500">{dec.speaker || "Team"}</span>
                </div>
                <p className="text-sm text-slate-200 font-semibold mb-2">
                  {dec.decision}
                </p>
                {dec.quote && (
                  <p className="text-xs italic text-slate-400 border-l-2 border-indigo-500/40 pl-2">
                    "{dec.quote}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Items Review */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base sm:text-lg font-bold text-white">
                2. Review & Confirm Action Items
              </h3>
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                {actionItems?.length || 0} extracted
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Verify owners, commitment confidence, and deadlines before syncing to the Kanban board.
            </p>
          </div>

          {/* Commit Button */}
          <button
            onClick={handleCommitAll}
            className="px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 flex items-center justify-center space-x-2 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Commit to Execution Board</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        {/* Action Items Cards */}
        <div className="space-y-3">
          {actionItems?.map((item) => {
            const isEditing = editingId === item.id;
            const isApproved = item.reviewStatus !== 'rejected';

            return (
              <div
                key={item.id}
                className={`rounded-xl border p-4 transition-all ${
                  isApproved 
                    ? 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700' 
                    : 'bg-slate-950/30 border-red-900/30 opacity-60'
                }`}
              >
                {isEditing ? (
                  /* Edit Mode */
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editValues.task}
                      onChange={(e) => setEditValues({ ...editValues, task: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white"
                      placeholder="Task description"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={editValues.owner}
                        onChange={(e) => setEditValues({ ...editValues, owner: e.target.value })}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                        placeholder="Owner"
                      />
                      <input
                        type="text"
                        value={editValues.deadline}
                        onChange={(e) => setEditValues({ ...editValues, deadline: e.target.value })}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                        placeholder="Deadline"
                      />
                      <select
                        value={editValues.priority}
                        onChange={(e) => setEditValues({ ...editValues, priority: e.target.value })}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                      >
                        <option value="High">Priority: High</option>
                        <option value="Medium">Priority: Medium</option>
                        <option value="Low">Priority: Low</option>
                      </select>
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 rounded text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(item.id)}
                        className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center space-x-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-2 flex-1">
                      {/* Title & Priority */}
                      <div className="flex items-start space-x-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border mt-0.5 ${
                          item.priority === 'High'
                            ? 'bg-red-500/10 text-red-400 border-red-500/30'
                            : item.priority === 'Medium'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        }`}>
                          {item.priority || 'Medium'}
                        </span>
                        <h4 className={`text-sm font-semibold ${isApproved ? 'text-slate-100' : 'text-slate-400 line-through'}`}>
                          {item.task}
                        </h4>
                      </div>

                      {/* Metadata Chips: Assignee, Deadline, Commitment Level */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {/* Assignee */}
                        <span className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-slate-900 text-slate-300 border border-slate-800">
                          <User className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="font-medium">{item.owner || "Unassigned"}</span>
                        </span>

                        {/* Deadline */}
                        <span className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-slate-900 text-slate-300 border border-slate-800">
                          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{item.deadline || "No deadline"}</span>
                        </span>

                        {/* Commitment Strength */}
                        <span className={`px-2 py-1 rounded-md text-[11px] font-medium border ${
                          item.commitment === 'Firm'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : item.commitment === 'Tentative'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        }`}>
                          Commitment: {item.commitment || 'Normal'}
                        </span>
                      </div>

                      {/* Ambiguity / Missing Info Warning */}
                      {item.missingInfo && item.missingInfo.length > 0 && (
                        <div className="flex items-center space-x-1.5 text-xs text-amber-400/90 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>Needs PM Attention: {item.missingInfo.join(', ')}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions: Edit, Approve/Reject */}
                    <div className="flex items-center space-x-2 sm:self-center">
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                        title="Edit task manually"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleToggleStatus(item.id, item.reviewStatus)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                          isApproved
                            ? 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {isApproved ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approved</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Rejected</span>
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
