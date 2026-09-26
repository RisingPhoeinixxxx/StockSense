import React,{useEffect,useMemo,useState} from 'react';
import {Search,Bell,Sun,Plus,ChevronDown,PackageCheck,Truck,ArrowLeftRight,ClipboardPenLine} from 'lucide-react';
import {AppState} from '../lib/types';

export default function Topbar({state,onNavigate}:{state:AppState;onNavigate:(page:string)=>void}){
 const [now,setNow]=useState(new Date());
 const [query,setQuery]=useState('');
 const [open,setOpen]=useState(false);
 const [newOpen,setNewOpen]=useState(false);
 const [dark,setDark]=useState(true);
 useEffect(()=>{const t=window.setInterval(()=>setNow(new Date()),1000);return()=>window.clearInterval(t)},[]);
 useEffect(()=>{document.documentElement.dataset.theme=dark?'dark':'light'},[dark]);
 const results=useMemo(()=>{
   const q=query.trim().toLowerCase(); if(!q)return [] as {label:string;meta:string;page:string}[];
   const out:{label:string;meta:string;page:string}[]=[];
   state.products.filter(p=>(p.name+' '+p.sku+' '+p.category).toLowerCase().includes(q)).slice(0,5).forEach(p=>out.push({label:p.name,meta:`${p.sku} · Product`,page:'products'}));
   state.receipts.filter(r=>(r.number+' '+r.supplier).toLowerCase().includes(q)).slice(0,3).forEach(r=>out.push({label:r.number,meta:`${r.supplier} · Receipt`,page:'receipts'}));
   state.deliveries.filter(r=>(r.number+' '+r.customer).toLowerCase().includes(q)).slice(0,3).forEach(r=>out.push({label:r.number,meta:`${r.customer} · Delivery`,page:'deliveries'}));
   state.ledger.filter(l=>(l.reference+' '+l.operation).toLowerCase().includes(q)).slice(0,3).forEach(l=>out.push({label:l.reference,meta:`${l.operation} · Move History`,page:'history'}));
   return out.slice(0,8);
 },[query,state]);
 const pending=state.receipts.filter(r=>!['Done','Canceled'].includes(r.status)).length+state.deliveries.filter(r=>!['Done','Canceled'].includes(r.status)).length+state.transfers.filter(r=>!['Done','Canceled'].includes(r.status)).length;
 const date=now.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
 const time=now.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
 return <header className="topbar">
  <div className="search search-live"><Search size={17}/><input value={query} onChange={e=>{setQuery(e.target.value);setOpen(true)}} onFocus={()=>setOpen(true)} placeholder="Search products, SKU, documents...  (Ctrl + K)"/>
   {open&&query&&<div className="search-results">{results.length?results.map((r,i)=><button key={i} onClick={()=>{onNavigate(r.page);setQuery('');setOpen(false)}}><b>{r.label}</b><small>{r.meta}</small></button>):<div className="no-results">No matching inventory records</div>}</div>}
  </div>
  <div className="top-actions">
   <button className="select">⌂ &nbsp; All Warehouses <ChevronDown size={14}/></button>
   <button className="select live-date">▣ &nbsp; {date} · {time}</button>
   <button className="icon-btn" title="Live pending operations" onClick={()=>onNavigate('history')}><Bell size={18}/>{pending>0&&<em>{pending}</em>}</button>
   <button className="icon-btn" title="Toggle theme" onClick={()=>setDark(v=>!v)}><Sun size={18}/></button>
   <div className="new-wrap"><button className="new-btn" onClick={()=>setNewOpen(v=>!v)}><Plus size={18}/>New Operation<ChevronDown size={15}/></button>{newOpen&&<div className="new-menu"><button onClick={()=>{onNavigate('receipts');setNewOpen(false)}}><PackageCheck/>New Receipt</button><button onClick={()=>{onNavigate('deliveries');setNewOpen(false)}}><Truck/>New Delivery</button><button onClick={()=>{onNavigate('transfers');setNewOpen(false)}}><ArrowLeftRight/>New Transfer</button><button onClick={()=>{onNavigate('adjustments');setNewOpen(false)}}><ClipboardPenLine/>New Adjustment</button></div>}</div>
   <div className="mini-avatar">A</div>
  </div>
 </header>
}
