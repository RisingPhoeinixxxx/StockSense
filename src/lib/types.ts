export type Status='Draft'|'Waiting'|'Ready'|'Done'|'Canceled';
export type Operation='Receipt'|'Delivery'|'Internal Transfer'|'Adjustment';
export interface Product {id:string; name:string; sku:string; category:string; uom:string; reorder:number;}
export interface Location {id:string; name:string; code:string; warehouseId:string;}
export interface Warehouse {id:string; name:string; code:string; address:string;}
export interface Inventory {id:string; productId:string; locationId:string; quantity:number;}
export interface Line {productId:string; quantity:number; locationId?:string;}
export interface Receipt {id:string; number:string; supplier:string; date:string; warehouseId:string; destinationLocationId:string; status:Status; lines:Line[];}
export interface Delivery {id:string; number:string; customer:string; date:string; warehouseId:string; sourceLocationId:string; status:Status; lines:Line[];}
export interface Transfer {id:string; number:string; productId:string; quantity:number; sourceWarehouseId:string; sourceLocationId:string; destinationWarehouseId:string; destinationLocationId:string; date:string; status:Status;}
export interface Adjustment {id:string; number:string; productId:string; warehouseId:string; locationId:string; recorded:number; counted:number; reason:string; status:Status; date:string;}
export interface LedgerEntry {id:string; timestamp:string; reference:string; productId:string; operation:Operation; source:string; destination:string; quantity:number; user:string; status:Status;}
export interface AppState {products:Product[];warehouses:Warehouse[];locations:Location[];inventory:Inventory[];receipts:Receipt[];deliveries:Delivery[];transfers:Transfer[];adjustments:Adjustment[];ledger:LedgerEntry[];}
export interface Profile {id:string; full_name:string; email:string; avatar_url?:string|null; phone?:string|null; role:string; updated_at?:string;}
