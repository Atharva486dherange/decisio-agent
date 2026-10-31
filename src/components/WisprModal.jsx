import React from 'react';
export default function WisprModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return <div role="dialog" aria-modal="true" aria-labelledby="voice-help-title" className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose} onKeyDown={e => { if (e.key === 'Escape') onClose(); }}><section className="bg-cream-50 rounded-3xl max-w-lg p-7 shadow-xl space-y-4" onClick={e => e.stopPropagation()}>
    <h2 id="voice-help-title" className="font-serif text-2xl">Dictate with Wispr Flow</h2>
    <ol className="list-decimal pl-5 space-y-3 text-sm"><li>Install and open Wispr Flow on your computer.</li><li>Focus the meeting transcript or task command field.</li><li>Use your configured Wispr Flow shortcut and speak.</li><li>Review the text, then process the meeting or submit the command.</li></ol>
    <p className="text-sm text-charcoal-100">Wispr Flow supplies text through your desktop. Decisio does not access its SDK or verify whether it is running. The microphone buttons use browser speech recognition, where supported.</p>
    <p className="text-sm text-charcoal-100">Try a supported command: “Reassign task 1 to Rahul”, “Reject task 2”, or “Approve all tasks”. Task numbers follow the current review list, or the saved board order outside review.</p>
    <button autoFocus className="action-button" onClick={onClose}>Close voice help</button>
  </section></div>;
}
