export class ServiceWorkbench {
  constructor(host) {
    this.host=host;
    this.registry={catalog:{functions:{},nested:{},instances:[]},tools:{functions:{},nested:{},instances:[]}};
    this.catalog=[
      {name:'Domain & DNS',desc:'Design and validate DNS zone records, then export a change plan.',kind:'dns'},
      {name:'Software',desc:'Create a portable starter project specification.',kind:'software'},
      {name:'Infrastructure',desc:'Build a deployment checklist for your environment.',kind:'infrastructure'},
      {name:'Personal Server',desc:'Prepare a customer-owned server setup plan and authorization-ready runtime manifest.',kind:'server'},
      {name:'Business Technology',desc:'Prepare a business systems requirements brief.',kind:'business'}
    ];
    this.registry.catalog.instances=this.catalog;
    this.output=null;
  }
  svg(name){
    const icons={dns:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a16 16 0 0 1 0 18M12 3a16 16 0 0 0 0 18"/>',software:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m10 9-3 3 3 3m4-6 3 3-3 3"/>',infrastructure:'<rect x="3" y="3" width="18" height="7" rx="1"/><rect x="3" y="14" width="18" height="7" rx="1"/><path d="M7 7h1M7 18h1"/>',server:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 10h16M4 15h16M8 7h1M8 13h1M8 18h1"/>',business:'<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V4h8v3M3 12h18"/'};
    const wrapper=document.createElement('span');wrapper.className='service-icon';wrapper.innerHTML='<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(icons[name]||icons.infrastructure)+'</svg>';return wrapper;
  }
  render(parent){
    const e=(tag,text,cls,p)=>this.host.element(tag,text,cls,p);
    const section=e('section',null,'service-workbench',parent);
    e('div','SELF-SERVICE WORKSTATION','eyebrow',section);
    e('h2','Build. Export. Leave.',null,section);
    e('p','Choose a tool, prepare your infrastructure, export your work and end the session. No account required for these local planning tools.',null,section);
    const grid=e('div',null,'service-grid',section);
    this.catalog.forEach(item=>{const button=e('button',null,'service-card',grid);button.append(this.svg(item.kind));e('strong',item.name,null,button);e('small',item.desc,null,button);button.addEventListener('click',()=>this.open(item,section));});
    const exit=e('button','Finish session and clear workspace','session-exit',section);exit.addEventListener('click',()=>this.finish());
    this.workspace=e('div',null,'service-workspace',section);this.workspace.setAttribute('aria-live','polite');
  }
  open(item){
    this.executionController?.abort();this.executionController=null;this.workspace.replaceChildren();const e=(tag,text,cls,p)=>this.host.element(tag,text,cls,p);
    e('h3',item.name,null,this.workspace);
    const form=e('form',null,null,this.workspace);
    const label=e('label',item.kind==='dns'?'Domain name':item.kind==='software'?'Project name':item.kind==='server'?'Server name or hostname':'Project or organization',null,form);
    const input=e('input',null,null,label);input.required=true;input.maxLength=150;input.placeholder=item.kind==='dns'?'example.com':'My project';
    const notesLabel=e('label',item.kind==='dns'?'Desired records (one per line: TYPE NAME VALUE)':item.kind==='server'?'Operating system, access method and desired configuration (do not enter passwords or keys)':'Requirements / environment',null,form);
    const notes=e('textarea',null,null,notesLabel);notes.rows=4;notes.maxLength=8000;notes.placeholder=item.kind==='dns'?'A @ 192.0.2.1':'Describe the intended outcome';
    const generate=e('button','Generate downloadable plan',null,form);generate.type='submit';
    form.addEventListener('submit',event=>{event.preventDefault();const runtime=this.host.orchestrator.create(item.kind,{project:input.value.trim(),requirements:notes.value.trim()});const manifest=this.host.orchestrator.generate(runtime);const result={runtimeManifest:manifest,schema:'infrastruct.pro/workbench/v1',kind:item.kind,project:input.value.trim(),requirements:notes.value.trim(),generatedAt:new Date().toISOString(),status:'planning-only',notice:'No changes have been applied to any external service.'};if(item.kind==='dns'){result.records=result.requirements.split(/\n/).map(x=>x.trim()).filter(Boolean);result.instructions='Review records and authorize changes at your DNS provider. Never paste API tokens into this workstation.';}this.export(result);this.renderExecutionApproval(manifest);this.host.audit('service_plan_generated',{kind:item.kind});});
    input.focus();
  }
  renderExecutionApproval(manifest){
    const e=(tag,text,cls,p)=>this.host.element(tag,text,cls,p);
    const panel=e('section',null,'execution-approval',this.workspace);
    e('h4','Authorized deployment',null,panel);
    e('p','Remote execution requires a connected executor, verified subscription and explicit approval. No server changes are made by generating a plan.',null,panel);
    const status=e('p',this.host.remote.config.enabled?'Executor configured. Review the operation before approval.':'Remote executor not connected. Deployment is unavailable.','commerce-status',panel);
    const prepare=e('button','Prepare remote operation',null,panel);prepare.disabled=!this.host.remote.config.enabled;
    const controller=new AbortController();let prepared=null;
    const review=e('div',null,'execution-review',panel);
    prepare.addEventListener('click',async()=>{
      prepare.disabled=true;review.replaceChildren();status.textContent='Requesting operation preview…';
      try{
        prepared=await this.host.remote.prepare(manifest,controller.signal);
        status.textContent='Review the exact target and changes before authorizing execution.';
        e('pre',JSON.stringify({target:prepared.target,summary:prepared.summary,operationId:prepared.operationId},null,2),null,review);
        const label=e('label',null,null,review);const consent=e('input',null,null,label);consent.type='checkbox';
        e('span','I authorize the reviewed changes to the identified infrastructure.',null,label);
        const execute=e('button','Approve and execute',null,review);execute.disabled=true;
        consent.addEventListener('change',()=>{execute.disabled=!consent.checked;});
        execute.addEventListener('click',async()=>{
          execute.disabled=true;consent.disabled=true;status.textContent='Submitting approved operation…';
          try{const result=await this.host.remote.execute(prepared,true,controller.signal);status.textContent='Executor response: '+String(result?.state||'unknown')+'. Confirm completion with your infrastructure provider.';}
          catch(error){status.textContent='Execution not confirmed: '+error.message;}
        });
        const revoke=e('button','Revoke operation',null,review);
        revoke.addEventListener('click',async()=>{revoke.disabled=true;execute.disabled=true;try{await this.host.remote.revoke(prepared.operationId,controller.signal);status.textContent='Revocation requested. Verify cancellation with the executor.';}catch(error){status.textContent='Revocation not confirmed: '+error.message;}});
      }catch(error){status.textContent='Preparation failed: '+error.message;prepare.disabled=false;}
    });
    this.executionController=controller;
  }
  export(result){
    this.output=result;const existing=this.workspace.querySelector('.export-plan');if(existing)existing.remove();
    const button=this.host.element('button','Download JSON plan','export-plan',this.workspace);
    button.addEventListener('click',()=>{const blob=new Blob([JSON.stringify(this.output,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='infrastruct-'+this.output.kind+'-plan.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);this.host.audit('service_plan_exported',{kind:this.output.kind});});
  }
  finish(){
    this.executionController?.abort();this.executionController=null;this.host.orchestrator.disposeAll();this.output=null;this.workspace.replaceChildren();this.host.state.history=[];this.host.state.windows=[];this.host.state.foreground=null;this.host.audit('workbench_session_finished');this.host.element('p','Session cleared. Exported files remain on your device. You may close this tab.',null,this.workspace);}
}
