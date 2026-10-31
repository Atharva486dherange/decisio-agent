import React from 'react';
import { Mic, MicOff, ArrowRight, RotateCcw } from 'lucide-react';
import useSpeech from './useSpeech';
import { demoScenarios } from '../data/seedData';
export default function VoiceIntake({ transcript, setTranscript, onProcessTranscript, isProcessing, processingStep }) {
  const speech = useSpeech(text => setTranscript(prev => `${prev}${prev ? ' ' : ''}${text}`), true);
  return <section className="paper-card intake-panel"><header className="card-header"><div><span className="eyebrow">01 / Capture the conversation</span><h2 className="mt-2">Meeting transcript</h2></div><span className="text-xs text-charcoal-50">{transcript.split(/\s+/).filter(Boolean).length} words</span></header>
    <div className="p-5 space-y-4"><div className="sample-picker"><span>Try a sample</span>{demoScenarios.map((s, i) => <button disabled={isProcessing || speech.isListening} key={s.id} onClick={() => setTranscript(s.transcript)} title={s.description}>{i + 1}. {i === 0 ? 'Launch conflict' : i === 1 ? 'Incident triage' : 'Pricing sync'}</button>)}</div>
    <textarea className="transcript-field" aria-label="Meeting transcript" maxLength={50000} disabled={isProcessing} value={transcript} onChange={e => setTranscript(e.target.value)} rows={12} placeholder="Sarah: Let's move the launch to November 22. Rahul: I'll update the checklist by Friday." />
    <div className="intake-controls"><button className={`action-button ${speech.isListening ? 'orange' : 'secondary'}`} disabled={isProcessing} onClick={speech.toggle}>{speech.isListening ? <MicOff size={16} /> : <Mic size={16} />}{speech.isListening ? 'Stop recording' : 'Use browser microphone'}</button><button aria-label="Clear transcript" disabled={isProcessing || speech.isListening} className="text-link" onClick={() => setTranscript('')}><RotateCcw size={14} /> Clear</button><span className="text-xs text-charcoal-50">Or dictate directly with Wispr Flow.</span></div>
    {speech.error && <p role="alert" className="notice error">{speech.error}</p>}
    <div className="process-row"><p>{isProcessing ? processingStep : 'Extract proposals, compare active commitments, then review.'}</p><button className="action-button" onClick={onProcessTranscript} disabled={isProcessing || speech.isListening || !transcript.trim()}>{isProcessing ? 'Processing meeting…' : 'Process meeting'}<ArrowRight size={16} /></button></div>
    </div></section>;
}
