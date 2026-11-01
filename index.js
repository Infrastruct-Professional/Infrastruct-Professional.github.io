class InfrastructProfessional {
  constructor() {
    this.registry = {};
    this.register('constructor', { started: Date.now() });
    this.environment = this.detect();
    this.state = { active: 'Overview', menu: false, windows: [], events: [], analytics: null };
    this.lifecycle = { nextId: 1, roundTrips: 0, roundRobinCursor: 0, tasks: [], draining: false };
    this.register('lifecycle', this.lifecycle);
    this.register('state', this.state);
    this.render();
    this.audit('boot', { environment: this.environment });
    this.enqueue('health-check', () => this.audit('health_check', { mode: this.environment.mode }));
    this.startR();
    window.addEventListener('resize', () => this.onResize());
    window.addEventListener('pagehide', () => this.audit('pagehide'));
  }
  register(name, value) { return this.registry[name] = { value, functions: {}, nested: {}, events: [], instances: [] }; }
  enqueue(name, callback) {
    const task = { id: this.lifecycle.nextId++, name, callback, status: 'queued' };
    this.lifecycle.tasks.push(task);
    this.registry.lifecycle.instances.push({ id: task.id, name, status: 'queued' });
    queueMicrotask(() => this.drain());
    return task.id;
  }
  drain() {
    if(this.lifecycle.draining) return;
    this.lifecycle.draining = true;
    const pending = this.lifecycle.tasks.splice(0);
    pending.forEach(task => {
      try { task.status='running'; task.callback(); task.status='completed'; }
      catch(error) { task.status='failed'; this.audit('task_error',{name:task.name,message:String(error)}); }
      this.lifecycle.roundTrips++;
      this.lifecycle.roundRobinCursor=(this.lifecycle.roundRobinCursor+1)%Math.max(1,this.registry.lifecycle.instances.length);
      const record=this.registry.lifecycle.instances.find(x=>x.id===task.id);if(record)record.status=task.status;
    });
    this.lifecycle.draining = false;
    if(this.lifecycle.tasks.length)queueMicrotask(()=>this.drain());
  }
  detect() {
    const ua = navigator.userAgent;
    const tablet = /iPad|Tablet/i.test(ua) || (navigator.maxTouchPoints > 1 && innerWidth >= 700);
    const mobile = !tablet && (/Android|iPhone|Mobile/i.test(ua) || innerWidth < 650);
    const browser = /Firefox/i.test(ua) ? 'Firefox' : /Edg/i.test(ua) ? 'Edge' : /Chrome/i.test(ua) ? 'Chrome' : /Safari/i.test(ua) ? 'Safari' : 'Other';
    const os = /Windows/i.test(ua) ? 'Windows' : /Android/i.test(ua) ? 'Android' : /iPad|iPhone/i.test(ua) ? 'iOS' : /Mac/i.test(ua) ? 'macOS' : /Linux/i.test(ua) ? 'Linux' : 'Other';
    return { mode: mobile ? 'mobile' : tablet ? 'tablet' : 'desktop', browser, os, width: innerWidth, height: innerHeight };
  }
  element(tag, text, className, parent) { const e=document.createElement(tag); if(text!==null)e.textContent=text; if(className)e.className=className; if(parent)parent.append(e); return e; }
  style() {
    const s=this.element('style',null,null,document.head);
    s.textContent=`:root{font:15px/1.5 system-ui,Arial,sans-serif;color:#eaf6ff;background:#080f1a}*{box-sizing:border-box}body{margin:0;min-height:100dvh;background:radial-gradient(ellipse at 80% 10%,#16415b88,transparent 48%),#080f1a}button{font:inherit;cursor:pointer;color:inherit;border:1px solid #ffffff28;background:#ffffff0b;border-radius:12px;padding:9px 16px}button:hover{background:#43d3ff1e}header{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:18px clamp(18px,4vw,70px);border-bottom:1px solid #ffffff19;backdrop-filter:blur(15px)}.brand{font-size:13px;letter-spacing:.18em;font-weight:800}.brand b{color:#58d9ff}.status{font-size:12px;color:#89a9be}.actions{display:flex;gap:9px;align-items:center}.shell{min-height:calc(100dvh - 145px);padding:clamp(30px,7vw,90px);display:flex;align-items:center}.hero{max-width:1000px}.eyebrow{letter-spacing:.35em;text-transform:uppercase;color:#5ed7ff;font-size:12px}h1{font-size:clamp(45px,8vw,105px);letter-spacing:-.07em;line-height:1.02;margin:20px 0}h1 span{color:#5bd8ff}p{color:#a4bed0;font-size:clamp(16px,1.9vw,20px);max-width:650px}.tiles{display:flex;flex-wrap:wrap;gap:12px;margin-top:35px}.tile{min-width:145px;text-align:left}.window{position:fixed;top:18%;left:20%;width:min(600px,88vw);max-height:65vh;overflow:auto;border:1px solid #ffffff25;border-radius:18px;background:#102032ed;box-shadow:0 25px 100px #000a;backdrop-filter:blur(24px);z-index:10}.windowbar{display:flex;justify-content:space-between;align-items:center;padding:13px 18px;border-bottom:1px solid #ffffff22}.windowbody{padding:22px}.windowbody pre{white-space:pre-wrap;word-break:break-word;font-size:12px;color:#a5d3e8}.windowbar button{padding:2px 9px}footer{display:flex;justify-content:space-between;gap:15px;flex-wrap:wrap;padding:15px clamp(18px,4vw,70px);font-size:12px;color:#86a3b6;border-top:1px solid #ffffff19}.navmobile{display:none}.appcards{display:grid;gap:12px}.appcard{width:100%;padding:20px;text-align:left;touch-action:pan-y;background:#1a3554;border:1px solid #ffffff30;border-radius:16px}.appcard small{display:block;color:#8ebbd4}.muted{color:#86a3b6}@media(max-width:760px){header{padding:15px}.status{display:none}.shell{min-height:calc(100dvh - 175px);padding:32px 23px}.window{left:4vw;top:12vh;width:92vw;max-height:70vh}.navmobile{display:flex;position:fixed;bottom:0;width:100%;justify-content:space-around;padding:10px;background:#0c1b2bf5;z-index:20}.navmobile button{border:0;background:transparent;font-size:21px}footer{padding-bottom:70px}.brand{letter-spacing:.09em;font-size:12px}}`;
  }
  render() {
    this.style();
    this.root=this.element('div',null,'app',document.body);
    const header=this.element('header',null,null,this.root);
    const brand=this.element('div',null,'brand',header);brand.append('⬡ INFRASTRUCT ',this.element('b','PROFESSIONAL'));
    const actions=this.element('div',null,'actions',header);
    this.element('span',`${this.environment.os} · ${this.environment.browser} · ${this.environment.mode}`,'status',actions);
    this.action(actions,'System',()=>this.open('System'));
    this.action(actions,'Audit',()=>this.open('Audit'));
    const main=this.element('main',null,'shell',this.root);const hero=this.element('section',null,'hero',main);
    this.element('div','INFRASTRUCTURE / ENGINEERING / TECHNOLOGY','eyebrow',hero);
    const h=this.element('h1',null,null,hero);h.append('Infrastructure ',this.element('span','designed for what comes next.'));
    this.element('p','A modular foundation for professional systems, digital services, and technological operations. Browser-native by design, with JavaScript execution and R-powered analysis.',null,hero);
    const tiles=this.element('div',null,'tiles',hero);
    for(const name of ['Overview','Architecture','Runtime','Audit']) this.action(tiles,name,()=>this.open(name),'tile');
    const footer=this.element('footer',null,null,this.root);
    this.element('span','© '+new Date().getFullYear()+' Infrastruct Professional',null,footer);
    this.runtimeLabel=this.element('span','JS runtime ready · R initializing','muted',footer);
    if(this.environment.mode!=='desktop') {
      const nav=this.element('nav',null,'navmobile',this.root);
      this.action(nav,'‹',()=>this.back());this.action(nav,'○',()=>this.hide());this.action(nav,'▢',()=>this.appSwitcher());
    }
  }
  action(parent,label,callback,cls) {const b=this.element('button',label,cls,parent);b.addEventListener('click',()=>{this.audit('action',{label});callback();});return b;}
  open(name) {
    this.close();
    this.state.windows = this.state.windows.filter(x=>x!==name);
    this.state.windows.push(name);const w=this.element('section',null,'window',this.root);w.setAttribute('role','dialog');w.setAttribute('aria-label',name);this.window=w;
    const bar=this.element('div',null,'windowbar',w);this.element('strong',name,null,bar);if(this.environment.mode==='desktop')this.action(bar,'×',()=>this.close());
    const body=this.element('div',null,'windowbody',w);
    const descriptions={Overview:'Infrastruct Professional is a modular technology and infrastructure organization.',Architecture:'index.html → index.js. JavaScript generates HTML and CSS at runtime. index.R is loaded into webR for browser-side auditing and statistics. All functional components belong to class registries.',Runtime:'Environment detection, class registries, session state and modular UI lifecycle are active.',System:'Client runtime and device environment.',Audit:'Session event registry and statistical analysis.',Applications:'Open application cards and navigation context.'};
    this.element('p',descriptions[name]||'',null,body);
    if(name==='Runtime')this.element('p',`Completed round trips: ${this.lifecycle.roundTrips} · Registered instances: ${this.registry.lifecycle.instances.length}`,null,body);
    if(name==='Audit'||name==='Runtime'||name==='System')this.element('pre',JSON.stringify(name==='Audit'?{events:this.state.events,analytics:this.state.analytics}:name==='System'?this.environment:this.registry,null,2),null,body);
    this.audit('window_open',{name});
  }
  close(){if(this.window){this.window.remove();this.window=null;}}
  appSwitcher(){
    this.close();const w=this.element('section',null,'window',this.root);this.window=w;w.setAttribute('aria-label','Open applications');
    const bar=this.element('div',null,'windowbar',w);this.element('strong','Open applications',null,bar);
    const cards=this.element('div',null,'windowbody appcards',w);
    const names=[...this.state.windows];
    if(!names.length)this.element('p','No applications are open.',null,cards);
    names.forEach(name=>{
      const card=this.action(cards,name,()=>this.open(name),'appcard');
      this.element('small','Tap to reopen · swipe horizontally to close',null,card);
      let start=0;card.addEventListener('touchstart',e=>{start=e.changedTouches[0].clientX},{passive:true});
      card.addEventListener('touchend',e=>{if(Math.abs(e.changedTouches[0].clientX-start)>75){this.state.windows=this.state.windows.filter(x=>x!==name);this.audit('application_swiped',{name});this.appSwitcher();}},{passive:true});
    });
  }
  back(){this.close();}
  hide(){this.close();}
  onResize(){const previous=this.environment.mode;this.environment=this.detect();this.audit('resize',{width:innerWidth,height:innerHeight});if(previous!==this.environment.mode){this.root.remove();this.close();this.render();}}
  audit(type,detail={}) {if(!this.state)return;this.state.events.push({type,time:new Date().toISOString(),detail});if(this.state.events.length>300)this.state.events.shift();this.analyze();}
  async startR(){
    try{
      const {WebR}=await import('https://webr.r-wasm.org/latest/webr.mjs');
      this.webr=new WebR();await this.webr.init();
      const code=await (await fetch('./index.R')).text();await this.webr.evalRVoid(code);
      this.runtimeLabel.textContent='JS runtime ready · webR active';this.audit('webr_ready');
    }catch(error){this.runtimeLabel.textContent='JS runtime ready · webR unavailable';this.audit('webr_unavailable',{message:String(error)});}
  }
  async analyze(){
    if(!this.webr){return;}
    if(this.analysisPending){this.analysisQueued=true;return;}
    this.analysisPending=true;
    try{
      const types=this.state.events.map(e=>e.type);
      const r=await this.webr.evalR(`as.list(table(c(${types.map(t=>JSON.stringify(t)).join(',')})))`);
      this.state.analytics=await r.toJs();
    }catch(e){this.state.analytics={error:String(e)};}finally{this.analysisPending=false;if(this.analysisQueued){this.analysisQueued=false;queueMicrotask(()=>this.analyze());}}
  }
}
new InfrastructProfessional();
