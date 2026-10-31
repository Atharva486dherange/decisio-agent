import React, { useState } from 'react';
import { impactForConflict } from '../../shared/planning';
import { ArrowLeft, ArrowRight, CalendarDays, CircleCheck, ListChecks, Quote, Replace, Copy, Clock3 } from 'lucide-react';
import SpeechDisfluencyDiff from './SpeechDisfluencyDiff';
import DeliveryRiskRadar from './DeliveryRiskRadar';

const dateLabel = text => [...String(text || '').matchAll(/\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?/gi)].at(-1)?.[0] || 'Agreement';

export default function MeetingReview({ draft, tasks = [], conflicts, resolutions, onResolve, onUndo, onCommit, onUpdate, onBack }) {
  const [selected, setSelected] = useState(0);
  const conflict = conflicts[selected] || conflicts[0];
  const decision = draft.decisions.find(d => d.id === conflict?.newDecisionId) || draft.decisions[0];
  const affectedTasks = conflict ? impactForConflict(conflict, tasks) : [];
  const resolution = conflict && resolutions[conflict.id];
  const pending = conflicts.filter(c => !resolutions[c.id]).length;

  return <section className="review-page">
    <button className="back-link" onClick={onBack}><ArrowLeft size={15} /> Back to meetings</button>
    <div className="review-heading">
      <div>
        <span className="eyebrow">{draft.meetingTitle} / Decision review</span>
        <h1>{decision?.topic || 'Meeting review'}</h1>
        <p>{draft.decisions.length} proposed decisions · {draft.actionItems.length} follow-up tasks</p>
      </div>
      <button className="action-button" disabled={pending > 0} onClick={onCommit}>
        <CircleCheck size={16} /> Commit approved review
      </button>
    </div>

    <div className="review-layout">
      <div className="review-main">
        {conflicts.length > 1 && (
          <label className="text-sm">
            Review conflict
            <select className="field mt-2" value={selected} onChange={e => setSelected(Number(e.target.value))}>
              {conflicts.map((c, i) => <option key={c.id} value={i}>{c.newAgreed}</option>)}
            </select>
          </label>
        )}

        {conflict ? (
          <div className="comparison">
            <article className="comparison-card">
              <span><CalendarDays size={19} /> Previous commitment</span>
              <div>
                <strong>{dateLabel(conflict.pastAgreed)}</strong>
                <small>{resolution?.strategy === 'supersede' ? 'Will be superseded' : 'Active baseline'}</small>
              </div>
              <p>{conflict.pastAgreed}</p>
            </article>
            <ArrowRight className="comparison-arrow" size={25} />
            <article className="comparison-card proposed">
              <span><i className="status-dot" /> Proposed decision</span>
              <div>
                <strong>{dateLabel(conflict.newAgreed)}</strong>
                <small>Awaiting commit</small>
              </div>
              <p>{conflict.newAgreed}</p>
            </article>
          </div>
        ) : (
          <article className="comparison-card proposed">
            <span><i className="status-dot" /> Proposed agreements</span>
            <p>{decision?.decision || 'No explicit decision was found. Review the transcript before adding tasks.'}</p>
          </article>
        )}

        {/* 1. Speech Disfluency & Self-Correction Diff (Wispr Flow Native) */}
        {draft.sourceTranscript && (
          <SpeechDisfluencyDiff transcript={draft.sourceTranscript} />
        )}

        {decision?.quote && (
          <figure className="quote-card">
            <span className="avatar-initial">{decision.speaker?.[0] || 'D'}</span>
            <div>
              <blockquote>“{decision.quote}”</blockquote>
              <figcaption>{decision.speaker} · {draft.meetingTitle}</figcaption>
            </div>
          </figure>
        )}

        {/* 2. Delivery Risk & Workload Radar (PM Problem Understanding) */}
        <DeliveryRiskRadar actionItems={draft.actionItems} />

        <section className="paper-card">
          <header className="card-header">
            <h2><ListChecks size={20} /> Follow-up tasks ({draft.actionItems.length})</h2>
            <span className="text-xs text-charcoal-50">Edit before committing</span>
          </header>
          <div className="table-scroll">
            <table className="review-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Owner</th>
                  <th>Due date</th>
                  <th>Priority</th>
                  <th>Review</th>
                </tr>
              </thead>
              <tbody>
                {draft.actionItems.map((t, i) => (
                  <tr key={t.id} className={t.reviewStatus === 'rejected' ? 'rejected-row' : ''}>
                    <td>
                      <div className="task-title">
                        <span className="task-number">{i + 1}</span>
                        <input aria-label={`Task ${i + 1} title`} value={t.task} onChange={e => onUpdate(t.id, { task: e.target.value })} />
                      </div>
                      {t.missingInfo?.length > 0 && <small className="missing-info">{t.missingInfo.join(' · ')}</small>}
                      <details className="task-source">
                        <summary>Source quote</summary>
                        <p>{t.quote}</p>
                      </details>
                    </td>
                    <td>
                      <input aria-label={`Task ${i + 1} owner`} value={t.owner} onChange={e => onUpdate(t.id, { owner: e.target.value })} />
                    </td>
                    <td>
                      <input aria-label={`Task ${i + 1} deadline`} value={t.deadline} onChange={e => onUpdate(t.id, { deadline: e.target.value })} />
                    </td>
                    <td>
                      <select aria-label={`Task ${i + 1} priority`} value={t.priority} onChange={e => onUpdate(t.id, { priority: e.target.value })}>
                        {['High', 'Medium', 'Low'].map(v => <option key={v}>{v}</option>)}
                      </select>
                    </td>
                    <td>
                      <select aria-label={`Task ${i + 1} review`} value={t.reviewStatus} onChange={e => onUpdate(t.id, { reviewStatus: e.target.value })}>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!draft.actionItems.length && (
            <p className="p-5 text-sm text-charcoal-50">
              No explicit commitments found. You can add a task manually on the execution board.
            </p>
          )}
        </section>

        {draft.decisions.length > 1 && (
          <section className="paper-card p-5">
            <h2 className="font-serif text-xl mb-3">All proposed decisions</h2>
            {draft.decisions.map(d => (
              <article className="decision-row" key={d.id}>
                <strong>{d.topic}</strong>
                <p>{d.decision}</p>
              </article>
            ))}
          </section>
        )}

        <details className="source-transcript">
          <summary><Quote size={15} /> Original transcript</summary>
          <p className="whitespace-pre-wrap mt-3">{draft.sourceTranscript}</p>
        </details>
      </div>

      <aside className="change-panel paper-card">
        <h2>What changed?</h2>
        {conflict ? (
          <>
            <div className="change-line">
              <span><i className="status-dot old" /> Earlier decision</span>
              <strong>{dateLabel(conflict.pastAgreed)}</strong>
            </div>
            <div className="change-line">
              <span><i className="status-dot" /> Proposed update</span>
              <strong>{dateLabel(conflict.newAgreed)}</strong>
            </div>
            <hr />
            <div className="text-sm">
              <span className="eyebrow">Source meeting</span>
              <p className="mt-2">{conflict.pastMeetingTitle}</p>
            </div>
            <p className="text-xs text-charcoal-100 leading-relaxed">{conflict.explanation}</p>
            {conflict.pastQuote && <blockquote className="past-quote">“{conflict.pastQuote}”</blockquote>}
            {resolution ? (
              <div className="resolution-result">
                <CircleCheck size={18} />
                <p>
                  Selected: {resolution.strategy.replaceAll('_', ' ')}<br />
                  <button className="underline text-xs mt-2" onClick={() => onUndo(conflict.id)}>Undo selection</button>
                </p>
              </div>
            ) : (
              <div className="resolution-actions">
                <button className="action-button orange" onClick={() => onResolve(conflict.id, 'supersede')}>
                  <Replace size={17} /> Replace earlier decision
                </button>
                <button className="action-button secondary" onClick={() => onResolve(conflict.id, 'keep_both')}>
                  <Copy size={17} /> Keep both
                </button>
                <button className="action-button secondary" onClick={() => onResolve(conflict.id, 'flag_team')}>
                  <Clock3 size={17} /> Flag for team review
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-charcoal-100">
            No dated contradiction found by the rules engine. Review broader scope or ownership changes manually.
          </p>
        )}

        {conflict && (
          <section className="space-y-2">
            <span className="eyebrow">Change impact preview</span>
            {affectedTasks.length ? (
              affectedTasks.map(t => <p className="text-xs" key={t.id}>{t.task} · {t.owner} · {t.deadline}</p>)
            ) : (
              <p className="text-xs text-charcoal-50">
                No explicitly linked open tasks. Link dependencies in Planning & tracker to see affected work here.
              </p>
            )}
            <p className="text-xs text-charcoal-50">Existing tasks are not changed automatically when a decision is replaced.</p>
          </section>
        )}

        <hr />
        <span className="eyebrow">Extraction mode</span>
        <p className="text-sm">{draft.mode === 'live-ai' ? 'AI-assisted, source-checked proposals' : 'Limited offline rules'}</p>
        <p className="text-xs text-charcoal-50">
          {pending ? `${pending} conflict(s) need a resolution before commit.` : 'Ready to commit approved items.'}
        </p>
      </aside>
    </div>
  </section>;
}
