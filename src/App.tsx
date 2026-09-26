import React,{useEffect,useRef,useState} from 'react';
import {load,save,reset} from './lib/store';
import {AppState,Profile as UserProfile} from './lib/types';
import Sidebar from './components/Sidebar'; import Topbar from './components/Topbar'; import Toast from './components/Toast'; import Dashboard from './pages/Dashboard';
import {Products,Stock,Receipts,Deliveries,Transfers,Adjustments,History,Warehouses,Locations,Profile} from './pages/Pages'; import Auth from './pages/Auth';
import {ensureProfile,fetchCloudState,pushCloudState,subscribeToCloudState,updateProfile as saveProfile} from './lib/cloudStore'; import {isSupabaseConfigured,supabase} from './lib/supabase';

export default function App(){
 const [authed,setAuthed]=useState(false); const [authMode,setAuthMode]=useState<'login'|'signup'|'forgot'>('login');
 const [page,setPage]=useState('dashboard'); const [state,setState]=useState<AppState>(()=>load()); const [toast,setToast]=useState(''); const [loading,setLoading]=useState(isSupabaseConfigured);
 const [userId,setUserId]=useState<string|null>(null); const [profile,setProfile]=useState<UserProfile|null>(null); const [cloudReady,setCloudReady]=useState(false); const [recoveryMode,setRecoveryMode]=useState(false); const skipNextCloudPush=useRef(false);

 useEffect(()=>{
   if(!supabase){setLoading(false);return}
   let mounted=true;
   if(window.location.hash.includes('type=recovery')){setRecoveryMode(true);setAuthMode('forgot')}
   supabase.auth.getSession().then(async({data})=>{
     if(!mounted)return;
     const session=data.session; setUserId(session?.user.id??null); setAuthed(Boolean(session));
     if(session){try{setProfile(await ensureProfile(session.user.id,session.user.email,session.user.user_metadata?.full_name))}catch(e){console.error(e)}}
     setLoading(false);
   });
   const {data:{subscription}}=supabase.auth.onAuthStateChange(async(event,session)=>{
     if(!mounted)return;
     setUserId(session?.user.id??null); setAuthed(Boolean(session));
     if(event==='PASSWORD_RECOVERY'){setRecoveryMode(true);setAuthMode('forgot');}
     if(event==='SIGNED_OUT'){setRecoveryMode(false);setProfile(null);setCloudReady(false)}
     if(session){try{setProfile(await ensureProfile(session.user.id,session.user.email,session.user.user_metadata?.full_name))}catch(e){console.error(e)}}
   });
   return()=>{mounted=false;subscription.unsubscribe()};
 },[]);

 useEffect(()=>{
   if(!authed||!userId||!supabase)return;
   let cancelled=false;
   setCloudReady(false); setState(load(userId));
   (async()=>{try{
     const remote=await fetchCloudState();
     if(cancelled)return;
     if(remote){skipNextCloudPush.current=true;setState(remote)}
     else {const initial=load(userId);await pushCloudState(initial,userId)}
     if(!cancelled)setCloudReady(true);
   }catch(e){console.error(e);setToast('Could not load the shared Supabase inventory. Run supabase/schema.sql and verify RLS policies.');if(!cancelled)setCloudReady(false)}})();
   const stop=subscribeToCloudState(next=>{if(!cancelled){skipNextCloudPush.current=true;setState(next)}},()=>setToast('Realtime connection interrupted. Retrying with Supabase…'));
   return()=>{cancelled=true;stop()};
 },[authed,userId]);

 useEffect(()=>{save(state,userId);if(skipNextCloudPush.current){skipNextCloudPush.current=false;return}if(authed&&userId&&isSupabaseConfigured&&cloudReady){const t=setTimeout(()=>pushCloudState(state,userId).catch(e=>{console.error(e);setToast('Could not sync the latest inventory change to Supabase.')}),250);return()=>clearTimeout(t)}},[state,authed,userId,cloudReady]);

 const login=()=>{setRecoveryMode(false);setAuthMode('login')};
 const logout=async()=>{if(supabase)await supabase.auth.signOut();setAuthed(false);setUserId(null);setProfile(null);setCloudReady(false);setAuthMode('login');setPage('dashboard')};
 const go=(p:string)=>{setPage(p);window.scrollTo({top:0,behavior:'smooth'})};
 const userName=profile?.full_name||profile?.email?.split('@')[0]||'StockSense User';
 const onProfileUpdate=async(next:UserProfile)=>{if(!userId)return;try{const updated=await saveProfile(userId,{full_name:next.full_name.trim(),avatar_url:next.avatar_url||null,phone:next.phone?.trim()||''});setProfile(updated);setToast('Profile updated successfully.')}catch(e){console.error(e);setToast('Could not update your profile.')}};
 if(loading)return <div className="loading-screen"><div className="loader"></div><h2>Connecting to StockSense…</h2><p>Loading your secure inventory workspace.</p></div>;
 if(recoveryMode)return <Auth mode="forgot" setMode={setAuthMode} onLogin={login} recoveryMode/>;
 if(!authed)return <Auth mode={authMode} setMode={setAuthMode} onLogin={login}/>;
 if(!profile)return <div className="loading-screen"><div className="loader"></div><h2>Loading your profile…</h2><p>Preparing your private StockSense workspace.</p></div>;
 return <div className="app-shell"><Sidebar page={page} setPage={go} onLogout={logout} userName={userName}/><main className="main"><Topbar state={state} onNavigate={go} userName={userName}/>{page==='dashboard'&&<Dashboard state={state} setPage={go} userName={userName}/>} {page==='products'&&<Products state={state} setState={setState} userName={userName}/>} {page==='stock'&&<Stock state={state}/>} {page==='receipts'&&<Receipts state={state} setState={s=>{setState(s);setToast('Receipt operation completed and synced live.')}} userName={userName}/>} {page==='deliveries'&&<Deliveries state={state} setState={s=>{setState(s);setToast('Delivery validated and synced live.')}} userName={userName}/>} {page==='transfers'&&<Transfers state={state} setState={s=>{setState(s);setToast('Transfer completed and synced live.')}} userName={userName}/>} {page==='adjustments'&&<Adjustments state={state} setState={s=>{setState(s);setToast('Adjustment applied and synced live.')}} userName={userName}/>} {page==='history'&&<History state={state}/>} {page==='warehouses'&&<Warehouses state={state} setState={setState}/>} {page==='locations'&&<Locations state={state} setState={setState}/>} {page==='profile'&&<Profile profile={profile} onProfileUpdate={onProfileUpdate}/>} {toast&&<Toast msg={toast} onClose={()=>setToast('')}/>}<button className="reset-demo" onClick={()=>reset(userId)}>Reset my local cache</button></main></div>
}
