import { WhoisSessionSystem, WhoisRuntimeSystem, WhoisSharedPoolSystem } from './whois-systems.js';
/** Free, public domain registration lookup using RDAP (the modern WHOIS successor). */
export class WhoisLookupService {
  constructor(host){this.host=host;this.session=new WhoisSessionSystem();this.runtime=new WhoisRuntimeSystem();this.shared=new WhoisSharedPoolSystem();for(const system of [this.session,this.runtime,this.shared])this.shared.join(system);this.registry={lookup:{instances:[this],functions:{},nested:{},events:[]},systems:{instances:[this.session,this.runtime,this.shared],functions:{},nested:{},events:[]}};}
  el(tag,text,cls,parent){return this.host.element(tag,text,cls,parent);}
  mount(parent){const root=this.el('section',null,'dns-provider-service',parent);
    this.el('h3','WHOIS / RDAP Domain Lookup',null,root);
    this.el('p','Look up public domain registration details through RDAP. Results depend on registry disclosure rules; personal registrant details may be redacted.',null,root);
    const form=this.el('form',null,'workbench-form',root),label=this.el('label','Domain name',null,form),field=this.el('input',null,null,label);
    field.type='text';field.required=true;field.placeholder='example.com';field.autocomplete='off';field.maxLength=253;
    const submit=this.el('button','Look up domain',null,form);submit.type='submit';
    const status=this.el('p','Enter a domain to begin.','dns-provider-status',root);status.setAttribute('role','status');
    const poolStatus=this.el('p','Session ready · Runtime ready · Shared pool ready','workbench-intro',root);
    const results=this.el('div',null,'dns-provider-card',root);results.hidden=true;
    form.addEventListener('submit',async event=>{event.preventDefault();const domain=field.value.trim().toLowerCase().replace(/\.$/,'');
      if(domain.length>253||!domain.includes('.')||!domain.split('.').every(label=>/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label))){status.textContent='Enter a valid ASCII domain name (for internationalized domains, use punycode).';return;}
      submit.disabled=true;status.textContent='Querying public RDAP…';results.hidden=true;results.replaceChildren();
      const endpoint='https://rdap.org/domain/'+encodeURIComponent(domain);
      poolStatus.textContent='Query running · '+this.shared.pool.snapshot().active+' active · '+this.shared.pool.snapshot().queued+' queued';
      try{const data=await this.shared.execute(this.session,this.runtime,domain,AbortSignal.timeout(12000));results.hidden=false;
        const show=(name,value)=>{if(value!==undefined&&value!==null&&String(value).trim())this.el('p',name+': '+String(value),null,results);};
        show('Domain',data.ldhName||domain);show('Handle',data.handle);show('Status',(data.status||[]).join(', '));
        for(const item of data.events||[]){if(['registration','expiration','last changed'].includes(item.eventAction))show(item.eventAction,item.eventDate);}
        show('Nameservers',(data.nameservers||[]).map(n=>n.ldhName).filter(Boolean).join(', '));
        const entities=(data.entities||[]).filter(e=>(e.roles||[]).includes('registrar'));
        show('Registrar',entities.map(e=>e.vcardArray?.[1]?.find(v=>v[0]==='fn')?.[3]||e.handle).filter(Boolean).join(', '));
        this.el('p','Source: public RDAP data. Information may be incomplete, delayed, or privacy-redacted.',null,results);
        status.textContent='Public registration lookup completed.';this.session.record(domain,'success');this.host.audit('rdap_lookup',{success:true});
      }catch(error){status.textContent='Browser RDAP request unavailable: '+error.message+'. Use the public lookup link below.';this.session.record(domain,'error');this.host.audit('rdap_lookup',{success:false});}
      const link=this.el('a','Open public RDAP lookup',null,results);link.href=endpoint;link.target='_blank';link.rel='noopener noreferrer';results.hidden=false;submit.disabled=false;poolStatus.textContent='Session '+this.session.history.length+' queries · Runtime '+this.runtime.pool.snapshot().active+' active · Shared pool '+this.shared.pool.snapshot().queued+' queued';
    });
  }
}
