/** Optional authorized remote executor adapter; disabled until a trusted endpoint is configured. */
export class RemoteExecutionAdapter {
  constructor(host){
    this.host=host;
    this.registry={configuration:{functions:{},nested:{},instances:[]},requests:{functions:{},nested:{},instances:[]}};
    this.config={endpoint:'',enabled:false,authentication:'not-configured'};
    this.registry.configuration.instances.push(this.config);
  }
  endpoint(path){
    if(!this.config.enabled)throw new Error('Remote executor not connected');
    const base=new URL(this.config.endpoint);
    if(base.protocol!=='https:'||base.username||base.password||base.search||base.hash)throw new Error('Executor requires a clean HTTPS endpoint');
    if(!base.pathname.endsWith('/'))base.pathname+='/';
    return new URL(path,base);
  }
  async request(path,body,signal){
    const response=await fetch(this.endpoint(path),{method:'POST',credentials:'include',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(body),signal});
    if(!response.ok)throw new Error('Executor rejected request ('+response.status+')');
    return response.json();
  }
  async prepare(manifest,signal){
    if(manifest?.schema!=='infrastruct.pro/runtime/v1')throw new Error('Unsupported manifest');
    const result=await this.request('prepare',{manifest},signal);
    if(typeof result?.operationId!=='string'||typeof result?.summary!=='string'||typeof result?.target!=='string'||!result.target.trim()||typeof result?.approvalToken!=='string')throw new Error('Invalid executor response');
    this.registry.requests.instances.push({operationId:result.operationId,state:'awaiting-approval'});
    return result;
  }
  async execute(prepared,approved,signal){
    if(approved!==true)throw new Error('Explicit approval required');
    if(!prepared?.operationId||!prepared?.approvalToken)throw new Error('Missing prepared operation');
    const result=await this.request('execute',{operationId:prepared.operationId,approvalToken:prepared.approvalToken,approved:true},signal);
    this.host.audit('remote_execution_response',{operationId:prepared.operationId,state:result?.state||'unknown'});
    return result;
  }
  async revoke(operationId,signal){
    if(typeof operationId!=='string'||!operationId)throw new Error('Missing operation ID');
    return this.request('revoke',{operationId},signal);
  }
}
