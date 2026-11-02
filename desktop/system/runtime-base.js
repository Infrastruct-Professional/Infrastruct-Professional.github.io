/** Shared Web OS lifecycle and window application base. */
export class RuntimeSystem {
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
    this.windows.set(id,win);this.installScopedSearch(win,search);this.host.barcodes?.attachWindow(win);this.installScrollArrows(win);this.focus(id);this.animateWindow(el,'open');this.record('open',{id,name});return win;
  }
  scopedDestinations(win){
    const name=win.name;
    if(name==='Tools')return this.host.toolSystem.sections;
    if(name==='Services')return this.host.serviceSystem.sections;
    if(name==='Plans')return this.host.planSystem.sections;
    if(['Shop','Cart','Checkout'].includes(name))return this.host.serviceSystem.sections.filter(item=>['Shop','Cart','Checkout'].includes(item.title));
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
    if(name==='Dashboard')this.host.dashboardSystem.render(content);
    else if(['Shop','Cart','Checkout'].includes(name))this.host.shop.render(content,name);
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
