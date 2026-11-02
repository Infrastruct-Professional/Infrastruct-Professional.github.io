/** Web hosting portal directory. Never accepts credentials or impersonates provider login. */
export class HostingProviderService {
  constructor(host){this.host=host;this.registry={providers:{instances:[],functions:{},nested:{},events:[]}};
    this.providers=[
      ['Hostinger','Shared & managed','https://hpanel.hostinger.com/'],
      ['Bluehost','Shared & managed','https://www.bluehost.com/my-account/login'],
      ['SiteGround','Shared & managed','https://tools.siteground.com/'],
      ['DreamHost','Shared & managed','https://panel.dreamhost.com/'],
      ['GoDaddy Hosting','Shared & managed','https://sso.godaddy.com/'],
      ['IONOS Hosting','Shared & managed','https://login.ionos.com/'],
      ['Namecheap Hosting','Shared & managed','https://www.namecheap.com/myaccount/login/'],
      ['A2 Hosting','Shared & managed','https://www.a2hosting.com/'],
      ['InMotion Hosting','Shared & managed','https://secure1.inmotionhosting.com/'],
      ['HostGator','Shared & managed','https://www.hostgator.com/'],
      ['Kinsta','Managed WordPress','https://my.kinsta.com/'],
      ['WP Engine','Managed WordPress','https://my.wpengine.com/'],
      ['Cloudways','Managed cloud','https://platform.cloudways.com/login'],
      ['Vercel','App platforms','https://vercel.com/login'],
      ['Netlify','App platforms','https://app.netlify.com/login'],
      ['Render','App platforms','https://dashboard.render.com/login'],
      ['Railway','App platforms','https://railway.com/'],
      ['Fly.io','App platforms','https://fly.io/dashboard'],
      ['DigitalOcean','Cloud & VPS','https://cloud.digitalocean.com/login'],
      ['Hetzner Cloud','Cloud & VPS','https://console.hetzner.com/'],
      ['Linode / Akamai Cloud','Cloud & VPS','https://cloud.linode.com/'],
      ['Vultr','Cloud & VPS','https://my.vultr.com/'],
      ['AWS','Cloud & VPS','https://console.aws.amazon.com/'],
      ['Google Cloud','Cloud & VPS','https://console.cloud.google.com/'],
      ['Microsoft Azure','Cloud & VPS','https://portal.azure.com/'],
      ['OVHcloud','Cloud & VPS','https://www.ovh.com/manager/'],
      ['GitHub Pages','Static hosting','https://github.com/login'],
      ['Cloudflare Pages','Static hosting','https://dash.cloudflare.com/login']
    ].map(([name,category,url])=>({name,category,url}));this.registry.providers.instances.push(...this.providers);
  }
  el(tag,text,cls,parent){return this.host.element(tag,text,cls,parent);}
  mount(parent){const root=this.el('section',null,'dns-provider-service',parent);
    this.el('h3','Web Hosting Providers',null,root);
    this.el('p','Select a web hosting provider and open its official account portal in a separate browser tab. Credentials are entered only on the provider website.',null,root);
    const label=this.el('label','Search providers',null,root),search=this.el('input',null,null,label);search.type='search';search.placeholder='Search web hosting providers';search.autocomplete='off';
    const categoryLabel=this.el('label','Hosting category',null,root),category=this.el('select',null,null,categoryLabel);
    for(const value of ['All categories',...new Set(this.providers.map(p=>p.category))]){const option=this.el('option',value,null,category);option.value=value;}
    const grid=this.el('div',null,'dns-provider-grid',root),status=this.el('p','No web hosting account is connected to Infrastruct Professional.','dns-provider-status',root);status.setAttribute('role','status');
    const render=()=>{grid.replaceChildren();const term=search.value.trim().toLowerCase(),matches=this.providers.filter(p=>(category.value==='All categories'||p.category===category.value)&&p.name.toLowerCase().includes(term));
      for(const provider of matches){const card=this.el('article',null,'dns-provider-card',grid);this.el('strong',provider.name,null,card);this.el('small',provider.category,null,card);const button=this.el('button','Open official portal',null,card);button.type='button';button.addEventListener('click',()=>{
        window.open(provider.url,'_blank','noopener,noreferrer');status.textContent=`Requested ${provider.name} official portal in a new tab. Sign out on that portal when finished.`;
        this.registry.providers.events.push({type:'portal_opened',provider:provider.name});this.host.audit('hosting_provider_portal_opened',{provider:provider.name});
      });}if(!matches.length)this.el('p','No matching providers.','dns-provider-status',grid);
    };search.addEventListener('input',render);category.addEventListener('change',render);render();
    this.el('p','Temporary access means you can visit a provider without saving credentials here. The provider controls its own login and session duration; closing this service does not log you out of the provider.', 'dns-provider-note',root);
    this.el('p','In-app account linking, hosting inventory, deployments, and one-click disconnection are not available until a secure backend and provider-approved authorization integrations are implemented.', 'dns-provider-note',root);
  }
}
