/** Honest browser-visible runtime telemetry; no invented server or host counters. */
export class RuntimeStatusSystem {
  constructor(host){this.host=host;this.registry={metrics:{instances:[],functions:{},nested:{},events:[]},pools:{instances:[],functions:{},nested:{},events:[]}};this.reservedRamMiB=[128,128];this.idleDutyTarget=.25;this.nodes={};this.timer=null;}
  snapshot(){
    const cores=Number.isInteger(navigator.hardwareConcurrency)&&navigator.hardwareConcurrency>0?navigator.hardwareConcurrency:null;
    const heap=performance?.memory?.usedJSHeapSize;
    const ram=typeof heap==='number'&&Number.isFinite(heap)?(heap/1048576).toFixed(1)+' MiB JS heap':'Unavailable';
    const ramPools=this.reservedRamMiB.length;
    const sessions=this.host?.barcodes?.sessionId?1:0;
    return {cores,ram,ramPools,sessions,visitors:'Unavailable',loggedIn:'Unavailable',reservedRam:this.reservedRamMiB.length+' × '+this.reservedRamMiB[0]+' MiB budget',priority:'25% idle-time target'};
  }
  mount(field){
    const el=(label,value,title)=>{const node=this.host.element('span',label+': '+value,'runtime-status-metric',field);node.title=title;field.insertBefore(node,this.host.publicIP.browser);this.nodes[label]=node;};
    el('Cores','—','Logical processors reported by browser; not measured CPU utilization');
    el('CPU','Unavailable','System-wide CPU utilization is not exposed to ordinary websites');
    el('RAM','Unavailable','JS heap usage if browser supports performance.memory; not total system RAM');
    el('Reserved RAM','2 × 128 MiB','Two 128 MiB logical allocation budgets; not preallocated physical RAM');
    el('Priority','25% idle','Cooperative background work target; not operating system CPU priority');
    el('RAM Pools','2','Logical memory allocation pools');
    el('Session Pools','—','Current local browser session; not site-wide sessions');
    el('Visitors','Unavailable','Requires server-side analytics');
    el('Logged in','Unavailable','Requires verified server-side session tracking');
    this.refresh();this.start();
  }
  refresh(){const s=this.snapshot();const values={'Cores':s.cores??'Unavailable','CPU':'Unavailable','RAM':s.ram,'Reserved RAM':s.reservedRam,'Priority':s.priority,'RAM Pools':s.ramPools,'Session Pools':s.sessions+' local','Visitors':s.visitors,'Logged in':s.loggedIn};for(const [key,value] of Object.entries(values))if(this.nodes[key]?.isConnected)this.nodes[key].textContent=key+': '+value;this.registry.metrics.instances=[s];}
  start(){this.stop();this.timer=setInterval(()=>{if(!document.hidden)this.refresh();},15000);}
  stop(){if(this.timer!==null){clearInterval(this.timer);this.timer=null;}}
}
