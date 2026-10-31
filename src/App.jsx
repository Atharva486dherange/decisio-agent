import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import PlanningHub from './components/PlanningHub';
import { dueReminders } from '../shared/planning';
import WorkspaceHome from './components/WorkspaceHome';
import TopBar from './components/TopBar';
import VoiceIntake from './components/VoiceIntake';
import MeetingReview from './components/MeetingReview';
import DecisionMap from './components/DecisionMap';
import ExecutionBoard from './components/ExecutionBoard';
import DecisionTimeline from './components/DecisionTimeline';
import VoiceFloatingBar from './components/VoiceFloatingBar';
import WisprModal from './components/WisprModal';
import ExportModal from './components/ExportModal';
import LandingPage from './components/LandingPage';
import { initialLedger, demoScenarios } from './data/seedData';
import { checkServerHealth, extractMeetingData, executeVoiceCommand } from './services/api';
import { syncDecisionToSupabase, syncTasksToSupabase } from './services/supabaseClient';
import { newId, applyMutations, detectRuleConflicts, commitReview } from '../shared/engine';

const STORAGE_KEY = 'decisio.workspace.v2';
const fresh = () => ({ 
  ledger: structuredClone(initialLedger), 
  tasks: [], 
  audit: [], 
  draft: null, 
  resolutions: {}, 
  transcript: demoScenarios[0].transcript, 
  title: 'Sprint sync', 
  summary: '' 
});

function loadWorkspace() {
  try { 
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)); 
    if (saved && Array.isArray(saved.ledger) && Array.isArray(saved.tasks) && Array.isArray(saved.audit)) {
      return { ...fresh(), ...saved }; 
    }
  } catch { /* New workspace or inaccessible storage. */ }
  return fresh();
}

