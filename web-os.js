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
  unmount(){this.windows.forEach(w=>w.element.remove());this.windows.clear();this.root=null;}
  createWindow(name,description){
    const id=++this.sequence,el=this.host.element('section',null,'os-window',this.root);
    el.setAttribute('role','dialog');el.setAttribute('aria-label',name);el.tabIndex=-1;
    const bar=this.host.element('div',null,'os-titlebar',el);
    this.host.element('strong',name,null,bar);
    const controls=this.host.element('div',null,'os-controls',bar);
    const content=this.host.element('div',null,'os-content',el);
    if((name==='Tools'||name==='Services')&&!this.host.freePlanSelected){this.host.audit('plan_entry_required',{service:name});name='Plans';el.setAttribute('aria-label','Plans');bar.querySelector('strong').textContent='Plans';}
    if(name==='Plans')this.renderPlans(content);
    else if(name==='Tools'||name==='Services')this.host.infrastructure.render(content,name);
    else this.host.element('p',description,null,content);
    const win={id,name,element:el,bar,controls,minimized:false,maximized:false};
    this.windows.set(id,win);this.focus(id);this.animateWindow(el,'open');this.record('open',{id,name});return win;
  }
  async renderPlans(content){
    const status=this.host.element('p','Loading subscription plans…','plans-status',content);
    try{
      const data=await this.host.siteAPI.plans();
      if(!content.isConnected)return;
      status.textContent='Select Free to enter the workspace. Paid subscriptions are not yet available.';
      const grid=this.host.element('div',null,'plans-window-grid',content);
      for(const plan of data.plans){
        const card=this.host.element('article',null,'plans-window-card',grid);
        this.host.element('strong',plan.title,null,card);
        this.host.element('div',this.host.siteAPI.catalog.display(plan.monthlyCents)+' / month',null,card);
        this.host.element('small',plan.audience,null,card);
        const list=this.host.element('ul',null,null,card);
        for(const feature of plan.features)this.host.element('li',feature,null,list);
        if(plan.id==='free'){this.host.element('small','Available now · No subscription required',null,card);const button=this.host.element('button','Enter Free plan',null,card);button.type='button';button.addEventListener('click',()=>this.host.selectFreePlan());}
        else{const button=this.host.element('button','Coming soon',null,card);button.disabled=true;}
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
  close(id){const win=this.windows.get(id);if(!win)return;this.windows.delete(id);if(this.focused===id)this.focused=null;this.record('close',{id});
    const animation=this.animateWindow(win.element,'close');
    if(animation)animation.finished.then(()=>win.element.remove()).catch(()=>win.element.remove());
    else win.element.remove();
  }
  open(name,description){return this.createWindow(name,description);}
}
export class DesktopSystem extends RuntimeSystem {
  constructor(host){super(host,'desktop');this.register('maximize');this.register('move');}
  mount(root){super.mount(root);this.installStyles();}
  installStyles(){if(document.getElementById('infrastruct-os-style'))return;
    const style=this.host.element('style',null,null,document.head);style.id='infrastruct-os-style';
    style.textContent=`.dns-provider-service{margin-top:18px;padding:16px;border-radius:14px;background:#081a27e8}.dns-provider-service h3{font-size:23px;margin:0 0 8px}.dns-provider-service>label{display:grid;gap:5px}.dns-provider-service select{width:100%;padding:9px;border:1px solid #42616b;border-radius:8px;background:#07131f;color:#d6efdc}.dns-provider-service input{width:100%;padding:9px;border:1px solid #42616b;border-radius:8px;background:#07131f;color:#d6efdc}.dns-provider-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin:16px 0}.dns-provider-card{display:flex;flex-direction:column;gap:8px;background:#ffffff0c;padding:12px;border-radius:10px}.dns-provider-card strong{font-size:20px}.dns-provider-card small{color:#aabcc9}.dns-provider-card button{margin-top:auto}.dns-provider-status{color:#9be1a0;font-size:16px!important}.dns-provider-note{font-size:15px!important;color:#aabcc9}.workbench-services-menu{display:flex;flex-wrap:wrap;gap:10px;margin:18px 0 10px}.workbench-service-tab{padding:10px 16px;border:0;border-radius:10px;background:#ffffff13;font-size:19px}.workbench-service-tab[aria-pressed=true]{background:#5ecb5133;box-shadow:inset 0 0 0 1px #5ecb51}.workbench-services-workspace{min-height:60px}.encoding-service{margin-top:18px;padding:16px;border-radius:14px;background:#081a27e8}.encoding-service h3{font-size:23px;margin:0 0 8px}.encoding-service p{font-size:16px!important}.encoding-service>label,.encoding-controls label{display:grid;gap:5px}.encoding-controls{display:grid;gap:10px;margin-top:12px}.encoding-controls input,.encoding-controls select,.encoding-service select,.encoding-controls textarea{width:100%;min-width:0;padding:8px;border:1px solid #42616b;border-radius:7px;background:#07131f;color:#d6efdc}.encoding-controls textarea{font:14px/1.4 monospace}.encoding-status{color:#9be1a0;margin-top:10px!important}.encoding-note{color:#aabcc9}.ssh-booth{margin-top:18px;padding:16px;border-radius:14px;background:#081a27e8}.ssh-booth h3{font-size:23px;margin:0 0 8px}.ssh-booth p{font-size:16px!important}.ssh-status{color:#ff9b8d;margin:12px 0;font-size:16px}.ssh-settings{display:grid;grid-template-columns:repeat(auto-fit,minmax(125px,1fr));gap:9px;margin:12px 0}.ssh-settings label{display:grid;gap:4px;font-size:15px}.ssh-settings input,.ssh-terminal-input input{min-width:0;width:100%;padding:8px;background:#07131f;color:#d6efdc;border:1px solid #42616b;border-radius:7px}.ssh-settings button{align-self:end}.ssh-terminal-output{height:175px;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere;background:#030b10;color:#9be1a0;padding:12px;border-radius:9px;font:14px/1.5 monospace}.ssh-terminal-input{display:flex;align-items:center;gap:8px}.ssh-terminal-input span{white-space:nowrap;color:#9be1a0}.ssh-terminal-input input{flex:1}.ssh-terminal-input button{white-space:nowrap}.ssh-disclaimer{margin-top:12px!important;color:#aabcc9}.workbench-form{display:grid;gap:14px;margin-top:16px}.workbench-form>label{display:grid;gap:5px}.workbench-form input:not([type=checkbox]),.workbench-form select{width:100%;padding:8px;background:#132d42;color:inherit;border:1px solid #ffffff33;border-radius:8px}.workbench-stages{display:grid;gap:10px}.workbench-stage,.workbench-service{background:#ffffff0b;border-radius:12px;padding:12px}.workbench-stage h3,.workbench-service h3{margin:0 0 4px;font-size:21px}.workbench-stage p,.workbench-service p{margin:0 0 8px!important}.workbench-check{display:flex;align-items:flex-start;gap:8px;margin:5px 0;font-size:15px}.workbench-check input{margin-top:4px}.workbench-progress{font-size:17px!important}.workbench-service-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px;margin:14px 0}.workbench-service ul{padding-left:17px}.workbench-service small{color:#a2d7b2}.workbench-sources{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}.workbench-sources a{color:#91c9ef}.workbench-intro{font-size:16px!important}.plans-window-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(155px,1fr));gap:12px;margin-top:14px}.plans-window-card{display:flex;flex-direction:column;gap:7px;padding:15px;border-radius:12px;background:#ffffff0d}.plans-window-card strong{font-size:22px}.plans-window-card small{color:#aac2d2}.plans-window-card ul{padding-left:16px;margin:5px 0;flex:1}.plans-window-card button:disabled{opacity:.5;cursor:not-allowed}.plans-status{font-size:16px!important}.os-window{position:fixed;top:18%;left:22%;width:min(620px,82vw);max-height:72dvh;overflow:auto;border:0;border-radius:16px;background:linear-gradient(135deg,rgba(36,65,89,.8),rgba(12,27,43,.8));box-shadow:0 18px 60px #0009;backdrop-filter:blur(24px) saturate(145%);-webkit-backdrop-filter:blur(24px) saturate(145%);color:#eaf6ff}.os-window[hidden]{display:none}.os-titlebar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 12px;cursor:grab;touch-action:none;user-select:none;background:linear-gradient(120deg,rgba(255,255,255,.22),rgba(255,255,255,.07));backdrop-filter:blur(24px) saturate(160%);-webkit-backdrop-filter:blur(24px) saturate(160%);box-shadow:inset 0 1px rgba(255,255,255,.25),0 4px 18px rgba(0,0,0,.12)}.os-controls{display:flex;gap:5px}.os-controls button{border:0;background:#ffffff12;border-radius:7px;padding:2px 9px;min-width:28px}.os-content{padding:18px}.os-content p{margin:0;font-size:14px}.os-window.is-maximized{inset:38px 0 0!important;width:auto!important;max-height:none!important;border-radius:0}.os-task-item{height:27px;border:0;padding:2px 11px;background:#ffffff15;border-radius:8px;font-size:11px}.os-mobile-nav{position:fixed;z-index:40;bottom:8px;left:50%;transform:translateX(-50%);display:flex;gap:10px;padding:5px 10px;border-radius:18px;background:#172c41c9;backdrop-filter:blur(18px)}.os-mobile-nav button{border:0;background:#ffffff10;min-width:52px;padding:4px 12px}.os-mobile-nav[hidden]{display:none}.os-recents{position:fixed;z-index:45;inset:38px 0 54px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:#07121ad9;backdrop-filter:blur(20px)}.os-recents[hidden]{display:none}.os-recent-card{width:min(370px,85vw);min-height:100px;transform:perspective(650px) rotateX(7deg);background:#1a3554;border:0;border-radius:16px;padding:18px;text-align:left;touch-action:pan-y}@media(prefers-reduced-motion:reduce){.os-window,.os-recent-card{transition:none}}`;
  }
  open(name,description){const win=super.open(name,description);const button=(label,fn)=>{const b=this.host.element('button',label,null,win.controls);b.type='button';b.addEventListener('click',fn);return b;};
    button('□',()=>this.maximize(win.id));button('×',()=>this.close(win.id));
    win.element.addEventListener('pointerdown',()=>this.focus(win.id));
    this.enableDrag(win);this.addTaskButton(win);return win;
  }
  addTaskButton(win){const bar=this.host.taskbar;if(!bar)return;const b=this.host.element('button',win.name,'os-task-item',bar);win.taskButton=b;b.addEventListener('click',()=>win.minimized?this.focus(win.id):this.minimize(win.id));}
  minimize(id){super.minimize(id);}
  close(id){const win=this.windows.get(id);win?.taskButton?.remove();super.close(id);}
  maximize(id){const win=this.windows.get(id);if(!win)return;win.maximized=!win.maximized;win.element.classList.toggle('is-maximized',win.maximized);this.record('maximize',{id,maximized:win.maximized});}
  enableDrag(win){let drag=null;win.bar.addEventListener('pointerdown',e=>{if(e.target.closest('button')||win.maximized)return;const r=win.element.getBoundingClientRect();drag={x:e.clientX-r.left,y:e.clientY-r.top};win.bar.setPointerCapture(e.pointerId);this.focus(win.id);});
    win.bar.addEventListener('pointermove',e=>{if(!drag)return;win.element.style.left=Math.max(0,Math.min(innerWidth-90,e.clientX-drag.x))+'px';win.element.style.top=Math.max(38,Math.min(innerHeight-70,e.clientY-drag.y))+'px';});
    const finish=()=>{if(drag){drag=null;this.record('move',{id:win.id});}};win.bar.addEventListener('pointerup',finish);win.bar.addEventListener('pointercancel',finish);
  }
}
export class TabletSystem extends RuntimeSystem {
  constructor(host){super(host,'tablet');this.register('recents');}
  mount(root){super.mount(root);this.installMobile();}
  installMobile(){new DesktopSystem(this.host).installStyles();this.nav=this.host.element('nav',null,'os-mobile-nav',this.root);this.nav.setAttribute('aria-label','System navigation');
    for(const [label,fn] of [['‹',()=>this.back()],['○',()=>this.home()],['▢',()=>this.recents()]]){const b=this.host.element('button',label,null,this.nav);b.addEventListener('click',fn);}
    this.recentPanel=this.host.element('section',null,'os-recents',this.root);this.recentPanel.hidden=true;
  }
  open(name,description){this.recentPanel.hidden=true;this.windows.forEach(w=>w.element.hidden=true);const win=super.open(name,description);win.element.style.cssText='inset:38px 0 54px;width:auto;max-height:none;border-radius:0';return win;}
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
