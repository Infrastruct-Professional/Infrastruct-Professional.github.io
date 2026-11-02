/** Browser-side, ephemeral orchestration. Does not create a remote backend or hold secrets. */
export class RuntimeOrchestrator {
  constructor(host){
    this.host=host;
    this.registry={sessions:{functions:{},nested:{},instances:[]},adapters:{functions:{},nested:{},instances:[]}};
    this.sessions=new Map();
    this.adapters={browser:{available:true,execution:'local'},webR:{available:false,execution:'local'},remote:{available:false,execution:'requires-authorized-executor'}};
    this.registry.adapters.instances.push(this.adapters);
  }
  scopeStatus(){return Object.fromEntries(Object.entries(this.scopes||{}).map(([name,system])=>[name,system.snapshot()]));}
  create(kind,requirements={}){
    const id=globalThis.crypto?.randomUUID?.()||('session-'+Date.now()+'-'+Math.floor(Math.random()*1e6));
    const session={id,kind,createdAt:new Date().toISOString(),state:'prepared',requirements:{...requirements},operations:[],artifacts:[]};
    this.sessions.set(id,session);
    this.registry.sessions.instances.push({id,kind,state:session.state});
    this.host.audit('runtime_session_prepared',{id,kind});
    return session;
  }
  generate(session,format='json'){
    if(!this.sessions.has(session.id))throw new Error('Session is no longer active');
    if(format!=='json')throw new Error('Unsupported artifact format');
    const artifact={schema:'infrastruct.pro/runtime/v1',sessionId:session.id,kind:session.kind,requirements:{...session.requirements},execution:'not-executed',authorization:'required-for-remote-operations',hosting:'customer-owned',cleanup:'local-session-only'};
    session.artifacts.push(artifact);
    this.host.audit('runtime_artifact_generated',{id:session.id});
    return artifact;
  }
  dispose(id){
    const session=this.sessions.get(id);if(!session)return false;
    session.state='disposed';session.requirements={};session.operations.length=0;session.artifacts.length=0;
    this.sessions.delete(id);
    const entry=this.registry.sessions.instances.find(x=>x.id===id);if(entry)entry.state='disposed';
    this.host.audit('runtime_session_disposed',{id});
    return true;
  }
  disposeAll(){Array.from(this.sessions.keys()).forEach(id=>this.dispose(id));}
}
