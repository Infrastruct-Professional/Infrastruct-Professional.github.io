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
    this.host.element('p',description,null,content);
    const win={id,name,element:el,bar,controls,minimized:false,maximized:false};
    this.windows.set(id,win);this.focus(id);this.record('open',{id,name});return win;
  }
  focus(id){const win=this.windows.get(id);if(!win)return;this.focused=id;win.minimized=false;win.element.hidden=false;win.element.style.zIndex=String(50+ ++this.sequence);this.record('focus',{id});}
  minimize(id){const win=this.windows.get(id);if(!win)return;win.minimized=true;win.element.hidden=true;this.record('minimize',{id});}
  close(id){const win=this.windows.get(id);if(!win)return;win.element.remove();this.windows.delete(id);if(this.focused===id)this.focused=null;this.record('close',{id});}
  open(name,description){return this.createWindow(name,description);}
}
export class DesktopSystem extends RuntimeSystem {
  constructor(host){super(host,'desktop');this.register('maximize');this.register('move');}
  mount(root){super.mount(root);this.installStyles();}
  installStyles(){if(document.getElementById('infrastruct-os-style'))return;
    const style=this.host.element('style',null,null,document.head);style.id='infrastruct-os-style';
    style.textContent=`.os-window{position:fixed;top:18%;left:22%;width:min(620px,82vw);max-height:72dvh;overflow:auto;border:0;border-radius:16px;background:linear-gradient(135deg,#244159eb,#0c1b2bf2);box-shadow:0 18px 60px #0009;backdrop-filter:blur(24px);color:#eaf6ff}.os-window[hidden]{display:none}.os-titlebar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 12px;cursor:grab;touch-action:none;user-select:none;background:#ffffff0b}.os-controls{display:flex;gap:5px}.os-controls button{border:0;background:#ffffff12;border-radius:7px;padding:2px 9px;min-width:28px}.os-content{padding:18px}.os-content p{margin:0;font-size:14px}.os-window.is-maximized{inset:38px 0 34px!important;width:auto!important;max-height:none!important;border-radius:0}.os-task-item{height:27px;border:0;padding:2px 11px;background:#ffffff15;border-radius:8px;font-size:11px}.os-mobile-nav{position:fixed;z-index:40;bottom:34px;left:50%;transform:translateX(-50%);display:flex;gap:10px;padding:5px 10px;border-radius:18px;background:#172c41c9;backdrop-filter:blur(18px)}.os-mobile-nav button{border:0;background:#ffffff10;min-width:52px;padding:4px 12px}.os-mobile-nav[hidden]{display:none}.os-recents{position:fixed;z-index:45;inset:38px 0 78px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:#07121ad9;backdrop-filter:blur(20px)}.os-recents[hidden]{display:none}.os-recent-card{width:min(370px,85vw);min-height:100px;transform:perspective(650px) rotateX(7deg);background:#1a3554;border:0;border-radius:16px;padding:18px;text-align:left;touch-action:pan-y}@media(prefers-reduced-motion:reduce){.os-window,.os-recent-card{transition:none}}`;
  }
  open(name,description){const win=super.open(name,description);const button=(label,fn)=>{const b=this.host.element('button',label,null,win.controls);b.type='button';b.addEventListener('click',fn);return b;};
    button('−',()=>this.minimize(win.id));button('□',()=>this.maximize(win.id));button('×',()=>this.close(win.id));
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
  open(name,description){this.recentPanel.hidden=true;this.windows.forEach(w=>w.element.hidden=true);const win=super.open(name,description);win.element.style.cssText='inset:38px 0 78px;width:auto;max-height:none;border-radius:0';return win;}
  home(){this.windows.forEach(w=>w.element.hidden=true);this.recentPanel.hidden=true;this.record('minimize',{home:true});}
  back(){if(!this.recentPanel.hidden){this.recentPanel.hidden=true;return;}this.home();}
  recents(){this.recentPanel.replaceChildren();this.recentPanel.hidden=false;for(const win of [...this.windows.values()].reverse()){
    const card=this.host.element('button',win.name,'os-recent-card',this.recentPanel);let x=null;
    card.addEventListener('click',()=>{this.recentPanel.hidden=true;this.windows.forEach(w=>w.element.hidden=true);this.focus(win.id);});
    card.addEventListener('touchstart',e=>{x=e.changedTouches[0].clientX;},{passive:true});
    card.addEventListener('touchend',e=>{if(x!==null&&Math.abs(e.changedTouches[0].clientX-x)>70){this.close(win.id);this.recents();}},{passive:true});
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
