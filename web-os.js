// Infrastruct Professional browser operating systems. No privileged host access.
class RuntimeSystem {
  constructor(host, name) {
    this.host=host;this.name=name;
    this.registry={constructor:{instances:[this],functions:{},nested:{},events:[]}};
    this.windows=new Map();this.sequence=0;this.focused=null;
    this.register('open');this.register('close');this.register('focus');this.register('minimize');
  }
  register(name){this.registry[name]={instances:[],functions:{},nested:{},events:[]};}
  record(name,detail={}){this.registry[name]?.events.push(detail);this.host.audit('os_'+name,{system:this.name,...detail});}
  mount(root){this.root=root;root.dataset.system=this.name;this.record('focus',{mount:true});}
  unmount(){this.windows.forEach(w=>{if(w.popup)this.restorePop(w);w.disposeScroll?.();w.element.remove();});this.windows.clear();this.root=null;}
  createWindow(name,description){
    const id=++this.sequence,el=this.host.element('section',null,'os-window',this.root);
    el.setAttribute('role','dialog');el.setAttribute('aria-label',name);el.tabIndex=-1;
    const bar=this.host.element('div',null,'os-titlebar',el);
    this.host.element('strong',name.toUpperCase(),null,bar);
    const search=this.host.element('input',null,'os-window-search',bar);search.type='search';search.placeholder='Search as you type...';search.setAttribute('aria-label','Search within '+name+' window');search.autocomplete='off';
    const controls=this.host.element('div',null,'os-controls',bar);
    const content=this.host.element('div',null,'os-content',el);
    if((name==='Tools'||name==='Services')&&!this.host.freePlanSelected){this.host.audit('plan_entry_required',{service:name});name='Plans';el.setAttribute('aria-label','Plans');bar.querySelector('strong').textContent='PLANS';}
    this.navigateContent(content,name,description,false);
    const win={id,name,element:el,bar,controls,content,history:[],minimized:false,maximized:false};
    this.windows.set(id,win);this.installScopedSearch(win,search);this.host.barcodes?.attachWindow(win);this.installPopToggle(win);this.installScrollArrows(win);this.focus(id);this.animateWindow(el,'open');this.record('open',{id,name});return win;
  }
  scopedDestinations(win){
    const name=win.name;
    if(name==='Tools')return this.host.engineeringCatalog.groups.flatMap(group=>group.tools.map(([title,capabilities])=>({title,description:capabilities.slice(0,3).join(' · '),destination:'Tools',tool:title})));
    if(name==='Services')return [{title:'WHOIS Lookup',description:'Domain registration lookup',destination:'Services'},{title:'Encoders',description:'Encoding and decoding tools',destination:'Services'},{title:'Random Generator',description:'Identifiers and secure random values',destination:'Services'},{title:'DNS Providers',description:'DNS service directory',destination:'Services'},{title:'Web Hosting Providers',description:'Hosting service directory',destination:'Services'},{title:'Secure Shell Booth',description:'Shell interface',destination:'Services'},...['Inventory','Shop','Cart','Checkout'].map(title=>({title,description:'Commerce subsystem',destination:title}))];
    if(['Inventory','Shop','Cart','Checkout'].includes(name))return ['Inventory','Shop','Cart','Checkout'].map(title=>({title,description:'Commerce subsystem',destination:title}));
    if(name==='Plans')return ['Free','Starter','Professional','Enterprise'].map(title=>({title,description:'Subscription plan',destination:'Plans'}));
    return [];
  }
  installScopedSearch(win,input){
    const panel=this.host.element('div',null,'os-search-results',win.bar);
    panel.setAttribute('role','listbox');panel.setAttribute('aria-label','Window subsystem navigation');
    input.setAttribute('aria-controls','os-search-results-'+win.id);panel.id='os-search-results-'+win.id;
    input.setAttribute('aria-expanded','false');
    const dismiss=()=>{panel.classList.remove('is-visible');input.setAttribute('aria-expanded','false');};
    const update=()=>{
      const query=input.value.trim().toLocaleLowerCase();panel.replaceChildren();
      if(!query){dismiss();return;}
      const matches=this.scopedDestinations(win).filter(item=>(item.title+' '+item.description).toLocaleLowerCase().includes(query));
      for(const entry of matches){
        const button=this.host.element('button',null,'os-search-result',panel);button.type='button';button.setAttribute('role','option');
        this.host.element('strong',entry.title,null,button);this.host.element('small',entry.description,null,button);
        button.addEventListener('click',()=>{
          dismiss();input.value='';
          if(entry.tool)this.host.engineeringCatalogSelection=entry.tool;
          if(entry.destination!==win.name)this.navigateContent(win.content,entry.destination);
          else if(entry.tool){win.content.replaceChildren();this.host.infrastructure.render(win.content,'Tools');}
          else if(win.name==='Services'){
            const tabs=[...win.content.querySelectorAll('.workbench-service-tab')];tabs.find(tab=>tab.textContent.startsWith(entry.title))?.click();
          }else if(win.name==='Plans'){
            const cards=[...win.content.querySelectorAll('.plans-window-card')];cards.find(card=>card.querySelector('strong')?.textContent===entry.title)?.scrollIntoView({block:'nearest',behavior:'smooth'});
          }
          this.record('search_navigate',{scope:win.name,target:entry.title});
        });
      }
      if(!matches.length)this.host.element('p','No matching subsystems',null,panel);
      panel.classList.add('is-visible');input.setAttribute('aria-expanded','true');
    };
    input.addEventListener('input',update);
    input.addEventListener('keydown',event=>{if(event.key==='Escape'){input.value='';dismiss();input.blur();}else if(event.key==='ArrowDown'&&panel.classList.contains('is-visible')){event.preventDefault();panel.querySelector('button')?.focus();}else if(event.key==='Enter'){event.preventDefault();panel.querySelector('button')?.click();}});
    win.bar.addEventListener('keydown',event=>{if(event.key==='Escape')dismiss();});
    win.element.addEventListener('pointerdown',event=>{if(!input.contains(event.target)&&!panel.contains(event.target))dismiss();});
    win.refreshSearch=()=>{input.value='';dismiss();};
  }
  installPopToggle(win){
    const button=this.host.element('button','↗','os-pop-toggle',win.controls);
    button.type='button';button.title='Pop out into separate browser window';button.setAttribute('aria-label','Pop out '+win.name);
    button.addEventListener('click',()=>this.togglePop(win.id));win.popButton=button;
  }
  togglePop(id){
    const win=this.windows.get(id);if(!win)return;
    if(win.popup&&!win.popup.closed){this.restorePop(win);return;}
    const popup=window.open('','infrastruct-window-'+id,'popup=yes,width=950,height=720,resizable=yes,scrollbars=yes');
    if(!popup){this.host.audit('os_pop_blocked',{id});return;}
    const doc=popup.document;doc.title=win.name+' — Infrastruct Professional';
    for(const sheet of document.querySelectorAll('style,link[rel="stylesheet"]'))doc.head.appendChild(sheet.cloneNode(true));
    const style=doc.createElement('style');style.textContent='html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#102336;color:#eaf6ff}.os-window.os-popped{position:fixed!important;inset:0!important;top:0!important;left:0!important;width:100%!important;height:100%!important;min-width:0!important;max-width:none!important;max-height:none!important;resize:none!important;border-radius:0!important}.os-window.os-popped .os-titlebar{cursor:default}';doc.head.appendChild(style);
    win.returnParent=win.element.parentNode;win.returnNext=win.element.nextSibling;
    win.popup=popup;win.element.classList.add('os-popped');doc.body.appendChild(win.element);
    win.popButton.textContent='↙';win.popButton.title='Pop in to Web OS desktop';win.popButton.setAttribute('aria-label','Pop in '+win.name);
    const restore=()=>this.restorePop(win);popup.addEventListener('pagehide',restore,{once:true});win.popupRestore=restore;
    popup.focus();this.record('pop_out',{id});
  }
  restorePop(win){
    const popup=win.popup;if(!popup)return;
    win.popup=null;
    if(this.windows.has(win.id)&&win.returnParent){win.returnParent.insertBefore(win.element,win.returnNext?.parentNode===win.returnParent?win.returnNext:null);win.element.classList.remove('os-popped');win.popButton.textContent='↗';win.popButton.title='Pop out into separate browser window';win.popButton.setAttribute('aria-label','Pop out '+win.name);this.focus(win.id);}
    if(!popup.closed){popup.removeEventListener('pagehide',win.popupRestore);popup.close();}
    this.record('pop_in',{id:win.id});
  }
  installScrollArrows(win){
    const {element,content}=win;
    const arrows={};
    const update=()=>{
      if(!element.isConnected)return;
      const overflow=content.scrollHeight>content.clientHeight+3;
      arrows.up.classList.toggle('is-visible',overflow&&content.scrollTop>4);
      arrows.down.classList.toggle('is-visible',overflow&&content.scrollTop+content.clientHeight<content.scrollHeight-4);
    };
    for(const direction of ['up','down']){
      const button=this.host.element('button',null,'os-scroll-arrow os-scroll-'+direction,element);
      button.type='button';button.setAttribute('aria-label','Scroll '+direction);button.title='Scroll '+direction;
      button.addEventListener('click',()=>content.scrollBy({top:(direction==='up'?-1:1)*Math.max(100,content.clientHeight*.7),behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));
      arrows[direction]=button;
    }
    content.addEventListener('scroll',update,{passive:true});
    const observer=typeof ResizeObserver==='function'?new ResizeObserver(update):null;
    observer?.observe(content);observer?.observe(element);
    const changes=typeof MutationObserver==='function'?new MutationObserver(update):null;
    changes?.observe(content,{subtree:true,childList:true,characterData:true});
    win.disposeScroll=()=>{observer?.disconnect();changes?.disconnect();};
    requestAnimationFrame(update);
  }
  navigateContent(content,name,description='',track=true){
    if(!content?.isConnected)return;
    const win=[...this.windows.values()].find(w=>w.content===content);
    if(track&&win){win.history.push(win.name);}
    content.replaceChildren();
    if((name==='Tools'||name==='Services')&&!this.host.freePlanSelected)name='Plans';
    if(win){win.name=name;win.element.setAttribute('aria-label',name);win.bar.querySelector('strong').textContent=name.toUpperCase();win.refreshSearch?.();}
    if(win?.history.length){const back=this.host.element('button','← Back','os-content-back',content);back.type='button';back.addEventListener('click',()=>{const previous=win.history.pop();this.navigateContent(content,previous,'',false);});}
    if(['Inventory','Shop','Cart','Checkout'].includes(name))this.host.shop.render(content,name);
    else if(name==='Index')this.host.siteIndex.render(content);
    else if(name==='Plans')this.renderPlans(content);
    else if(name==='Tools'||name==='Services')this.host.infrastructure.render(content,name);
    else this.host.element('p',description,null,content);
    this.record('navigate',{name,withinWindow:true});
  }
  async renderPlans(content){
    const status=this.host.element('p','Loading subscription plans…','plans-status',content);
    try{
      const data=await this.host.siteAPI.plans();
      if(!content.isConnected)return;
      const identified=Boolean(this.host.account?.hasIdentity());
      status.textContent=identified?'Choose a plan. Free checkout totals €0.00 and never requests payment details. Paid plans are previews only.':'Sign in first to choose a plan. ChatGPT demo sign-in is available; it is not real authentication.';
      if(!identified){const signIn=this.host.element('button','Sign in / Sign up',null,content);signIn.type='button';signIn.addEventListener('click',()=>this.host.account.open('Sign in / Sign up'));}
      const grid=this.host.element('div',null,'plans-window-grid',content);
      for(const plan of data.plans){
        const card=this.host.element('article',null,'plans-window-card',grid);
        this.host.element('strong',plan.title,null,card);
        this.host.element('div',this.host.siteAPI.catalog.display(plan.monthlyCents)+' / month',null,card);
        this.host.element('small',plan.audience,null,card);
        const list=this.host.element('ul',null,null,card);
        for(const feature of plan.features)this.host.element('li',feature,null,list);
        if(plan.id==='free'){this.host.element('small','Total due: €0.00 · No card required · Browser-session access',null,card);this.host.element('small','Essential session cookies are used for sign-in and Free functionality. Optional cookies require a separate choice.',null,card);const button=this.host.element('button',identified?'Confirm Free · €0.00':'Sign in to select Free',null,card);button.type='button';button.addEventListener('click',()=>this.host.selectFreePlan(content));}
        else{this.host.element('small','Plan prepared · Billing and entitlements not active',null,card);const button=this.host.element('button','Preview '+plan.title,null,card);button.type='button';button.disabled=!identified;button.addEventListener('click',()=>{const note=card.querySelector('.plan-preview-note')||this.host.element('small','', 'plan-preview-note',card);note.textContent=plan.title+' is a preview. No charge, subscription or entitlement has been created.';this.host.audit('paid_plan_preview',{plan:plan.id,charged:false});});}
      }
    }catch(error){status.textContent='Plan catalogue is temporarily unavailable.';}
  }
  focus(id){const win=this.windows.get(id);if(!win)return;this.focused=id;win.minimized=false;win.element.hidden=false;win.element.style.zIndex=String(50+ ++this.sequence);this.record('focus',{id});}
  minimize(id){const win=this.windows.get(id);if(!win)return;win.minimized=true;win.element.hidden=true;this.record('minimize',{id});}
  animateWindow(element,direction){
    if(!element||typeof element.animate!=='function'||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return null;
    const opening=direction==='open';
    return element.animate(opening?
      [{opacity:0,transform:'translateY(20px) scale(.82)',filter:'blur(12px)',borderRadius:'36px'},{opacity:1,transform:'translateY(0) scale(1)',filter:'blur(0)',borderRadius:getComputedStyle(element).borderRadius}]:
      [{opacity:1,transform:'translateY(0) scale(1)',filter:'blur(0)'},{opacity:0,transform:'translateY(16px) scale(.78)',filter:'blur(12px)'}],
      {duration:opening?340:240,easing:opening?'cubic-bezier(.16,1,.3,1)':'cubic-bezier(.55,0,1,.45)',fill:'forwards'});
  }
  close(id){const win=this.windows.get(id);if(!win)return;if(win.popup)this.restorePop(win);win.disposeScroll?.();this.windows.delete(id);if(this.focused===id)this.focused=null;this.record('close',{id});
    const animation=this.animateWindow(win.element,'close');
    if(animation)animation.finished.then(()=>win.element.remove()).catch(()=>win.element.remove());
    else win.element.remove();
  }
  open(name,description){
    const target=(name==='Tools'||name==='Services')&&!this.host.freePlanSelected?'Plans':name;
    const existing=[...this.windows.values()].find(win=>win.name===target);
    if(existing){if(existing.popup&&!existing.popup.closed)existing.popup.focus();else this.focus(existing.id);this.record('reuse',{id:existing.id,name:target});return existing;}
    return this.createWindow(name,description);
  }
}
export class DesktopSystem extends RuntimeSystem {
  constructor(host){super(host,'desktop');this.register('maximize');this.register('move');this.register('resize');this.register('snap');}
  mount(root){super.mount(root);this.installStyles();}
  installStyles(){if(document.getElementById('infrastruct-os-style'))return;
    const style=this.host.element('style',null,null,document.head);style.id='infrastruct-os-style';
    style.textContent=`.dns-provider-service{margin-top:18px;padding:16px;border-radius:14px;background:#081a27e8}.dns-provider-service h3{font-size:23px;margin:0 0 8px}.dns-provider-service>label{display:grid;gap:5px}.dns-provider-service select{width:100%;padding:9px;border:1px solid #42616b;border-radius:8px;background:#07131f;color:#d6efdc}.dns-provider-service input{width:100%;padding:9px;border:1px solid #42616b;border-radius:8px;background:#07131f;color:#d6efdc}.dns-provider-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin:16px 0}.dns-provider-card{display:flex;flex-direction:column;gap:8px;background:#ffffff0c;padding:12px;border-radius:10px}.dns-provider-card strong{font-size:20px}.dns-provider-card small{color:#aabcc9}.dns-provider-card button{margin-top:auto}.dns-provider-status{color:#9be1a0;font-size:16px!important}.dns-provider-note{font-size:15px!important;color:#aabcc9}.workbench-services-menu{display:flex;flex-wrap:wrap;gap:10px;margin:18px 0 10px}.workbench-service-tab{padding:10px 16px;border:0;border-radius:10px;background:#ffffff13;font-size:19px}.workbench-service-tab[aria-pressed=true]{background:#5ecb5133;box-shadow:inset 0 0 0 1px #5ecb51}.workbench-services-workspace{min-height:60px}.random-generator-service{margin-top:18px;padding:16px;border-radius:14px;background:#081a27e8}.random-generator-service h3{font-size:23px;margin:0 0 8px}.random-generator-service p{font-size:16px!important}.random-generator-form{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin:14px 0}.random-generator-form label{display:grid;gap:5px}.random-generator-form input,.random-generator-form select,.random-generator-service textarea{width:100%;min-width:0;padding:9px;background:#07131f;color:#d6efdc;border:1px solid #42616b;border-radius:8px}.random-generator-form p{grid-column:1/-1}.random-generator-form button{align-self:end}.random-generator-service textarea{font:14px/1.5 monospace;resize:vertical}.random-generator-status{color:#aac2d2}.encoding-service{margin-top:18px;padding:16px;border-radius:14px;background:#081a27e8}.encoding-service h3{font-size:23px;margin:0 0 8px}.encoding-service p{font-size:16px!important}.encoding-service>label,.encoding-controls label{display:grid;gap:5px}.encoding-controls{display:grid;gap:10px;margin-top:12px}.encoding-controls input,.encoding-controls select,.encoding-service select,.encoding-controls textarea{width:100%;min-width:0;padding:8px;border:1px solid #42616b;border-radius:7px;background:#07131f;color:#d6efdc}.encoding-controls textarea{font:14px/1.4 monospace}.encoding-status{color:#9be1a0;margin-top:10px!important}.encoding-note{color:#aabcc9}.ssh-booth{margin-top:18px;padding:16px;border-radius:14px;background:#081a27e8}.ssh-booth h3{font-size:23px;margin:0 0 8px}.ssh-booth p{font-size:16px!important}.ssh-status{color:#ff9b8d;margin:12px 0;font-size:16px}.ssh-settings{display:grid;grid-template-columns:repeat(auto-fit,minmax(125px,1fr));gap:9px;margin:12px 0}.ssh-settings label{display:grid;gap:4px;font-size:15px}.ssh-settings input,.ssh-terminal-input input{min-width:0;width:100%;padding:8px;background:#07131f;color:#d6efdc;border:1px solid #42616b;border-radius:7px}.ssh-settings button{align-self:end}.ssh-terminal-output{height:175px;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere;background:#030b10;color:#9be1a0;padding:12px;border-radius:9px;font:14px/1.5 monospace}.ssh-terminal-input{display:flex;align-items:center;gap:8px}.ssh-terminal-input span{white-space:nowrap;color:#9be1a0}.ssh-terminal-input input{flex:1}.ssh-terminal-input button{white-space:nowrap}.ssh-disclaimer{margin-top:12px!important;color:#aabcc9}.workbench-form{display:grid;gap:14px;margin-top:16px}.workbench-form>label{display:grid;gap:5px}.workbench-form input:not([type=checkbox]),.workbench-form select{width:100%;padding:8px;background:#132d42;color:inherit;border:1px solid #ffffff33;border-radius:8px}.workbench-stages{display:grid;gap:10px}.workbench-stage,.workbench-service{background:#ffffff0b;border-radius:12px;padding:12px}.workbench-stage h3,.workbench-service h3{margin:0 0 4px;font-size:21px}.workbench-stage p,.workbench-service p{margin:0 0 8px!important}.workbench-check{display:flex;align-items:flex-start;gap:8px;margin:5px 0;font-size:15px}.workbench-check input{margin-top:4px}.workbench-progress{font-size:17px!important}.workbench-service-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px;margin:14px 0}.workbench-service ul{padding-left:17px}.workbench-service small{color:#a2d7b2}.workbench-sources{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}.workbench-sources a{color:#91c9ef}.workbench-intro{font-size:16px!important}.site-index-search{width:100%;padding:10px;border:1px solid #ffffff33;border-radius:8px;background:#0b2235;color:#fff}.site-index-results{display:grid;gap:7px;margin-top:12px}.site-index-entry{display:grid;gap:3px;width:100%;padding:10px;text-align:left;border:0;border-radius:9px;background:#ffffff10;color:#eaf6ff;cursor:pointer}.site-index-entry:hover{background:#ffffff25}.site-index-entry small{color:#a8c8db}.site-index-entry span{font-size:14px}.plans-window-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:14px}@container (max-width:850px){.plans-window-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@container (max-width:450px){.plans-window-grid{grid-template-columns:minmax(0,1fr)}}.plans-window-card{display:flex;flex-direction:column;gap:7px;padding:15px;border-radius:12px;background:#ffffff0d}.plans-window-card strong{font-size:22px}.plans-window-card small{color:#aac2d2}.plans-window-card ul{padding-left:16px;margin:5px 0;flex:1}.plans-window-card button:disabled{opacity:.5;cursor:not-allowed}.plans-status{font-size:16px!important}.os-window{position:fixed;top:14%;left:18%;width:min(620px,82vw);min-width:min(330px,96vw);min-height:220px;max-width:none;max-height:none;resize:none;overflow:hidden;display:flex;flex-direction:column;border:0;border-radius:16px;background:transparent;box-shadow:0 18px 60px #0009;color:#eaf6ff}.os-window[hidden]{display:none}.os-resize-handle{position:absolute;z-index:5;touch-action:none}.os-resize-n,.os-resize-s{height:8px;left:10px;right:10px;cursor:ns-resize}.os-resize-n{top:0}.os-resize-s{bottom:0}.os-resize-e,.os-resize-w{width:8px;top:10px;bottom:10px;cursor:ew-resize}.os-resize-e{right:0}.os-resize-w{left:0}.os-resize-ne,.os-resize-nw,.os-resize-se,.os-resize-sw{width:14px;height:14px}.os-resize-ne{top:0;right:0;cursor:nesw-resize}.os-resize-nw{top:0;left:0;cursor:nwse-resize}.os-resize-se{bottom:0;right:0;cursor:nwse-resize}.os-resize-sw{bottom:0;left:0;cursor:nesw-resize}.os-window.is-maximized .os-resize-handle,.os-window.os-popped .os-resize-handle{display:none}.os-titlebar{flex:0 0 auto;position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 12px;cursor:grab;touch-action:none;user-select:none;background:rgba(35,64,86,.6);backdrop-filter:blur(24px) saturate(160%);-webkit-backdrop-filter:blur(24px) saturate(160%);box-shadow:inset 0 1px rgba(255,255,255,.25),0 4px 18px rgba(0,0,0,.12)}.os-window-barcode{position:relative;display:inline-flex;align-items:center;flex:0 0 auto;width:100px;height:30px;padding:2px;background:transparent;border:0;border-radius:0;cursor:copy;opacity:.85;transition:opacity .2s ease}.os-window-barcode:hover{opacity:1}.os-window-barcode svg{display:block;width:100%;height:100%}.os-titlebar{overflow:visible!important}.os-search-results{position:absolute;top:calc(100% + 5px);left:25%;width:min(390px,70%);max-height:min(350px,50vh);overflow:auto;z-index:110;display:grid;gap:3px;padding:8px;border-radius:11px;background:rgba(16,35,52,.8);backdrop-filter:blur(16px);box-shadow:0 12px 34px #0008;opacity:0;visibility:hidden;pointer-events:none;transform:translateY(-10px) scale(.97);transform-origin:top center;transition:opacity .22s ease,transform .22s ease,visibility .22s}.os-search-results.is-visible{opacity:1;visibility:visible;pointer-events:auto;transform:translateY(0) scale(1)}.os-search-result{display:grid;gap:2px;text-align:left;padding:8px;border:0;border-radius:7px;background:transparent;color:#eaf6ff;cursor:pointer}.os-search-result:hover,.os-search-result:focus-visible{background:#ffffff24}.os-search-result small{font-size:11px;opacity:.75}.os-search-results p{margin:5px;font-size:12px}@media(prefers-reduced-motion:reduce){.os-search-results{transition:none}}.os-window-search{flex:1 1 140px;min-width:75px;max-width:240px;border:0;border-radius:7px;background:#ffffff12;color:#eaf6ff;padding:5px 9px;font:inherit;font-size:13px;outline:0}.os-window-search::placeholder{color:#c2d4df}.os-window-search:focus{box-shadow:inset 0 0 0 1px #b4d7e9}.os-search-hit{outline:1px solid #a3dfc4!important;background:#7ac4aa25!important;border-radius:3px}.shop-nav{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:12px}.shop-nav button,.shop-cart-line button,.shop-card button{padding:6px 10px;border:0;border-radius:7px;background:#ffffff20;color:inherit}.shop-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}.shop-card{display:grid;gap:8px;padding:12px;border-radius:9px;background:#ffffff10}.shop-card button:disabled{opacity:.5}.shop-cart-line{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px;border-bottom:1px solid #ffffff22}.os-titlebar>strong{margin-right:auto}.os-controls{display:flex;gap:5px}.os-controls button{border:0;background:#ffffff12;border-radius:7px;padding:2px 9px;min-width:28px}.os-content{background:linear-gradient(135deg,rgba(36,65,89,.88),rgba(12,27,43,.9));backdrop-filter:blur(24px) saturate(145%);-webkit-backdrop-filter:blur(24px) saturate(145%);padding:18px;container-type:inline-size;min-width:0;min-height:0;flex:1 1 auto;overflow:auto;overscroll-behavior:contain;scrollbar-width:none}.os-content::-webkit-scrollbar{display:none}.os-scroll-arrow{position:absolute;right:13px;z-index:3;width:26px;height:26px;display:grid;place-items:center;padding:0;border:0;border-radius:7px;background:rgba(215,235,255,.14);color:transparent;backdrop-filter:blur(12px);opacity:0;pointer-events:none;transform:rotate(0deg) scale(.55);transition:opacity .3s ease,transform .4s cubic-bezier(.2,1.4,.4,1),background .25s,border-radius .4s}.os-scroll-arrow.is-visible{opacity:.55;pointer-events:auto;transform:rotate(45deg) scale(.76);border-radius:5px}.os-scroll-arrow:hover,.os-scroll-arrow:focus-visible{opacity:.95;background:rgba(225,245,255,.32);transform:rotate(45deg) scale(1);border-radius:9px}.os-scroll-up{top:55px}.os-scroll-down{bottom:14px}@media(prefers-reduced-motion:reduce){.os-scroll-arrow{transition:none}}.os-content-back{margin-bottom:12px;padding:5px 12px}.os-content p{margin:0;font-size:14px}.os-window.is-maximized{inset:38px 0 0!important;width:auto!important;height:auto!important;max-height:none!important;resize:none;border-radius:0}.os-task-item{height:27px;border:0;padding:2px 11px;background:#ffffff15;border-radius:8px;font-size:11px}.os-mobile-nav{position:fixed;z-index:40;bottom:8px;left:50%;transform:translateX(-50%);display:flex;gap:10px;padding:5px 10px;border-radius:18px;background:#172c41c9;backdrop-filter:blur(18px)}.os-mobile-nav button{border:0;background:#ffffff10;min-width:52px;padding:4px 12px}.os-mobile-nav[hidden]{display:none}.os-recents{position:fixed;z-index:45;inset:38px 0 54px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:#07121ad9;backdrop-filter:blur(20px)}.os-recents[hidden]{display:none}.os-recent-card{width:min(370px,85vw);min-height:100px;transform:perspective(650px) rotateX(7deg);background:#1a3554;border:0;border-radius:16px;padding:18px;text-align:left;touch-action:pan-y}@media(prefers-reduced-motion:reduce){.os-window,.os-recent-card{transition:none}}`;
  }
  open(name,description){const prior=new Set(this.windows.keys());const win=super.open(name,description);if(prior.has(win.id))return win;const button=(label,fn)=>{const b=this.host.element('button',label,null,win.controls);b.type='button';b.addEventListener('click',fn);return b;};
    button('□',()=>this.maximize(win.id));button('×',()=>this.close(win.id));
    win.element.addEventListener('pointerdown',()=>this.focus(win.id));
    if(name==='Plans'){win.element.style.width='min(1160px,96vw)';win.element.style.left='max(2vw, calc((100vw - min(1160px,96vw))/2))';win.element.style.top='max(46px,8vh)';win.element.style.height='min(720px,84dvh)';}
    this.enableDrag(win);this.enableResize(win);this.addTaskButton(win);return win;
  }
  addTaskButton(win){const bar=this.host.taskbar;if(!bar)return;const b=this.host.element('button',win.name,'os-task-item',bar);win.taskButton=b;b.addEventListener('click',()=>win.minimized?this.focus(win.id):this.minimize(win.id));}
  minimize(id){super.minimize(id);}
  close(id){const win=this.windows.get(id);win?.taskButton?.remove();super.close(id);}
  maximize(id){const win=this.windows.get(id);if(!win)return;win.maximized=!win.maximized;win.element.classList.toggle('is-maximized',win.maximized);this.record('maximize',{id,maximized:win.maximized});}
  enableDrag(win){
    let drag=null;
    win.bar.addEventListener('pointerdown',e=>{
      if(e.button!==0||e.target.closest('button,input,select,textarea')||win.maximized||win.popup)return;
      const rect=win.element.getBoundingClientRect();drag={pointer:e.pointerId,x:e.clientX-rect.left,y:e.clientY-rect.top};
      win.bar.setPointerCapture(e.pointerId);this.focus(win.id);
    });
    win.bar.addEventListener('pointermove',e=>{
      if(!drag||drag.pointer!==e.pointerId)return;
      win.element.style.left=(e.clientX-drag.x)+'px';win.element.style.top=(e.clientY-drag.y)+'px';
    });
    const finish=e=>{if(!drag||drag.pointer!==e.pointerId)return;drag=null;this.record('move',{id:win.id});};
    win.bar.addEventListener('pointerup',finish);win.bar.addEventListener('pointercancel',finish);
  }
  enableResize(win){
    for(const edge of ['n','ne','e','se','s','sw','w','nw']){
      const handle=this.host.element('div',null,'os-resize-handle os-resize-'+edge,win.element);
      handle.setAttribute('aria-label','Resize '+edge);handle.addEventListener('pointerdown',event=>{
        if(event.button!==0||win.maximized||win.popup)return;
        event.preventDefault();event.stopPropagation();this.focus(win.id);
        const rect=win.element.getBoundingClientRect(),origin={x:event.clientX,y:event.clientY,left:rect.left,top:rect.top,width:rect.width,height:rect.height};
        handle.setPointerCapture(event.pointerId);
        const move=e=>{
          const dx=e.clientX-origin.x,dy=e.clientY-origin.y,minW=330,minH=220;
          let left=origin.left,top=origin.top,width=origin.width,height=origin.height;
          if(edge.includes('e'))width=Math.max(minW,origin.width+dx);
          if(edge.includes('s'))height=Math.max(minH,origin.height+dy);
          if(edge.includes('w')){width=Math.max(minW,origin.width-dx);left=origin.left+origin.width-width;}
          if(edge.includes('n')){height=Math.max(minH,origin.height-dy);top=origin.top+origin.height-height;}
          Object.assign(win.element.style,{left:left+'px',top:top+'px',width:width+'px',height:height+'px'});
        };
        const finish=()=>{handle.removeEventListener('pointermove',move);handle.removeEventListener('pointerup',finish);handle.removeEventListener('pointercancel',finish);this.record('resize',{id:win.id,edge});};
        handle.addEventListener('pointermove',move);handle.addEventListener('pointerup',finish);handle.addEventListener('pointercancel',finish);
      });
    }
  }

}
export class TabletSystem extends RuntimeSystem {
  constructor(host){super(host,'tablet');this.register('recents');}
  mount(root){super.mount(root);this.installMobile();}
  installMobile(){new DesktopSystem(this.host).installStyles();this.nav=this.host.element('nav',null,'os-mobile-nav',this.root);this.nav.setAttribute('aria-label','System navigation');
    for(const [label,fn] of [['‹',()=>this.back()],['○',()=>this.home()],['▢',()=>this.recents()]]){const b=this.host.element('button',label,null,this.nav);b.addEventListener('click',fn);}
    this.recentPanel=this.host.element('section',null,'os-recents',this.root);this.recentPanel.hidden=true;
  }
  open(name,description){this.recentPanel.hidden=true;this.windows.forEach(w=>w.element.hidden=true);const win=super.open(name,description);if(win.element.style.cssText)return win;win.element.style.cssText='inset:38px 0 54px;width:auto;max-height:none;border-radius:0';return win;}
  home(){this.windows.forEach(w=>w.element.hidden=true);this.recentPanel.hidden=true;this.record('minimize',{home:true});}
  dismissRecents(){if(this.recentPanel&&!this.recentPanel.hidden){this.recentPanel.hidden=true;this.record('recents',{dismissed:true});}}
  back(){if(!this.recentPanel.hidden){this.recentPanel.hidden=true;return;}this.home();}
  recents(){this.recentPanel.replaceChildren();if(this.windows.size===0){this.home();this.host.hide?.();this.record('recents',{count:0});return;}this.recentPanel.hidden=false;for(const win of [...this.windows.values()].reverse()){
    const card=this.host.element('button',win.name,'os-recent-card',this.recentPanel);let x=null;
    card.addEventListener('click',()=>{this.recentPanel.hidden=true;this.windows.forEach(w=>w.element.hidden=true);this.focus(win.id);});
    card.addEventListener('touchstart',e=>{x=e.changedTouches[0].clientX;},{passive:true});
    card.addEventListener('touchend',e=>{if(x!==null&&Math.abs(e.changedTouches[0].clientX-x)>70){this.close(win.id);if(this.windows.size===0){win.element.remove();this.home();this.host.hide?.();}else this.recents();}},{passive:true});
  }this.record('recents',{count:this.windows.size});}
  unmount(){this.nav?.remove();this.recentPanel?.remove();super.unmount();}
}
export class MobileSystem extends TabletSystem {
  constructor(host){super(host);this.name='mobile';}
}
export class WebOperatingSystem {
  constructor(host){this.host=host;this.registry={systems:{instances:[],functions:{},nested:{},events:[]}};this.systems={desktop:new DesktopSystem(host),tablet:new TabletSystem(host),mobile:new MobileSystem(host)};this.registry.systems.instances=Object.values(this.systems);this.active=null;}
  mount(mode,root){if(this.active)this.active.unmount();this.active=this.systems[mode]||this.systems.desktop;this.active.mount(root);this.host.audit('os_mount',{mode:this.active.name});}
  open(name){const descriptions={Workspace:'Infrastructure workspaces and projects.',Plans:'Subscription plans and entitlements.',Systems:'System management and runtime diagnostics.'};return this.active?.open(name,descriptions[name]||'Infrastructure application');}
}
