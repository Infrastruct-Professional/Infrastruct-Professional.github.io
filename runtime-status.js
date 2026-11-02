/** Honest browser-visible runtime telemetry; no invented server or host counters. */
export class RuntimeStatusSystem {
  constructor(host){this.host=host;this.registry={metrics:{instances:[],functions:{},nested:{},events:[]},pools:{instances:[],functions:{},nested:{},events:[]}};this.reservedRamMiB=[128,128];this.idleDutyTarget=.25;this.nodes={};this.timer=null;}
  snapshot(){
    const cores=Number.isInteger(navigator.hardwareConcurrency)&&navigator.hardwareConcurrency>0?navigator.hardwareConcurrency:null;
    const heap=performance?.memory?.usedJSHeapSize;
    const ram=typeof heap==='number'&&Number.isFinite(heap)?(heap/1048576).toFixed(1)+' MiB JS heap':'-';
    const ramPools=this.reservedRamMiB.length;
    const sessions=this.host?.barcodes?.sessionId?1:0;
    return {cores,ram,ramPools,sessions,visitors:'-',loggedIn:'-',reservedRam:this.reservedRamMiB.reduce((a,b)=>a+b,0)+'MiB',priority:'25% idle-time target'};
  }
  mount(field){
    const el=(label,value,title)=>{const node=this.host.element('span',label+': '+value,'runtime-status-metric',field);node.title=title;field.insertBefore(node,this.host.publicIP.browser);this.nodes[label]=node;};
    el('Cores','—','Logical processors reported by browser; not measured CPU utilization');
    el('CPU','-','System-wide CPU utilization is not exposed to ordinary websites');
    el('RAM','-','JS heap usage if browser supports performance.memory; not total system RAM');
    el('Reserved RAM','2 × 128 MiB','Two 128 MiB logical allocation budgets; not preallocated physical RAM');
    el('Priority','25% idle','Cooperative background work target; not operating system CPU priority');
    el('RAM Pools','2','Logical memory allocation pools');
    el('Pools Globally','-','Global count requires server instrumentation');el('Pools Locally','2','Two logical local memory budgets');
    el('Visitors','-','Requires server-side analytics');
    el('Logged in','-','Requires verified server-side session tracking');
    this.refresh();this.start();
  }
  refresh(){const s=this.snapshot();const values={'Cores':s.cores??'-','CPU':'-','RAM':s.ram,'Reserved RAM':s.reservedRam,'Priority':s.priority,'RAM Pools':s.ramPools,'Pools Globally':'-','Pools Locally':s.ramPools,'Visitors':s.visitors,'Logged in':s.loggedIn};for(const [key,value] of Object.entries(values))if(this.nodes[key]?.isConnected)this.nodes[key].textContent=key+': '+value;this.registry.metrics.instances=[s];}
  start(){this.stop();this.timer=setInterval(()=>{if(!document.hidden)this.refresh();},15000);}
  stop(){if(this.timer!==null){clearInterval(this.timer);this.timer=null;}}
}
