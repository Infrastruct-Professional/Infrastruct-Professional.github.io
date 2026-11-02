/** Searchable local index of public Web OS navigation and capability specifications. */
export class SiteIndex {
  constructor(host){
    this.host=host;
    this.registry={index:{instances:[],functions:{},nested:{},events:[]}};
    this.entries=[];this.rebuild();
  }
  rebuild(){
    const entries=[];
    const add=(title,section,group,description)=>entries.push({title,section,group,description,keywords:[title,section,group,description].join(' ').toLocaleLowerCase()});
    for(const [name,description] of [['Free','€0/month · browser-local exploration'],['Starter','€19/month · proposed individual workflows'],['Professional','€59/month · proposed developer and business workflows'],['Enterprise','€199/month · proposed organizational controls']])add(name,'Plans','Subscriptions',description);
    for(const group of this.host.engineeringCatalog.groups)for(const [name,capabilities] of group.tools)add(name,'Tools',group.name,capabilities.join(' · '));
    for(const [group,names] of [['Network & identity',['WHOIS Lookup','DNS Providers']],['Data & generation',['Encoders','Random Generator']],['Hosting & access',['Web Hosting Providers','Secure Shell Booth']]])for(const name of names)add(name,'Services',group,'Browser-local service or directory');
    for(const stage of this.host.infrastructure.stages)add(stage.name,'Services','Infrastructure lifecycle',stage.goal+' · '+stage.checks.join(' · '));
    for(const entry of this.host.publicNavigation?.entries()||[])add(entry.title,entry.section,entry.section,entry.description);
    add('Encrypted local planning','Tools','Planning','Infrastructure checklist, local encrypted storage and project assessments');
    add('Session QR','Index','Web OS','Anonymous runtime session QR identifier, double-click to copy');
    add('Window EAN','Index','Web OS','Internal EAN-13 window identifier, double-click to copy');
    this.entries=entries;this.registry.index.instances=entries;this.host.audit('site_index_rebuilt',{entries:entries.length});return entries;
  }
  search(query){const terms=String(query).trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);return this.entries.filter(entry=>terms.every(term=>entry.keywords.includes(term)));}
  render(content){
    const el=(tag,text,cls,parent)=>this.host.element(tag,text,cls,parent);
    el('h2','SITE INDEX',null,content);
    el('p','Search the Web OS navigation, engineering capability catalogue, services and plans. This is an internal site index, not external search-engine indexing.',null,content);
    const input=el('input',null,'site-index-search',content);input.type='search';input.placeholder='Search tools, services, plans and capabilities';input.setAttribute('aria-label','Search website index');
    const count=el('p','',null,content),results=el('div',null,'site-index-results',content);
    const update=()=>{const found=this.search(input.value);count.textContent=found.length+' indexed entries';results.replaceChildren();for(const entry of found){const button=el('button',null,'site-index-entry',results);button.type='button';el('strong',entry.title.toUpperCase(),null,button);el('small',entry.section+' / '+entry.group,null,button);el('span',entry.description,null,button);button.addEventListener('click',()=>{if(entry.section==='Tools')this.host.engineeringCatalogSelection=entry.title;this.host.webOS.open(entry.section==='Index'?'Index':entry.section);});}};
    input.addEventListener('input',update);update();
  }
}
