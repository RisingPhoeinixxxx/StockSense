import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { AppState, Profile } from './types';

const SHARED_STATE_ID = 'default';
let channel: RealtimeChannel | null = null;

export async function fetchCloudState(): Promise<AppState | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('app_states')
    .select('state')
    .eq('id', SHARED_STATE_ID)
    .maybeSingle();
  if (error) throw error;
  return (data?.state as AppState | undefined) ?? null;
}

export async function pushCloudState(state: AppState, userId: string) {
  if (!supabase) return;
  const { error } = await supabase.from('app_states').upsert({
    id: SHARED_STATE_ID,
    user_id: null,
    state,
    updated_by: userId,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'id' });
  if (error) throw error;
}

export function subscribeToCloudState(onState: (state: AppState) => void, onError?: (error: Error) => void) {
  if (!supabase) return () => {};
  channel?.unsubscribe();
  channel = supabase
    .channel('stocksense-live-shared-state')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'app_states' }, payload => {
      const row = payload.new as { id?: string; state?: AppState };
      if (row.id === SHARED_STATE_ID && row.state) onState(row.state);
    })
    .subscribe(status => {
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') onError?.(new Error(`Realtime connection: ${status}`));
    });
  return () => {
    channel?.unsubscribe();
    channel = null;
  };
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function ensureProfile(userId: string, email?: string | null, fullName?: string | null): Promise<Profile | null> {
  if (!supabase) return null;
  const existing = await fetchProfile(userId);
  if (existing) {
    const patch: Record<string, string> = {};
    if (email && existing.email !== email) patch.email = email;
    if (fullName?.trim() && !existing.full_name) patch.full_name = fullName.trim();
    if (Object.keys(patch).length) {
      const { data, error } = await supabase.from('profiles').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', userId).select().single();
      if (error) throw error;
      return data as Profile;
    }
    return existing;
  }
  const { data, error } = await supabase.from('profiles').insert({
    id: userId,
    email: email ?? '',
    full_name: fullName?.trim() ?? '',
    role: 'Inventory Manager',
    phone: '',
  }).select().single();
  if (error) throw error;
  return data as Profile;
}

export async function updateProfile(userId: string, patch: Pick<Profile,'full_name'|'avatar_url'|'phone'>): Promise<Profile> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase.from('profiles').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', userId).select().single();
  if (error) throw error;
  return data as Profile;
}
