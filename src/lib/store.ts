import {AppState, Product, Inventory, Receipt, Delivery, Transfer, Adjustment, LedgerEntry} from './types';
const KEY_PREFIX='stocksense_state_v2_';
const LEGACY_KEY='stocksense_state_v1';
const id=(p:string)=>p+'-'+Math.random().toString(36).slice(2,9);
export const seed=():AppState=>{
 const products:Product[]=[
  {id:'p1',name:'Steel Rod',sku:'STL-001',category:'Raw Material',uom:'kg',reorder:500},
  {id:'p2',name:'Office Chair',sku:'CHR-001',category:'Furniture',uom:'units',reorder:30},
  {id:'p3',name:'Wooden Table',sku:'TBL-001',category:'Furniture',uom:'units',reorder:20},
  {id:'p4',name:'Plastic Sheets',sku:'PS-023',category:'Raw Material',uom:'kg',reorder:40},
  {id:'p5',name:'Screws',sku:'SC-007',category:'Components',uom:'units',reorder:100},
  {id:'p6',name:'Wooden Planks',sku:'WP-002',category:'Raw Material',uom:'units',reorder:25}
 ];
 const warehouses=[{id:'w1',name:'Main Warehouse',code:'WH-01',address:'Bangalore'}];
 const locations=[{id:'l1',name:'Main Store',code:'MAIN',warehouseId:'w1'},{id:'l2',name:'Production Floor',code:'PROD',warehouseId:'w1'},{id:'l3',name:'Rack A',code:'RACK-A',warehouseId:'w1'},{id:'l4',name:'Rack B',code:'RACK-B',warehouseId:'w1'}];
 const inventory:Inventory[]=[
  {id:id('inv'),productId:'p1',locationId:'l1',quantity:5000},{id:id('inv'),productId:'p1',locationId:'l2',quantity:0},
  {id:id('inv'),productId:'p2',locationId:'l1',quantity:120},{id:id('inv'),productId:'p3',locationId:'l1',quantity:45},
  {id:id('inv'),productId:'p4',locationId:'l1',quantity:3},{id:id('inv'),productId:'p5',locationId:'l1',quantity:8},{id:id('inv'),productId:'p6',locationId:'l1',quantity:6}
 ];
 const receipts:Receipt[]=[{id:'r1',number:'RCPT-001',supplier:'ABC Metals',date:'2026-09-26',warehouseId:'w1',destinationLocationId:'l1',status:'Waiting',lines:[{productId:'p1',quantity:100,locationId:'l1'}]},{id:'r2',number:'RCPT-002',supplier:'Office World',date:'2026-09-24',warehouseId:'w1',destinationLocationId:'l1',status:'Done',lines:[{productId:'p2',quantity:20,locationId:'l1'}]}];
 const deliveries:Delivery[]=[{id:'d1',number:'DEL-003',customer:'XYZ Manufacturing',date:'2026-09-26',warehouseId:'w1',sourceLocationId:'l1',status:'Ready',lines:[{productId:'p2',quantity:10,locationId:'l1'}]},{id:'d2',number:'DEL-002',customer:'City Retail',date:'2026-09-25',warehouseId:'w1',sourceLocationId:'l1',status:'Done',lines:[{productId:'p3',quantity:5,locationId:'l1'}]}];
 const transfers:Transfer[]=[{id:'t1',number:'INT-005',productId:'p1',quantity:20,sourceWarehouseId:'w1',sourceLocationId:'l1',destinationWarehouseId:'w1',destinationLocationId:'l2',date:'2026-09-25',status:'Waiting'}];
 const adjustments:Adjustment[]=[{id:'a1',number:'ADJ-002',productId:'p1',warehouseId:'w1',locationId:'l1',recorded:5000,counted:4997,reason:'Damaged',status:'Done',date:'2026-09-25'}];
 const ledger:LedgerEntry[]=[
  {id:id('led'),timestamp:'2026-09-26T09:25:00',reference:'RCPT-002',productId:'p2',operation:'Receipt',source:'Supplier',destination:'Main Store',quantity:20,user:'System',status:'Done'},
  {id:id('led'),timestamp:'2026-09-26T09:10:00',reference:'DEL-002',productId:'p3',operation:'Delivery',source:'Main Store',destination:'Customer',quantity:-5,user:'System',status:'Done'},
  {id:id('led'),timestamp:'2026-09-25T15:10:00',reference:'INT-005',productId:'p1',operation:'Internal Transfer',source:'Main Store',destination:'Production Floor',quantity:20,user:'System',status:'Waiting'},
  {id:id('led'),timestamp:'2026-09-25T12:00:00',reference:'ADJ-002',productId:'p1',operation:'Adjustment',source:'Main Store',destination:'—',quantity:-3,user:'System',status:'Done'}
 ];
 return {products,warehouses,locations,inventory,receipts,deliveries,transfers,adjustments,ledger};
};
export const load=(userId?:string|null):AppState=>{try{const key=userId?KEY_PREFIX+userId:LEGACY_KEY;const raw=localStorage.getItem(key);return raw?JSON.parse(raw):seed()}catch{return seed()}};
export const save=(s:AppState,userId?:string|null)=>localStorage.setItem(userId?KEY_PREFIX+userId:LEGACY_KEY,JSON.stringify(s));
export const reset=(userId?:string|null)=>{localStorage.removeItem(userId?KEY_PREFIX+userId:LEGACY_KEY);location.reload()};
export const uid=id;
