// Browser-side public IP status, clipboard action and connectivity feedback.
export class PublicIPSystem {
  constructor(host){
    this.host=host;this.registry={fetch:{instances:[],functions:{},nested:{},events:[]},copy:{instances:[],functions:{},nested:{},events:[]}};
    this.label=null;this.button=null;this.address=null;this.requestId=0;
    window.addEventListener('offline',()=>this.offline());
    window.addEventListener('online',()=>this.fetchAddress());
  }
  mount(header){
    const field=this.host.element('span',null,'public-ip-field',header);
    this.label=this.host.element('span','Infrastructure Engineering Services','public-ip-label banner-statement',header);
    header.insertBefore(this.label,field);
    this.browser=this.host.element('span',this.host.environment.browser,'public-ip-label banner-browser',field);
    this.button=this.host.element('button','Checking…','public-ip-value is-pending banner-ip',field);
    this.os=this.host.element('span',this.host.environment.os,'public-ip-label banner-os',field);
    this.host.element('span','/','public-ip-label',field);
    this.identity=this.host.element('span','Guest','public-ip-label banner-guest',field);
    this.button.type='button';this.button.disabled=true;
    this.button.setAttribute('aria-label','Public IP address; click to copy');
    this.button.setAttribute('aria-live','polite');
    this.button.addEventListener('click',()=>this.copyAddress());
    if(navigator.onLine===false)this.offline();else this.fetchAddress();
  }
  setIdentity(value){if(this.identity?.isConnected)this.identity.textContent=value;}
  async copyAddress(){
    if(!this.address||!this.button||this.button.disabled)return;
    try{
      await navigator.clipboard.writeText(this.address);
      this.button.title='Copied to clipboard';
      this.registry.copy.events.push({status:'copied'});this.host.audit('public_ip_copied');
    }catch(error){this.button.title='Clipboard permission denied';this.host.audit('public_ip_copy_failed');}
  }
  offline(){
    this.requestId++;this.address=null;
    if(this.button?.isConnected){this.button.textContent='Disconnected';this.button.className='public-ip-value is-offline';this.button.disabled=true;this.button.title='Connection lost';}
    this.registry.fetch.events.push({status:'offline'});this.host.audit('public_ip_offline');
  }
  async fetchAddress(){
    const request=++this.requestId;
    if(this.button?.isConnected){this.button.textContent='Checking…';this.button.className='public-ip-value is-pending';this.button.disabled=true;}
    try{
      const response=await fetch('https://api64.ipify.org?format=json',{cache:'no-store'});
      if(!response.ok)throw new Error('IP service unavailable');
      const data=await response.json(),ip=data?.ip;
      if(typeof ip!=='string'||!/^([0-9a-fA-F:.]+)$/.test(ip)||ip.length>45)throw new Error('Invalid IP response');
      if(request!==this.requestId)return;
      this.address=ip;const version=ip.includes(':')?'IPv6':'IPv4';
      if(this.button?.isConnected){this.button.textContent=ip;this.button.className='public-ip-value is-online';this.button.disabled=false;this.button.title='Click to copy public IP address';}
      this.registry.fetch.events.push({status:'success',version});this.host.audit('public_ip_resolved',{version});
    }catch(error){
      if(request!==this.requestId)return;
      this.address=null;
      if(this.button?.isConnected){this.button.textContent=navigator.onLine===false?'Disconnected':'Unavailable';this.button.className='public-ip-value is-offline';this.button.disabled=true;this.button.title='Public IP connection unavailable';}
      this.registry.fetch.events.push({status:'unavailable'});this.host.audit('public_ip_unavailable');
    }
  }
}
