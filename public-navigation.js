/** Public-facing menu taxonomy and informational page content. */
export class PublicNavigationSystem {
  constructor(host){
    this.host=host;
    this.sections={
      About:[['Overview','What Infrastruct Professional is and what it currently provides.'],['Architecture','JavaScript, webR and platform system boundaries.'],['Roadmap','Planned backend, domain forest and integration milestones.']],
      Products:[['Web OS','Desktop windows and Android-style tablet/mobile navigation.'],['Engineering Tools','Engineering and development tool catalogue.'],['Plans','Free browser-local access and proposed subscription tiers.']],
      Downloads:[['Download Site','Download the current website source as a ZIP package for your home server.'],['Documentation','Read project documentation in the public GitHub repository.'],['Source Code','Access the published open-source website repository.']],
      Uploads:[['Local Files','File upload processing is not yet implemented.'],['Import Planning','Future browser-local import and validation workflow.'],['Secure Transfers','Server-backed uploads await the authenticated backend.']],
      Help:[['Getting Started','Open the dashboard, plans and browser-local tools.'],['Navigation','Use the menu, searchable index and platform navigation controls.'],['FAQ','Review current functionality and planned integrations.']],
      Support:[['Support Overview','Support channels have not yet been activated.'],['Report an Issue','Use the GitHub repository issue tracker.'],['System Status','Inspect the runtime dashboard for browser-local state.']],
      Contact:[['Contact Information','Official contact details have not yet been published.'],['Business Enquiries','Business contact workflow is being prepared.'],['Security Reports','A dedicated security reporting channel is being prepared.']]
    };
    this.registry={sections:{instances:Object.entries(this.sections),functions:{},nested:{},events:[]},navigation:{instances:[],functions:{},nested:{},events:[]}};
  }
  entries(){return Object.entries(this.sections).flatMap(([section,items])=>items.map(([title,description])=>({section,title,description})));}
  render(content,section){
    const el=(tag,text,cls,parent)=>this.host.element(tag,text,cls,parent);
    el('h2',section.toUpperCase(),null,content);
    el('p','Infrastruct Professional · '+section,null,content);
    const items=this.sections[section]||[];
    for(const [title,description] of items){
      const block=el('section',null,'dashboard-card',content);block.dataset.publicTopic=title;
      el('h3',title,null,block);el('p',description,null,block);
      if(section==='Downloads'&&title==='Download Site'){
        this.link(block,'Download Site',()=>globalThis.location.assign('https://github.com/Infrastruct-Professional/Infrastruct-Professional.github.io/archive/refs/heads/main.zip'));
        el('p','ZIP archive of the current main branch. Extract the package and serve its root folder over HTTP or HTTPS; index.html is the entry point. Browser data, credentials and live server services are not included.',null,block);
      }
      if(section==='Products'&&title==='Plans')this.link(block,'Open Plans',()=>this.host.webOS.open('Plans'));
      if(section==='Products'&&title==='Engineering Tools')this.link(block,'Open Tools',()=>this.host.webOS.open('Tools'));
      if(section==='Help'&&title==='Getting Started')this.link(block,'Open Dashboard',()=>this.host.webOS.open('Dashboard'));
      if(section==='Support'&&title==='System Status')this.link(block,'Open Dashboard',()=>this.host.webOS.open('Dashboard'));
      if(section==='Support'&&title==='Report an Issue')this.link(block,'GitHub Issues',()=>globalThis.open?.('https://github.com/Infrastruct-Professional/Infrastruct-Professional.github.io/issues','_blank','noopener,noreferrer'));
      if(section==='Downloads'&&title==='Source Code')this.link(block,'View Repository',()=>globalThis.open?.('https://github.com/Infrastruct-Professional/Infrastruct-Professional.github.io','_blank','noopener,noreferrer'));
      if(section==='Downloads'&&title==='Documentation')this.link(block,'Read Standards',()=>globalThis.open?.('https://github.com/Infrastruct-Professional/Infrastruct-Professional.github.io/blob/main/STANDARDS.md','_blank','noopener,noreferrer'));
    }
  }
  link(parent,label,callback){const button=this.host.element('button',label,null,parent);button.type='button';button.addEventListener('click',callback);}
}
