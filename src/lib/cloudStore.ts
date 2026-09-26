import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { AppState } from './types';

const STATE_ID = 'default';
let channel: RealtimeChannel | null = null;

export async function fetchCloudState(): Promise<AppState | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('app_states').select('state').eq('id', STATE_ID).maybeSingle();
  if (error) throw error;
  return (data?.state as AppState | undefined) ?? null;
}

export async function pushCloudState(state: AppState, userId?: string | null) {
  if (!supabase) return;
  const { error } = await supabase.from('app_states').upsert({
    id: STATE_ID,
    state,
    updated_by: userId ?? null,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export function subscribeToCloudState(onState: (state: AppState) => void, onError?: (error: Error) => void) {
  if (!supabase) return () => {};
  channel?.unsubscribe();
  channel = supabase.channel('stocksense-live-state')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'app_states', filter: `id=eq.${STATE_ID}` }, payload => {
      const next = (payload.new as { state?: AppState }).state;
      if (next) onState(next);
    })
    .subscribe(status => {
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') onError?.(new Error(`Realtime connection: ${status}`));
    });
  return () => {
    channel?.unsubscribe();
    channel = null;
  };
}
