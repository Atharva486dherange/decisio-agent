import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.SUPABASE_URL || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.SUPABASE_ANON_KEY || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  typeof supabaseUrl === 'string' &&
  supabaseUrl.startsWith('https://') && 
  typeof supabaseAnonKey === 'string' &&
  supabaseAnonKey.length > 20
);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

/**
 * Syncs an approved decision to Supabase if configured
 */
export async function syncDecisionToSupabase(decision) {
  if (!supabase) return { success: false, mode: 'local' };
  try {
    const { error } = await supabase.from('decisions').upsert({
      id: decision.id,
      meeting_title: decision.meetingTitle || 'Meeting',
      date: decision.date || new Date().toISOString(),
      topic: decision.topic || 'General',
      decision: decision.decision,
      speaker: decision.speaker || 'Team',
      quote: decision.quote || '',
      status: decision.status || 'active',
      superseded_by: decision.supersededBy || null,
      superseded_reason: decision.supersededReason || null
    });
    if (error) console.warn('Supabase decision sync warning:', error.message);
    return { success: !error, error };
  } catch (err) {
    console.warn('Supabase sync exception:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Syncs tasks to Supabase if configured
 */
export async function syncTasksToSupabase(tasks) {
  if (!supabase || !Array.isArray(tasks) || tasks.length === 0) return { success: false, mode: 'local' };
  try {
    const rows = tasks.map(t => ({
      id: t.id,
      task: t.task,
      owner: t.owner || 'Unassigned',
      deadline: t.deadline || 'Not specified',
      due_at: t.dueAt || null,
      priority: t.priority || 'Medium',
      status: t.status || 'todo',
      commitment: t.commitment || 'Firm',
      risk_level: t.riskLevel || 'Low',
      quote: t.quote || ''
    }));
    const { error } = await supabase.from('tasks').upsert(rows);
    return { success: !error, error };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
