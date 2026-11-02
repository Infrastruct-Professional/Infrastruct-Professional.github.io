/** Browser-local WHOIS concurrency; no server-side shared state or account identity. */
export class WhoisPoolSystem {
  constructor(name,limit=3){this.name=name;this.limit=limit;this.active=0;this.queue=[];this.registry={tasks:{instances:[],functions:{},nested:{},events:[]}};}
  run(task){return new Promise((resolve,reject)=>{this.queue.push({task,resolve,reject});this.drain();});}
  drain(){for(;this.active<this.limit&&this.queue.length;){const job=this.queue.shift();this.active++;this.registry.tasks.events.push({action:'start',at:Date.now()});Promise.resolve().then(job.task).then(job.resolve,job.reject).finally(()=>{this.active--;this.registry.tasks.events.push({action:'finish',at:Date.now()});this.drain();});}}
  snapshot(){return {name:this.name,active:this.active,queued:this.queue.length,limit:this.limit};}
}
export class WhoisSessionSystem {
  constructor(){this.id=crypto.randomUUID?.()||String(Date.now());this.history=[];this.pool=new WhoisPoolSystem('session',2);this.registry={sessions:{instances:[this],functions:{},nested:{},events:[]}};}
  record(domain,outcome){this.history.push({domain,outcome,at:new Date().toISOString()});if(this.history.length>50)this.history.shift();}
}
export class WhoisRuntimeSystem {
  constructor(){this.pool=new WhoisPoolSystem('runtime',3);this.registry={runtime:{instances:[this],functions:{},nested:{},events:[]}};}
  async lookup(domain,signal){const response=await fetch('https://rdap.org/domain/'+encodeURIComponent(domain),{headers:{Accept:'application/rdap+json, application/json'},signal});if(!response.ok)throw Error('RDAP returned HTTP '+response.status);return response.json();}
}
export class WhoisSharedPoolSystem {
  constructor(){this.pool=new WhoisPoolSystem('shared',4);this.members=new Set();this.registry={members:{instances:[],functions:{},nested:{},events:[]}};}
  join(system){this.members.add(system);this.registry.members.instances.push(system);}
  execute(session,runtime,domain,signal){return this.pool.run(()=>session.pool.run(()=>runtime.pool.run(()=>runtime.lookup(domain,signal))));}
}
