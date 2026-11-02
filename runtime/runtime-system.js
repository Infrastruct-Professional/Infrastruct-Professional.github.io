/** Browser-local JavaScript/R runtime coordinator. No server or RAM reservation is implied. */
export class RuntimeSystem {
  constructor(host){
    this.host=host;this.webr=null;this.ready=false;this.pending=false;this.queued=false;
    this.registry={constructor:{instances:[this],functions:{},nested:{},events:[]},javascript:{instances:[{state:'active'}],functions:{},nested:{},events:[]},r:{instances:[{state:'initializing'}],functions:{},nested:{},events:[]},audit:{instances:[],functions:{},nested:{},events:[]}};
  }
  setRState(state){this.registry.r.instances=[{state}];if(this.host.runtimeLabel?.isConnected)this.host.runtimeLabel.textContent='JS runtime ready · '+(state==='active'?'webR active':state==='unavailable'?'webR unavailable':'R initializing');}
  async start(){
    try{
      const {WebR}=await import('https://webr.r-wasm.org/latest/webr.mjs');
      const runtime=new WebR();await runtime.init();
      const response=await fetch('./index.R');if(!response.ok)throw Error('index.R could not be loaded');
      await runtime.evalRVoid(await response.text());this.webr=runtime;this.ready=true;
      this.host.orchestrator.adapters.webR.available=true;this.setRState('active');this.host.audit('webr_ready');
    }catch(error){this.ready=false;this.setRState('unavailable');this.host.audit('webr_unavailable',{message:String(error)});}
  }
  static rString(value){return '"'+String(value).replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/\n/g,'\\n').replace(/\r/g,'\\r')+'"';}
  async analyze(){
    if(!this.ready)return;
    if(this.pending){this.queued=true;return;}
    this.pending=true;
    try{
      const types=this.host.state.events.map(event=>event.type);
      const vector=types.length?'c('+types.map(RuntimeSystem.rString).join(',')+')':'character(0)';
      const result=await this.webr.evalR('infra_audit(lapply('+vector+', function(type) list(type=type)))');
      this.host.state.analytics=await result.toJs();
      this.registry.audit.instances=[{count:types.length,source:'index.R',time:Date.now()}];
    }catch(error){this.host.state.analytics={error:String(error)};this.registry.audit.events.push({status:'failed',message:String(error)});}
    finally{this.pending=false;if(this.queued){this.queued=false;queueMicrotask(()=>this.analyze());}}
  }
}
