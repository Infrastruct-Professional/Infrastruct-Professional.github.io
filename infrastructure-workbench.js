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
    const vault=this.host.planStorage;
    if(!vault.available()){this.el('p','Planning is disabled: persistent browser storage and Web Crypto are required. Enable site storage in browser settings and reload.','workbench-intro',content);return;}
    const gate=this.el('section',null,'workbench-stage',content);
    this.el('h3','Encrypted local planning storage',null,gate);
    this.el('p','Create or unlock your local vault with a passphrase (12+ characters). Plans are encrypted using AES-256-GCM before browser storage. Your passphrase is not stored or sent to a server. Losing it means losing access to the vault.',null,gate);
    const pass=this.el('input',null,null,gate);pass.type='password';pass.autocomplete='new-password';pass.placeholder='Vault passphrase (12+ characters)';pass.setAttribute('aria-label','Vault passphrase');
    const unlock=this.el('button',vault.exists()?'Unlock vault':'Create encrypted vault',null,gate);unlock.type='button';
    const message=this.el('p',vault.key?'Vault unlocked for this page.':'Planning locked until encrypted storage is unlocked.','workbench-progress',gate);message.setAttribute('role','status');
    const area=this.el('div',null,null,content);
    const show=()=>{area.replaceChildren();if(vault.key)this.renderUnlockedTools(area);};
    unlock.addEventListener('click',async()=>{unlock.disabled=true;try{await vault.unlock(pass.value);pass.value='';message.textContent='Encrypted vault unlocked. Planning is now available.';show();}catch(error){message.textContent=error.message;}finally{unlock.disabled=false;}});
    show();
  }
  renderUnlockedTools(content){
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
    const exportButton=this.el('button','Save encrypted infrastructure plan',null,form);exportButton.type='submit';
    const saveStatus=this.el('p','Plan data remains in this browser, encrypted at rest.','workbench-progress',form);saveStatus.setAttribute('role','status');
    form.addEventListener('submit',async event=>{event.preventDefault();if(!form.reportValidity())return;
      const data={schema:'infrastruct.pro/planning/v1',project:name.value.trim(),deploymentModel:select.value,createdAt:new Date().toISOString(),status:'draft-not-deployed',stages:this.stages.map(stage=>({name:stage.name,goal:stage.goal,checks:boxes.filter(item=>item.stage===stage.name).map(item=>({label:item.check,assessed:item.box.checked}))}))};
      exportButton.disabled=true;try{await this.host.planStorage.savePlan(data);saveStatus.textContent='Plan encrypted and saved in this browser.';this.registry.assessment.events.push({type:'encrypted_save',checked:boxes.filter(item=>item.box.checked).length});}catch(error){saveStatus.textContent='Unable to save: '+error.message;}finally{exportButton.disabled=false;}
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
    const services=[['WHOIS Lookup',()=>this.host.whois.mount(workspace),'Free'],['Encoders',()=>this.host.encoding.mount(workspace),'Free'],['Random Generator',()=>this.host.randomGenerator.mount(workspace),'Free'],['DNS Providers',()=>this.host.dnsProviders.mount(workspace),'Free'],['Web Hosting Providers',()=>this.host.hostingProviders.mount(workspace),'Free'],['Secure Shell Booth',()=>this.host.shellBooth.mount(workspace),'Free']];
    const buttons=[];
    for(const [label,render,tier] of services){
      const button=this.el('button',label+' · '+tier,'workbench-service-tab',servicesMenu);
      button.type='button';button.setAttribute('aria-pressed','false');buttons.push(button);
      button.addEventListener('click',()=>{
        workspace.replaceChildren();render();
        for(const other of buttons)other.setAttribute('aria-pressed',String(other===button));
        this.host.audit('service_selected',{service:label});
      });
    }
    buttons[0]?.click();
    this.el('p','These are proposed service categories and review scopes, not a claim that managed delivery or infrastructure provisioning is currently available.','workbench-intro',content);
  }
}
