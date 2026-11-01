/** Browser-local infrastructure design tools; no provisioning or privileged actions. */
export class InfrastructureWorkbench {
  constructor(host){
    this.host=host;
    this.registry={workflow:{instances:[],functions:{},nested:{},events:[]},assessment:{instances:[],functions:{},nested:{},events:[]}};
    this.stages=[
      {name:'Discover',goal:'Define outcomes and boundaries',checks:['Business objective documented','Owners and stakeholders identified','Availability and recovery targets defined','Budget and location constraints recorded'],service:'Requirements & feasibility review'},
      {name:'Architect',goal:'Choose topology and dependencies',checks:['Compute and storage topology documented','Network and DNS design reviewed','Data flows and integrations mapped','Capacity assumptions and alternatives recorded'],service:'Architecture & design review'},
      {name:'Secure',goal:'Protect identities, data and boundaries',checks:['Identity and least-privilege access designed','Threats and trust boundaries reviewed','Secrets and encryption strategy documented','Logging and incident ownership defined'],service:'Security & compliance assessment'},
      {name:'Provision',goal:'Prepare reproducible infrastructure',checks:['Infrastructure-as-code plan reviewed','Environments and configuration separated','Backups and restore approach defined','Change approvals and rollback prepared'],service:'Provisioning readiness review'},
      {name:'Validate',goal:'Prove requirements before release',checks:['Functional and integration tests planned','Security and configuration tests planned','Load and resilience tests planned','Recovery exercise and acceptance criteria defined'],service:'Testing & release assurance'},
      {name:'Operate',goal:'Observe, recover and improve',checks:['Metrics, logs and alerts defined','Runbooks and escalation contacts assigned','SLOs and incident response documented','Cost, capacity and sustainability reviewed'],service:'Operations & reliability review'}
    ];
    this.sources=[
      ['NIST SP 800-160','https://csrc.nist.gov/pubs/sp/800/160/v1/r1/final'],
      ['AWS Well-Architected','https://wa.aws.amazon.com/index.en.html'],
      ['Google Cloud Well-Architected','https://docs.cloud.google.com/architecture/framework'],
      ['CNCF Maturity Model','https://maturitymodel.cncf.io/aspects/technology/']
    ];
    this.registry.workflow.instances.push(...this.stages);
  }
  el(tag,text,cls,parent){return this.host.element(tag,text,cls,parent);}
  render(content,mode){
    const title=this.el('h2',mode==='Tools'?'Infrastructure engineering tools':'Infrastructure engineering services',null,content);
    this.el('p','A practical lifecycle from discovery to operations. Local planning only; no resources are deployed or changed.', 'workbench-intro',content);
    if(mode==='Tools')this.renderTools(content);else this.renderServices(content);
    const sources=this.el('div',null,'workbench-sources',content);
    this.el('strong','Engineering references',null,sources);
    for(const [name,url] of this.sources){const a=this.el('a',name,null,sources);a.href=url;a.target='_blank';a.rel='noopener noreferrer';}
  }
  renderTools(content){
    const form=this.el('form',null,'workbench-form',content);
    const field=this.el('label','Project / infrastructure name',null,form);
    const name=this.el('input',null,null,field);name.name='project';name.required=true;name.maxLength=100;name.placeholder='Example: Production web platform';
    const scope=this.el('label','Deployment model',null,form);
    const select=this.el('select',null,null,scope);
    for(const value of ['On-premises','Cloud','Hybrid','Multi-cloud']){const opt=this.el('option',value,null,select);opt.value=value;}
    const list=this.el('div',null,'workbench-stages',form);
    const boxes=[];
    for(const [index,stage] of this.stages.entries()){
      const section=this.el('section',null,'workbench-stage',list);
      this.el('h3',`${index+1}. ${stage.name}`,null,section);
      this.el('p',stage.goal,null,section);
      for(const check of stage.checks){const label=this.el('label',null,'workbench-check',section);const box=this.el('input',null,null,label);box.type='checkbox';label.append(document.createTextNode(check));boxes.push({box,stage:stage.name,check});}
    }
    const progress=this.el('p','0 of 24 readiness items assessed','workbench-progress',form);
    const update=()=>{const done=boxes.filter(item=>item.box.checked).length;progress.textContent=`${done} of ${boxes.length} readiness items assessed (${Math.round(done/boxes.length*100)}%) · Checklist progress is not a certification.`;};
    boxes.forEach(item=>item.box.addEventListener('change',update));
    const exportButton=this.el('button','Export infrastructure plan (JSON)',null,form);exportButton.type='submit';
    form.addEventListener('submit',event=>{event.preventDefault();if(!form.reportValidity())return;
      const data={schema:'infrastruct.pro/planning/v1',project:name.value.trim(),deploymentModel:select.value,createdAt:new Date().toISOString(),status:'draft-not-deployed',stages:this.stages.map(stage=>({name:stage.name,goal:stage.goal,checks:boxes.filter(item=>item.stage===stage.name).map(item=>({label:item.check,assessed:item.box.checked}))}))};
      const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='infrastructure-plan.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
      this.registry.assessment.events.push({type:'export',checked:boxes.filter(item=>item.box.checked).length});this.host.audit('infrastructure_plan_export');
    });
  }
  renderServices(content){
    const grid=this.el('div',null,'workbench-service-grid',content);
    for(const [index,stage] of this.stages.entries()){
      const card=this.el('article',null,'workbench-service',grid);
      this.el('small',`PHASE ${index+1} · ${stage.name.toUpperCase()}`,null,card);
      this.el('h3',stage.service,null,card);
      this.el('p',stage.goal,null,card);
      const list=this.el('ul',null,null,card);
      for(const item of stage.checks)this.el('li',item,null,list);
    }
    const servicesMenu=this.el('nav',null,'workbench-services-menu',content);
    servicesMenu.setAttribute('aria-label','Interactive services');
    const workspace=this.el('div',null,'workbench-services-workspace',content);
    const services=[['Secure Shell Booth',()=>this.host.shellBooth.mount(workspace)],['Encoders',()=>this.host.encoding.mount(workspace)],['DNS Providers',()=>this.host.dnsProviders.mount(workspace)],['Web Hosting Providers',()=>this.host.hostingProviders.mount(workspace)]];
    const buttons=[];
    for(const [label,render] of services){
      const button=this.el('button',label,'workbench-service-tab',servicesMenu);
      button.type='button';button.setAttribute('aria-pressed','false');buttons.push(button);
      button.addEventListener('click',()=>{
        workspace.replaceChildren();render();
        for(const other of buttons)other.setAttribute('aria-pressed',String(other===button));
        this.host.audit('service_selected',{service:label});
      });
    }
    this.el('p','Choose a service to open its workspace.','workbench-intro',workspace);
    this.el('p','These are proposed service categories and review scopes, not a claim that managed delivery or infrastructure provisioning is currently available.','workbench-intro',content);
  }
}
