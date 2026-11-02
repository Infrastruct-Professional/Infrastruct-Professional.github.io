/** First-class Web OS domain systems and lifecycle-aware background runtime. */
export class DomainSystem {
  constructor(host,name,purposes,sections){this.host=host;this.name=name;this.purposes=purposes;this.sections=sections;this.registry={constructor:{instances:[this],functions:{},nested:{},events:[]},navigation:{instances:sections,functions:{},nested:{},events:[]},purposes:{instances:purposes,functions:{},nested:{},events:[]}};}
  search(query){const words=String(query).toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);return this.sections.filter(entry=>words.every(word=>(entry.title+' '+entry.description).toLocaleLowerCase().includes(word)));}
  open(section){const target=section||this.sections[0]?.destination||this.name;this.registry.navigation.events.push({target,time:Date.now()});return this.host.webOS.open(target);}
}
export class PlanSystem extends DomainSystem {
  constructor(host){super(host,'Plans',['Subscription tier discovery','Identity and eligibility checks','Free-plan activation','Entitlement lifecycle and billing readiness','Plan comparison and governance'],['Free','Starter','Professional','Enterprise'].map(title=>({title,description:'Subscription tier and entitlement scope',destination:'Plans'})));}
}
export class ToolSystem extends DomainSystem {
  constructor(host){super(host,'Tools',['Engineering capability taxonomy','Development and transformation tooling','Encrypted local infrastructure planning','Tool selection and diagnostics','Audit of tool navigation'],host.engineeringCatalog.groups.flatMap(group=>group.tools.map(([title,capabilities])=>({title,description:capabilities.join(' · '),destination:'Tools',tool:title}))));}
}
export class ServiceSystem extends DomainSystem {
  constructor(host){super(host,'Services',['Service discovery and directory','Browser-local service execution','Infrastructure lifecycle assessment','Commerce and order workflow','Provider integration readiness'],[['WHOIS Lookup','Domain lookup'],['Encoders','Data encoding'],['Random Generator','Identifier generation'],['DNS Providers','DNS directory'],['Web Hosting Providers','Hosting directory'],['Secure Shell Booth','Shell booth'],['Shop','Product discovery'],['Cart','Shopping cart'],['Checkout','Zero-charge checkout']].map(([title,description])=>({title,description,destination:['Shop','Cart','Checkout'].includes(title)?title:'Services'})));}
}
export class BackgroundSystem {
  constructor(host){this.host=host;this.registry={lifecycle:{instances:[],functions:{},nested:{},events:[]},tasks:{instances:[],functions:{},nested:{},events:[]}};this.tasks=new Map();this.idleDutyTarget=.25;this.active=false;this.visible=true;this.boundVisibility=()=>this.onVisibility();this.boundPageHide=()=>this.stop();}
  start(){if(this.active)return;this.active=true;this.visible=typeof document==='undefined'||!document.hidden;document?.addEventListener('visibilitychange',this.boundVisibility);window?.addEventListener('pagehide',this.boundPageHide);this.record('start');this.schedule();}
  record(type){this.registry.lifecycle.events.push({type,time:Date.now()});this.host.audit?.('background_'+type);}
  register(name,callback){if(typeof callback!=='function')throw Error('Background task must be a function');this.tasks.set(name,callback);this.registry.tasks.instances=[...this.tasks.keys()];this.schedule();}
  onVisibility(){this.visible=!document.hidden;this.record(this.visible?'resume':'suspend');if(this.visible)this.schedule();}
  schedule(){if(!this.active||!this.visible||this.scheduled)return;this.scheduled=true;const run=()=>{this.scheduled=false;if(!this.active||!this.visible)return;const start=performance.now();const budget=2;for(const [name,callback] of this.tasks){if(performance.now()-start>=budget)break;try{callback();this.registry.tasks.events.push({name,status:'completed',time:Date.now()});}catch(error){this.registry.tasks.events.push({name,status:'failed',time:Date.now()});this.host.audit?.('background_task_failed',{name,message:String(error)});}}};if(typeof requestIdleCallback==='function')requestIdleCallback(deadline=>{if(deadline.timeRemaining()>0)run();else this.scheduled=false;},{timeout:1500});else setTimeout(run,50);}
  stop(){if(!this.active)return;this.active=false;document?.removeEventListener('visibilitychange',this.boundVisibility);window?.removeEventListener('pagehide',this.boundPageHide);this.record('stop');}
}