export default function App() {
  const [workspace, setWorkspace] = useState(loadWorkspace);
  const [clock, setClock] = useState(() => new Date());
  useEffect(() => { 
    const timer = setInterval(() => setClock(new Date()), 60000); 
    return () => clearInterval(timer); 
  }, []);
  
  const reminderCount = dueReminders(workspace.tasks, clock).length;
  const [activeNav, setActiveNav] = useState(() => {
    if (typeof window !== 'undefined') {
      const h = (window.location.hash || '').replace('#', '').toLowerCase();
      const s = new URLSearchParams(window.location.search);
      const view = s.get('view');
      const validViews = ['home', 'inbox', 'meetings', 'execution', 'planning', 'memory', 'decision_log'];
      if (view && validViews.includes(view)) return view;
      if (validViews.includes(h)) return h;
    }
    return 'landing';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessingVoiceCommand, setIsProcessingVoiceCommand] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [storageError, setStorageError] = useState(false);
  const [showWisprModal, setShowWisprModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [engineStatus, setEngineStatus] = useState('checking');

  useEffect(() => { 
    checkServerHealth().then(s => setEngineStatus(s.mode)); 
  }, []);

  // Saving synchronizes React state to external browser storage & Supabase
  useEffect(() => { 
    try { 
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace)); 
      // oxlint-disable-next-line react/set-state-in-effect
      setStorageError(false); 
    } catch { 
      // oxlint-disable-next-line react/set-state-in-effect
      setStorageError(true); 
    } 
  }, [workspace]);

  const conflicts = workspace.draft ? detectRuleConflicts(workspace.draft.decisions, workspace.ledger).conflicts : [];

  const matches = item => !searchQuery.trim() || JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase().trim());
  const record = text => ({ id: newId('event'), at: new Date().toISOString(), kind: 'task', text });
  
  const updateTasks = (fn, text) => {
    setWorkspace(w => {
      const nextTasks = fn(w.tasks).map(t => w.tasks.find(old => old.id === t.id) === t ? t : { ...t, updatedAt: new Date().toISOString() });
      syncTasksToSupabase(nextTasks);
      return { ...w, tasks: nextTasks, audit: [...w.audit, record(text)] };
    });
  };

  async function processTranscript() {
    if (isProcessing) return;
    setIsProcessing(true); setError(''); setFeedback('');
    try { 
      const draft = await extractMeetingData(workspace.transcript); 
      setWorkspace(w => ({ 
        ...w, 
        draft: { 
          ...draft, 
          sourceTranscript: workspace.transcript, 
          meetingId: newId("meeting"), 
          meetingTitle: workspace.title 
        }, 
        resolutions: {} 
      })); 
      setFeedback(draft.warning || (draft.mode === 'offline-rules' ? 'Limited offline rules used. Review every proposal against the transcript.' : 'AI proposals ready for review.')); 
      setActiveNav('inbox');
    }
    catch (e) { setError(e.message); } 
    finally { setIsProcessing(false); }
  }

  function resolve(id, strategy) {
    const conflict = conflicts.find(c => c.id === id); 
    if (!conflict) return;
    setWorkspace(w => ({ ...w, resolutions: { ...w.resolutions, [id]: { ...conflict, strategy } } })); 
    setFeedback('Resolution selected. It will be saved when you commit this review.');
  }

  function commit() {
    setError('');
    try { 
      const next = commitReview(workspace, workspace.draft, workspace.resolutions, workspace.draft.meetingTitle?.trim() || 'Untitled meeting'); 
      setWorkspace({ ...next, summary: workspace.draft.summary, draft: null, resolutions: {} }); 
      setFeedback('Approved tasks and decisions saved.'); 
      setActiveNav('execution'); 
      // Background Supabase Sync
      syncTasksToSupabase(next.tasks);
      next.ledger.forEach(d => syncDecisionToSupabase(d));
    } catch (e) { setError(e.message); }
  }

  async function voice(command) {
    if (isProcessingVoiceCommand || isProcessing) return;
    setIsProcessingVoiceCommand(true); setError('');
    try {
      const reviewing = ['inbox', 'review'].includes(activeNav) && workspace.draft;
      const result = await executeVoiceCommand(command, reviewing ? workspace.draft.actionItems : workspace.tasks);
      if (result.mutations.length) {
        setWorkspace(w => reviewing 
          ? { ...w, draft: { ...w.draft, actionItems: applyMutations(w.draft.actionItems, result.mutations) } } 
          : { ...w, tasks: applyMutations(w.tasks, result.mutations), audit: [...w.audit, record(`Voice command: ${command}`)] }
        );
      }
      setFeedback(result.confirmationMessage);
    } catch (e) { setError(e.message); } 
    finally { setIsProcessingVoiceCommand(false); }
  }

  if (activeNav === 'landing') {
    return (
      <div className="relative">
        <div className="fixed top-4 right-4 z-[70] hidden sm:block">
          <button
            type="button"
            onClick={() => setActiveNav('inbox')}
            className="flex items-center gap-2 bg-[#2B4C3F] text-[#FBF9F5] px-4 py-2 rounded-full shadow-lg text-sm font-medium hover:bg-[#E05A30] transition-colors cursor-pointer"
          >
            <span>Launch Workspace</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>
        <LandingPage onEnterWorkspace={() => setActiveNav('inbox')} />
      </div>
    );
  }

  return (
    <div className="app-shell flex min-h-screen bg-cream-100 text-charcoal-900 font-sans">
      <Sidebar 
        activeNav={activeNav} 
        setActiveNav={setActiveNav} 
        inboxCount={workspace.draft ? 1 : 0}
        onOpenWisprModal={() => setShowWisprModal(true)} 
      />
      <div className="flex-1 min-w-0 pb-28">
        <TopBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <main className="px-4 sm:px-8 py-6 max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5 text-xs text-charcoal-100">
            <span>
              {engineStatus === 'live-ai' ? 'AI key configured; extraction verified per meeting' : engineStatus === 'checking' ? 'Checking AI configuration…' : 'Offline rules available'} · Rules handle conflicts and commands · Saved in this browser
            </span>
            <button className="action-button" onClick={() => setShowExportModal(true)}>
              Export workspace
            </button>
          </div>
          
          {reminderCount > 0 && (
            <div role="status" className="notice flex justify-between gap-3">
              <span>{reminderCount} deadline reminder(s) need attention.</span>
              <button className="underline" onClick={() => setActiveNav('planning')}>Review deadlines</button>
            </div>
          )}
          {storageError && <p role="alert" className="notice error">Browser saving failed. Export your work before closing this page.</p>}
          {error && <p role="alert" className="notice error">{error}</p>}
          {feedback && <p role="status" className="notice">{feedback}</p>}

          {/* VIEW: HOME */}
          {activeNav === 'home' && (
            <WorkspaceHome 
              workspace={workspace} 
              conflictCount={conflicts.filter(c => !workspace.resolutions[c.id]).length} 
              onNavigate={setActiveNav} 
            />
          )}

          {/* VIEW: MEETINGS (Intake & Speech Studio) */}
          {activeNav === 'meetings' && (
            <section className="space-y-4">
              <h1 className="font-serif text-4xl">From meeting to momentum.</h1>
              <p className="text-sm text-charcoal-100">
                Dictate with Wispr Flow into the transcript field, use your browser microphone, or try a sample. Review proposals before saving.
              </p>
              <label className="block text-sm font-medium">
                Meeting title
                <input 
                  className="field mt-2" 
                  value={workspace.title} 
                  maxLength={120} 
                  onChange={e => setWorkspace(w => ({ ...w, title: e.target.value }))} 
                />
              </label>
              {workspace.draft && (
                <p className="notice">
                  You have a saved review. <button className="underline" onClick={() => setActiveNav('review')}>Open review</button>. Processing again replaces that review.
                </p>
              )}
              <VoiceIntake 
                transcript={workspace.transcript} 
                setTranscript={value => setWorkspace(w => ({ ...w, transcript: typeof value === 'function' ? value(w.transcript) : value }))} 
                onProcessTranscript={processTranscript} 
                isProcessing={isProcessing} 
                processingStep="Extracting supported proposals…" 
              />
            </section>
          )}

          {/* VIEW: REVIEW (Meeting Review with Disfluency Diff & Risk Radar) */}
          {['inbox', 'review'].includes(activeNav) && (
            !workspace.draft ? (
              <div className="empty-state">
                No meeting awaiting review. <button className="action-button" onClick={() => setActiveNav('meetings')}>Process a meeting</button>
              </div>
            ) : (
              <MeetingReview 
                key={workspace.draft.meetingId} 
                draft={workspace.draft} 
                tasks={workspace.tasks} 
                conflicts={conflicts} 
                resolutions={workspace.resolutions} 
                onResolve={resolve} 
                onUndo={id => setWorkspace(w => { 
                  const resolutions = { ...w.resolutions }; 
                  delete resolutions[id]; 
                  return { ...w, resolutions }; 
                })} 
                onBack={() => setActiveNav('meetings')} 
                onCommit={commit} 
                onUpdate={(id, changes) => setWorkspace(w => ({ 
                  ...w, 
                  draft: { 
                    ...w.draft, 
                    actionItems: w.draft.actionItems.map(t => t.id === id ? { ...t, ...changes } : t) 
                  } 
                }))} 
              />
            )
          )}

          {/* VIEW: EXECUTION (KANBAN) */}
          {activeNav === 'execution' && (
            <ExecutionBoard 
              tasks={workspace.tasks.map((t, i) => ({ ...t, commandNumber: i + 1 })).filter(matches)} 
              onUpdateTaskStatus={(id, status) => updateTasks(ts => ts.map(t => t.id === id ? { ...t, status } : t), `Task moved to ${status.replaceAll('_', ' ')}.`)} 
              onAddTask={task => updateTasks(ts => [...ts, task], `Added task: ${task.task}`)} 
              onDeleteTask={id => updateTasks(ts => ts.filter(t => t.id !== id), 'Deleted a task.')} 
            />
          )}

          {/* VIEW: PLANNING & TRACKER */}
          {activeNav === 'planning' && (
            <PlanningHub 
              tasks={workspace.tasks} 
              ledger={workspace.ledger} 
              onPatch={(id, changes) => updateTasks(ts => ts.map(t => t.id === id ? { ...t, ...changes } : t), 'Updated commitment settings.')} 
              onPosted={(id, result) => updateTasks(ts => ts.map(t => t.id === id ? { ...t, tracker: { provider: 'trello', ...result, postedAt: new Date().toISOString() } } : t), 'Confirmed task linked to Trello.')} 
            />
          )}

          {/* VIEW: DECISION LOG */}
          {activeNav === 'decision_log' && (
            <DecisionTimeline ledger={workspace.ledger.filter(matches)} />
          )}

          {/* VIEW: MEMORY */}
          {activeNav === 'memory' && (
            <section className="space-y-4">
              <h1 className="font-serif text-3xl">Decision memory & audit trail</h1>
              <DecisionMap ledger={workspace.ledger} tasks={workspace.tasks} />
              <p className="text-sm">
                {workspace.ledger.filter(d => d.status === 'active').length} active agreements · {workspace.tasks.length} saved tasks. History is restored from this browser. Cloud restore is not yet available.
              </p>
              {workspace.audit.filter(matches).slice().reverse().map(e => (
                <article className="notice" key={e.id}>
                  <time className="block text-xs mb-2">{new Date(e.at).toLocaleString()}</time>
                  {e.text}
                </article>
              ))}
              {!workspace.audit.length && <p className="empty-state">Commit a meeting or update a task to start your audit trail.</p>}
            </section>
          )}

          {searchQuery && (
            <div className="mt-6 border-t border-cream-200 pt-4">
              <h2 className="font-semibold mb-2">Workspace search</h2>
              {[...workspace.ledger.map(d => ({ ...d, label: d.decision })), ...workspace.tasks.map(t => ({ ...t, label: t.task }))].filter(matches).map(i => (
                <p className="notice" key={i.id}>{i.label}</p>
              ))}
            </div>
          )}
        </main>
        
        {/* Floating Voice Bar */}
        <VoiceFloatingBar 
          onExecuteVoiceCommand={voice} 
          isProcessingVoiceCommand={isProcessingVoiceCommand || isProcessing} 
          onOpenWisprModal={() => setShowWisprModal(true)} 
        />
      </div>

      {/* Modals */}
      <WisprModal isOpen={showWisprModal} onClose={() => setShowWisprModal(false)} />
      <ExportModal 
        isOpen={showExportModal} 
        onClose={() => setShowExportModal(false)} 
        tasks={workspace.tasks.filter(t => t.reviewStatus !== 'rejected')} 
        decisions={workspace.ledger.filter(d => d.status === 'active')} 
        summary={workspace.summary} 
      />
    </div>
  );
}
