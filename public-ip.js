// Client-side public IP display; ipify returns the visitor's public address only.
export class PublicIPSystem {
  constructor(host){this.host=host;this.registry={fetch:{instances:[],functions:{},nested:{},events:[]}};this.label=null;this.address=null;}
  mount(header){this.label=this.host.element('span','Public: checking…','public-ip-label',header);this.label.setAttribute('aria-live','polite');this.fetchAddress();}
  async fetchAddress(){
    try{
      const response=await fetch('https://api64.ipify.org?format=json',{cache:'no-store'});
      if(!response.ok)throw new Error('IP service unavailable');
      const data=await response.json();const ip=data?.ip;
      if(typeof ip!=='string'||!/^([0-9a-fA-F:.]+)$/.test(ip)||ip.length>45)throw new Error('Invalid IP response');
      this.address=ip;const version=ip.includes(':')?'IPv6':'IPv4';
      if(this.label?.isConnected)this.label.textContent=`Public: ${ip}`;
      this.registry.fetch.events.push({status:'success',version});this.host.audit('public_ip_resolved',{version});
    }catch(error){if(this.label?.isConnected)this.label.textContent='Public: unavailable';this.registry.fetch.events.push({status:'unavailable'});this.host.audit('public_ip_unavailable');}
  }
}
