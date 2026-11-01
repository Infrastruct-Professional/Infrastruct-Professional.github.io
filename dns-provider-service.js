/** Provider launcher: trusted official URLs only, no credential capture or API access. */
export class DNSProviderService {
  constructor(host){this.host=host;this.registry={providers:{instances:[],functions:{},nested:{},events:[]}};
    this.providers=[
      {name:'Cloudflare',url:'https://dash.cloudflare.com/login',scope:'DNS zones and records'},
      {name:'GoDaddy',url:'https://sso.godaddy.com/',scope:'Domains and DNS'},
      {name:'Namecheap',url:'https://www.namecheap.com/myaccount/login/',scope:'Domain management'},
      {name:'Porkbun',url:'https://porkbun.com/account/login',scope:'Domains and DNS'},
      {name:'IONOS',url:'https://login.ionos.com/',scope:'Domains and DNS'},
      {name:'OVHcloud',url:'https://www.ovh.com/manager/',scope:'DNS zones and domains'},
      {name:'Gandi',url:'https://admin.gandi.net/',scope:'Domains and DNS'},
      {name:'AWS Route 53',url:'https://console.aws.amazon.com/route53/',scope:'Hosted zones'},
      {name:'Google Cloud DNS',url:'https://console.cloud.google.com/net-services/dns/zones',scope:'Managed zones'},
      {name:'Azure DNS',url:'https://portal.azure.com/',scope:'DNS zones'},
      {name:'EuroDNS',url:'https://www.eurodns.com/',scope:'Domain and DNS administration'},
      {name:'Dynadot',url:'https://www.dynadot.com/account/',scope:'Domain management'},
      {name:'Hover',url:'https://www.hover.com/signin',scope:'Domains and DNS'},
      {name:'DigitalOcean DNS',url:'https://cloud.digitalocean.com/login',scope:'Domain records'},
      {name:'Hetzner DNS',url:'https://console.hetzner.com/',scope:'DNS and cloud infrastructure'}
    ];this.registry.providers.instances.push(...this.providers);
  }
  el(tag,text,cls,parent){return this.host.element(tag,text,cls,parent);}
  mount(parent){const root=this.el('section',null,'dns-provider-service',parent);
    this.el('h3','DNS Provider Connections',null,root);
    this.el('p','Select a provider to open its official account portal in a separate tab. Sign-in happens directly with that provider, not on this website.',null,root);
    const label=this.el('label','Find a provider',null,root),search=this.el('input',null,null,label);search.type='search';search.placeholder='Search DNS providers';search.autocomplete='off';
    const grid=this.el('div',null,'dns-provider-grid',root),status=this.el('p','No DNS provider is connected to this site.','dns-provider-status',root);status.setAttribute('role','status');
    const draw=()=>{grid.replaceChildren();const matches=this.providers.filter(p=>p.name.toLowerCase().includes(search.value.trim().toLowerCase()));
      for(const provider of matches){const card=this.el('article',null,'dns-provider-card',grid);this.el('strong',provider.name,null,card);this.el('small',provider.scope,null,card);
        const button=this.el('button','Open official portal',null,card);button.type='button';button.addEventListener('click',()=>{const opened=window.open(provider.url,'_blank','noopener,noreferrer');status.textContent=`Opened ${provider.name} official portal (or your browser blocked the new tab). Return here after managing your account. No session was created in Infrastruct Professional.`;this.registry.providers.events.push({type:'portal_opened',provider:provider.name});this.host.audit('dns_provider_portal_opened',{provider:provider.name});});
      }if(!matches.length)this.el('p','No matching provider.','dns-provider-status',grid);
    };search.addEventListener('input',draw);draw();
    this.el('p','Temporary access note: logging in on a provider portal creates a session controlled by that provider. Closing this workspace does not sign you out there. Sign out on the provider website when finished. Do not paste passwords, recovery codes or API keys into this site.', 'dns-provider-note',root);
    this.el('p','Direct zone listing, record changes, session expiry and one-click disconnect are not active. Those require a secure backend and provider-specific delegated authorization or approved API integration.', 'dns-provider-note',root);
  }
}
