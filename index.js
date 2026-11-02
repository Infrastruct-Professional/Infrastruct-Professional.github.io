import { WebOSVersion } from './web-os-version.js';
import { BarcodeSystem } from './barcode-system.js';
import { EngineeringToolCatalog } from './engineering-tool-catalog.js';
import { SiteIndex } from './site-index.js';
import { WhoisLookupService } from './whois-lookup-service.js';
import { EncryptedPlanStorage } from './encrypted-plan-storage.js';
import { HostingProviderService } from './hosting-provider-service.js';
import { DNSProviderService } from './dns-provider-service.js';
import { EncodingService } from './encoding-service.js';
import { RandomGeneratorService } from './random-generator-service.js';
import { SecureShellBooth } from './secure-shell-booth.js';
import { InfrastructureWorkbench } from './infrastructure-workbench.js';
import { AccountSystem } from './account-system.js';
import { SiteAPI } from './site-api.js';
import { CookieSystem } from './cookie-system.js';
import { PublicIPSystem } from './public-ip.js';
import { WebOperatingSystem } from './web-os.js';
import { SubscriptionProfile } from './subscription-profile.js';
import { RemoteExecutionAdapter } from './remote-adapter.js';
import { RuntimeOrchestrator } from './orchestrator.js';
import { ShopifyCommerce } from './commerce.js';
import { ServiceWorkbench } from './service.js';
class InfrastructProfessional {
  constructor() {
    this.registry = {};
    this.register('constructor', { started: Date.now() });
    this.environment = this.detect();
    this.webOSVersion=new WebOSVersion();
    this.barcodes=new BarcodeSystem(this);
    this.engineeringCatalog=new EngineeringToolCatalog(this);
    this.frontPageMinimal=true;
    this.account=new AccountSystem(this);
    this.freePlanSelected=false;
    this.planStorage=new EncryptedPlanStorage(this);
    this.hostingProviders=new HostingProviderService(this);
    this.dnsProviders=new DNSProviderService(this);
    this.whois=new WhoisLookupService(this);
    this.encoding=new EncodingService(this);
    this.randomGenerator=new RandomGeneratorService(this);
    this.shellBooth=new SecureShellBooth(this);
    this.infrastructure=new InfrastructureWorkbench(this);
    this.siteIndex=new SiteIndex(this);
    this.siteAPI=new SiteAPI(this);
    this.cookies=new CookieSystem(this);
    this.initialPlansOpened=false;
    this.state = { active: 'Overview', menu: false, windows: [], events: [], analytics: null, foreground:null, recent:false, history:[] };
    this.lifecycle = { nextId: 1, roundTrips: 0, roundRobinCursor: 0, tasks: [], draining: false };
    this.register('lifecycle', this.lifecycle);
    this.register('state', this.state);
    this.remote=new RemoteExecutionAdapter(this);
    this.register('remote',this.remote.registry);
    this.orchestrator=new RuntimeOrchestrator(this);
    this.register('orchestrator',this.orchestrator.registry);
    this.services=new ServiceWorkbench(this);
    this.commerce=new ShopifyCommerce(this);
    this.profile=new SubscriptionProfile(this);
    this.register('subscriptionProfile',this.profile.registry);
    this.register('commerce',this.commerce.registry);
    this.register('services',this.services.registry);
    this.publicIP=new PublicIPSystem(this);
    this.register('publicIP',this.publicIP.registry);
    this.webOS=new WebOperatingSystem(this);
    this.register('webOS',this.webOS.registry);
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
    const touchDevice=/Android|iPad|iPhone|Mobile/i.test(ua)||(navigator.maxTouchPoints>1&&/Macintosh/i.test(ua));
    const tablet=touchDevice&&innerWidth>=600&&innerHeight>=480;
    const mobile=touchDevice&&!tablet;
    const browser = /Firefox/i.test(ua) ? 'Firefox' : /Edg/i.test(ua) ? 'Edge' : /Chrome/i.test(ua) ? 'Chrome' : /Safari/i.test(ua) ? 'Safari' : 'Other';
    const os = /Windows/i.test(ua) ? 'Windows' : /Android/i.test(ua) ? 'Android' : /iPad|iPhone/i.test(ua) ? 'iOS' : /Mac/i.test(ua) ? 'macOS' : /Linux/i.test(ua) ? 'Linux' : 'Other';
    return { mode: mobile ? 'mobile' : tablet ? 'tablet' : 'desktop', browser, os, width: innerWidth, height: innerHeight };
  }
  element(tag, text, className, parent) { const e=document.createElement(tag); if(text!==null)e.textContent=text; if(className)e.className=className; if(parent)parent.append(e); return e; }
  style() {
    const s=this.styleNode||(this.styleNode=this.element('style',null,null,document.head));
    s.textContent=`@import url('https://fonts.googleapis.com/css2?family=Smooch+Sans:wght@400;500;600;700;800&display=swap');
:root{font:17px/1.5 'Smooch Sans',sans-serif;color:#eaf6ff;background:#080f1a}*{box-sizing:border-box}body{margin:0;min-height:100dvh;background:radial-gradient(ellipse at 80% 10%,#16415b88,transparent 48%),#080f1a}button{font:inherit;cursor:pointer;color:inherit;border:1px solid #ffffff28;background:#ffffff0b;border-radius:12px;padding:9px 16px}button:hover{background:#43d3ff1e}header{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:18px clamp(18px,4vw,70px);border-bottom:1px solid #ffffff19;backdrop-filter:blur(15px)}.brand{font-size:13px;letter-spacing:.18em;font-weight:800}.brand b{color:#58d9ff}.status{font-size:12px;color:#89a9be}.actions{display:flex;gap:9px;align-items:center}.shell{min-height:calc(100dvh - 145px);padding:clamp(30px,7vw,90px);display:flex;align-items:center}.hero{max-width:1000px}.eyebrow{letter-spacing:.35em;text-transform:uppercase;color:#5ed7ff;font-size:12px}h1{font-size:clamp(45px,8vw,105px);letter-spacing:-.07em;line-height:1.02;margin:20px 0}h1 span{color:#5bd8ff}p{color:#a4bed0;font-size:clamp(16px,1.9vw,20px);max-width:650px}.tiles{display:flex;flex-wrap:wrap;gap:12px;margin-top:35px}.tile{min-width:145px;text-align:left}.window{position:fixed;top:18%;left:20%;width:min(600px,88vw);max-height:65vh;overflow:auto;border:1px solid #ffffff25;border-radius:18px;background:#102032ed;box-shadow:0 25px 100px #000a;backdrop-filter:blur(24px);z-index:10}.windowbar{display:flex;justify-content:space-between;align-items:center;padding:13px 18px;border-bottom:1px solid #ffffff22}.windowbody{padding:22px}.windowbody pre{white-space:pre-wrap;word-break:break-word;font-size:12px;color:#a5d3e8}.windowbar button{padding:2px 9px}footer{display:flex;justify-content:space-between;gap:15px;flex-wrap:wrap;padding:15px clamp(18px,4vw,70px);font-size:12px;color:#86a3b6;border-top:1px solid #ffffff19}.navmobile{display:none}.appcards{display:grid;gap:12px}.appcard{width:100%;padding:20px;text-align:left;touch-action:pan-y;background:#1a3554;border:1px solid #ffffff30;border-radius:16px}.appcard small{display:block;color:#8ebbd4}.muted{color:#86a3b6}@media(max-width:760px){header{padding:15px}.status{display:none}.shell{min-height:calc(100dvh - 175px);padding:32px 23px}.window{left:4vw;top:12vh;width:92vw;max-height:70vh}.navmobile{display:flex;position:fixed;bottom:0;width:100%;justify-content:space-around;padding:10px;background:#0c1b2bf5;z-index:20}.navmobile button{border:0;background:transparent;font-size:21px}footer{padding-bottom:70px}.brand{letter-spacing:.09em;font-size:12px}}
/* Adaptive Android-inspired controls apply only when the mobile navigation exists. */
body:has(.navmobile) .navmobile{display:flex;position:fixed;z-index:30;bottom:0;left:0;right:0;height:calc(60px + env(safe-area-inset-bottom));padding:4px 10px env(safe-area-inset-bottom);align-items:center;justify-content:space-around;background:#0b1a2bef;backdrop-filter:blur(20px);border-top:1px solid #ffffff24}
body:has(.navmobile) .navmobile button{border:0;background:transparent;min-height:44px;min-width:54px;font-size:25px}
body:has(.navmobile) .mobile-application{inset:60px 0 calc(60px + env(safe-area-inset-bottom));width:auto;max-height:none;overflow:auto;border:0;border-radius:0;box-shadow:none;background:#0c192af7}
body:has(.navmobile) .mobile-application .windowbody{padding:24px;max-width:1050px;margin:auto}
body:has(.navmobile) .recent-screen .appcards{display:flex;flex-direction:column;align-items:center;perspective:900px;gap:14px}
body:has(.navmobile) .recent-screen .appcard{width:min(96%,480px);min-height:120px;transform:rotateX(3deg);box-shadow:0 16px 40px #0008;transition:transform .2s}
body:has(.navmobile) .recent-screen .appcard:active{transform:scale(.96)}
@media(min-width:600px){body:has(.navmobile) .navmobile{top:60px;bottom:0;right:auto;width:76px;height:auto;flex-direction:column;justify-content:center;gap:20px;padding:12px 5px;border-top:0;border-right:1px solid #ffffff24}body:has(.navmobile) .mobile-application{inset:60px 0 0 76px}body:has(.navmobile) .recent-screen .appcards{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));max-width:900px;margin:auto}body:has(.navmobile) .shell,body:has(.navmobile) footer{margin-left:76px}}

.service-workbench{padding:32px clamp(18px,5vw,70px);border-top:1px solid #ffffff20;max-width:1300px;margin:auto}.service-workbench h2{font-size:clamp(26px,4vw,42px);margin:10px 0}.service-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(215px,1fr));gap:12px;margin:25px 0}.service-card{display:flex;flex-direction:column;align-items:flex-start;gap:9px;text-align:left;min-height:170px;padding:22px;background:#11253a;border:1px solid #ffffff25;transition:transform .15s,background .15s}.service-card:hover{transform:translateY(-2px);background:#18334e}.service-card small{color:#a5c4d6}.service-icon{color:#5bd8ff;display:inline-flex}.service-icon svg{display:block}.service-workspace{max-width:720px;margin-top:22px}.service-workspace form{display:grid;gap:15px}.service-workspace label{display:grid;gap:6px}.service-workspace input,.service-workspace textarea{width:100%;font:inherit;color:inherit;background:#0b1b2b;border:1px solid #64859a;border-radius:10px;padding:12px}.service-workspace input:focus-visible,.service-workspace textarea:focus-visible,.service-card:focus-visible{outline:3px solid #62d8ff;outline-offset:2px}.session-exit{margin-top:8px}.export-plan{margin-top:15px;background:#174b64}@media(prefers-reduced-motion:reduce){.service-card{transition:none}.service-card:hover{transform:none}}

.subscription-profile{max-width:1300px;margin:auto;padding:24px clamp(18px,5vw,70px) 48px;border-top:1px solid #ffffff20}.subscription-details{display:grid;gap:8px}.commerce-section{max-width:1300px;margin:auto;padding:24px clamp(18px,5vw,70px) 48px;border-top:1px solid #ffffff20}.commerce-section h2{margin:8px 0}.commerce-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px;margin-top:18px}.commerce-card{display:flex;flex-direction:column;align-items:flex-start;gap:9px;background:#102438;border:1px solid #ffffff25;border-radius:12px;padding:18px}.commerce-card small,.commerce-status{color:#b0c7d7}.plan-features{padding-left:18px;line-height:1.65}.commerce-card button:disabled{opacity:.55;cursor:not-allowed}.execution-approval{border-top:1px solid #ffffff25;margin-top:24px;padding-top:15px}.execution-review{display:grid;gap:12px;margin-top:12px}.execution-review pre{white-space:pre-wrap;overflow-wrap:anywhere}.execution-review label{display:flex;gap:10px;align-items:center}.execution-review input{width:auto}.execution-review button{justify-self:start}.execution-approval button:disabled{opacity:.45;cursor:not-allowed}.minimal-banner{height:38px;min-height:38px;padding:3px clamp(12px,2vw,28px);border:0;background:linear-gradient(115deg,rgba(255,255,255,.12),rgba(23,47,69,.28));backdrop-filter:blur(22px) saturate(155%);-webkit-backdrop-filter:blur(22px) saturate(155%);box-shadow:inset 0 1px rgba(255,255,255,.13)}.minimal-main{min-height:calc(100dvh - 38px)}.minimal-footer{position:fixed;bottom:0;left:0;right:0;z-index:25;height:34px;min-height:34px;padding:3px clamp(12px,2vw,28px);align-items:center;background:#0b1828d9;backdrop-filter:blur(15px);border-top:1px solid #ffffff19}.runtime-internal{display:none!important}.minimal-main{display:flex;align-items:center;justify-content:center;padding:clamp(20px,5vw,70px);min-height:calc(100dvh - 38px)}.center-logo{display:block;width:min(100%,1000px);height:auto;max-height:65dvh;object-fit:contain}
.infrastruct-start{height:27px;padding:2px 13px;border:0;border-radius:8px;font-size:11px;font-weight:800;letter-spacing:.11em;background:linear-gradient(145deg,#ffffff2b,#ffffff0b);box-shadow:inset 0 1px #ffffff35,0 3px 12px #0003;backdrop-filter:blur(20px) saturate(155%);-webkit-backdrop-filter:blur(20px) saturate(155%);transition:background .2s ease,box-shadow .2s ease}
.infrastruct-start[aria-expanded=true]{background:linear-gradient(145deg,#75d8ff3b,#ffffff14);box-shadow:inset 0 1px #ffffff50,0 4px 18px #0004}
.infrastruct-menu{position:fixed;left:12px;bottom:43px;z-index:35;width:min(350px,calc(100vw - 24px));padding:20px;display:flex;flex-direction:column;gap:8px;transform-origin:18% 100%;transform:translateY(14px) scale(.78);opacity:0;visibility:hidden;pointer-events:none;border:0;border-radius:20px 20px 20px 8px;background:linear-gradient(135deg,#1e3a52d9,#0b1826e8);box-shadow:0 20px 65px #0009,inset 0 1px #ffffff35;backdrop-filter:blur(26px) saturate(150%);transition:transform .28s cubic-bezier(.2,1.2,.3,1),opacity .22s ease,visibility .28s,border-radius .28s}
.infrastruct-menu.is-open{transform:translateY(0) scale(1);opacity:1;visibility:visible;pointer-events:auto;border-radius:20px}
.infrastruct-menu-title{font-size:15px;letter-spacing:.16em}.infrastruct-menu-subtitle{font-size:12px;margin:0 0 8px;color:#b5d0df}
.infrastruct-menu-item{display:flex;flex-direction:column;align-items:flex-start;gap:1px;padding:10px 12px;text-align:left;border:0;border-radius:11px;background:#ffffff0b;box-shadow:none;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}.infrastruct-menu-item small{font-size:11px;color:#9bb9cb}
.brand-glass-button{box-sizing:border-box;flex:0 0 30px;width:30px;height:30px;min-width:30px;min-height:30px;display:grid;place-items:center;overflow:hidden;padding:3px;border:0;border-radius:50%;background:linear-gradient(145deg,#ffffff25,#ffffff08);box-shadow:inset 0 1px #ffffff36;backdrop-filter:blur(18px) saturate(150%);-webkit-backdrop-filter:blur(18px) saturate(150%);transition:transform .25s cubic-bezier(.2,1.2,.3,1),background .2s,box-shadow .2s;cursor:pointer}.brand-glass-button img{display:block;width:24px;height:24px;max-width:100%;max-height:100%;object-fit:contain}.brand-glass-button[aria-expanded=true]{transform:scale(1);background:#ffffff30;box-shadow:inset 0 1px #ffffff55,0 3px 14px #0004}.brand-corner-menu{position:fixed;top:44px;left:12px;z-index:40;width:min(240px,calc(100vw - 24px));padding:10px;visibility:hidden;pointer-events:none;opacity:0;transform:translateY(-13px) scale(.72);transform-origin:17px 0;border:0;border-radius:6px 18px 18px 18px;background:linear-gradient(140deg,rgba(45,77,101,.8),rgba(10,28,44,.8));box-shadow:0 18px 45px #0007,inset 0 1px #ffffff27;backdrop-filter:blur(26px) saturate(160%);-webkit-backdrop-filter:blur(26px) saturate(160%);transition:opacity .23s ease,transform .3s cubic-bezier(.2,1.2,.3,1),visibility .3s}.brand-corner-menu.is-open{visibility:visible;pointer-events:auto;opacity:1;transform:translateY(0) scale(1);border-radius:16px}.brand-menu-item{display:block;width:100%;padding:12px 14px;text-align:left;border:0;border-radius:10px;background:#ffffff0c;backdrop-filter:blur(12px);font-weight:600}.brand-menu-item:hover{background:#ffffff22}@media(prefers-reduced-motion:reduce){.infrastruct-menu,.brand-corner-menu,.brand-glass-button{transition:none}}
html,body,button,input,select,textarea{font-family:'Smooch Sans',sans-serif!important}
.app,.app *{font-family:'Smooch Sans',sans-serif}
.account-menu-actions{display:flex;gap:8px;margin-top:8px}.account-menu-actions .brand-menu-item{flex:1;text-align:center;padding:9px 6px}.account-dialog{position:fixed;z-index:110;top:50%;left:50%;transform:translate(-50%,-50%);width:min(420px,calc(100vw - 28px));padding:20px;border-radius:18px;background:#18334beF;box-shadow:0 20px 65px #000b;backdrop-filter:blur(24px)}.account-dialog-header{display:flex;align-items:center;justify-content:space-between}.account-dialog-header strong{font-size:25px}.account-dialog-header button{border:0;padding:2px 10px}.account-dialog p{font-size:17px}.account-provider-list{display:grid;gap:9px;margin-top:12px}.account-provider-button{width:100%;padding:10px 14px;text-align:center;font-size:18px;background:#ffffff14;border:0;border-radius:10px}.account-provider-button:hover{background:#ffffff25}.account-provider-status{font-size:14px!important;color:#abc3d2}.web-os-version{margin-left:auto;padding-left:12px;flex:0 0 auto;font-size:14px;color:#d5e9f5;white-space:nowrap;line-height:1.2}@media(max-width:900px){.web-os-version{font-size:12px}}@media(max-width:680px){.web-os-version{font-size:11px;max-width:105px;overflow:hidden;text-overflow:ellipsis}}.public-ip-field{display:inline-flex;align-items:baseline;gap:5px;min-width:0;margin-left:9px;white-space:nowrap;line-height:1.2}.public-ip-label{display:inline;font-size:15px;color:#d5e9f5;white-space:nowrap;line-height:inherit}
.public-ip-value{display:inline-block;vertical-align:baseline;line-height:inherit;border:0!important;background:transparent!important;padding:0!important;margin:0!important;font-size:15px;font-weight:700;letter-spacing:.04em;white-space:nowrap;font-variant-numeric:tabular-nums;transition:color .2s,text-shadow .2s}
.public-ip-value.is-online{color:#ffffff!important;text-shadow:none;cursor:copy}
.public-ip-value.is-online:hover{color:#ffffff!important;text-shadow:none}
.public-ip-value.is-offline{color:#ff4f58!important;text-shadow:0 0 7px #ff303a,0 0 14px #bf202b}
.public-ip-value.is-pending{color:#b4c2cd!important;text-shadow:none}
.minimal-banner{display:flex!important;position:relative;justify-content:flex-start;padding-left:4px;padding-right:12px;align-items:center;gap:6px;overflow:hidden}.minimal-banner .public-ip-field{flex:0 1 auto;overflow:hidden;min-width:0}.minimal-banner .web-os-version{display:block!important;position:absolute;right:12px;top:50%;transform:translateY(-50%);margin:0;padding:0 0 0 10px;background:linear-gradient(90deg,transparent,#14293b 12px);font-size:16px;font-weight:700;color:#fff;max-width:none;overflow:visible;white-space:nowrap;z-index:2}.minimal-banner{padding-right:110px}.banner-logo{display:block;width:min(150px,52vw);height:30px;object-fit:contain;object-position:left center}.minimal-banner .public-ip-field{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);margin:0;max-width:calc(100% - 225px);justify-content:center}.minimal-banner .banner-statement{position:fixed;left:44px;top:19px;transform:translateY(-50%);white-space:nowrap}.minimal-banner .public-ip-field{overflow:visible!important}.minimal-banner .public-ip-field .banner-statement{display:inline}.minimal-banner .web-os-version{font-weight:400;font-size:16px;background:none}@media(max-width:680px){.minimal-banner{height:114px;min-height:114px;padding:4px 10px 4px 4px;overflow:visible}.minimal-banner .brand-glass-button{width:90px;height:90px;min-width:90px;min-height:90px;flex-basis:90px;padding:8px}.minimal-banner .brand-glass-button img{width:70px;height:70px;max-width:100%;max-height:100%}.minimal-banner .public-ip-field{display:grid;grid-template-columns:auto auto;grid-template-rows:repeat(3,auto);column-gap:6px;row-gap:1px;align-items:center;justify-items:center;left:calc(50% + 8px);top:50%;width:max-content;max-width:calc(100% - 125px);overflow:visible;white-space:nowrap}.minimal-banner .public-ip-field>span:not([class*=banner-]):not(.banner-ip){display:none}.minimal-banner .public-ip-field .banner-statement{display:block;position:fixed;left:100px;top:56px;transform:translateY(-50%);font-size:13px;max-width:calc(100vw - 205px);overflow:hidden;text-overflow:ellipsis}.minimal-banner .banner-browser{grid-column:1 / -1;grid-row:1}.minimal-banner .banner-ip{grid-column:1 / -1;grid-row:2}.minimal-banner .banner-os{grid-column:1;grid-row:3}.minimal-banner .banner-guest{grid-column:2;grid-row:3}.minimal-banner .web-os-version{right:45px;top:10px;transform:none;font-size:12px;line-height:1;z-index:3}.brand-corner-menu{top:120px}.minimal-main{min-height:calc(100dvh - 114px)}}.minimal-banner .banner-statement{position:absolute!important;left:45px!important;top:50%!important;transform:translateY(-50%)!important;font-size:15px;z-index:2;white-space:nowrap}.minimal-banner .public-ip-field{position:absolute!important;left:50%!important;top:50%!important;transform:translate(-50%,-50%)!important;margin:0!important;max-width:calc(100% - 540px);white-space:nowrap}.minimal-banner .web-os-version{right:48px!important}.minimal-banner .session-qr-button{position:absolute;right:6px;top:50%;transform:translateY(-50%);width:30px;height:30px;padding:2px;border:0;border-radius:0;background:transparent;z-index:4;cursor:pointer}.session-qr-button svg{display:block;width:100%;height:100%}.session-qr-detail{position:fixed;right:12px;top:48px;z-index:160;width:min(330px,calc(100vw - 24px));padding:16px;border-radius:12px;background:#17334af5;box-shadow:0 12px 36px #0009;display:grid;gap:10px}.session-qr-detail{opacity:0;transform:translateY(-12px) scale(.88);transform-origin:top right;pointer-events:none;visibility:hidden;transition:opacity .22s ease,transform .22s cubic-bezier(.2,.8,.2,1),visibility .22s}.session-qr-detail.is-open{opacity:1;transform:translateY(0) scale(1);pointer-events:auto;visibility:visible}@media(prefers-reduced-motion:reduce){.session-qr-detail{transition:none}}.session-qr-detail svg{width:190px;height:190px;background:transparent;padding:6px;justify-self:center}.session-qr-detail p{font-size:14px}.session-qr-detail button{padding:7px}.minimal-banner .web-os-version{font-weight:400!important}.desktop-motto{position:fixed;left:14px;bottom:12px;z-index:10;max-width:calc(100vw - 155px);font-size:13px;line-height:1.3;font-weight:400;letter-spacing:.01em;color:#d2e0eaad;pointer-events:none}@media(max-width:680px){.desktop-motto{left:10px;bottom:12px;font-size:11px;max-width:calc(100vw - 145px)}}.brand-corner-menu .brand-menu-item,.brand-corner-menu button{ text-transform:uppercase }.brand-menu-comment{font-size:13px;line-height:1.25;color:#c5d9e6;min-height:32px;margin:7px 4px 2px}.brand-submenu[hidden],.brand-menu-item[hidden]{display:none!important}.brand-submenu>button{display:block;width:100%;border:0;background:transparent;text-align:left;color:#e7f5ff;padding:5px 10px;cursor:pointer}.brand-submenu>button:hover{background:#ffffff20}.brand-primary-choice{margin:0!important;padding:0!important;background:transparent!important}.brand-primary-choice>summary{display:list-item;list-style-position:inside;cursor:pointer;padding:7px 10px;font-weight:600}.brand-primary-choice>summary::marker{content:"▸  "}.brand-primary-choice[open]>summary::marker{content:"▾  "}.brand-primary-choice>summary:hover{background:#ffffff16}.brand-primary-choice>summary:focus-visible{outline:2px solid #9ccbe7;outline-offset:2px}.brand-submenu{margin:4px 0 8px;padding:5px 8px;background:#ffffff09;border-radius:9px}.brand-submenu summary{cursor:pointer;font-size:15px;letter-spacing:.035em}.brand-submenu-group{margin:5px 0 5px 10px}.brand-submenu-group summary{font-size:14px}.brand-submenu-group button{display:block;width:100%;padding:3px 6px;text-align:left;background:transparent;border:0;color:#e7f5ff;cursor:pointer;font-size:14px}.brand-submenu-group button:hover{background:#ffffff20}.brand-corner-menu{max-height:calc(100dvh - 60px);overflow-y:auto}.engineering-catalog{margin:16px 0;padding:14px;background:#102b3d8c;border-radius:12px}.engineering-catalog-group,.engineering-catalog-tool{padding:7px 12px;border-bottom:1px solid #ffffff20}.engineering-catalog summary{cursor:pointer;font-weight:600}.engineering-catalog-tool{margin-left:14px}.engineering-catalog ul{margin:8px 0;padding-left:25px}.brand-menu-search{display:block;width:calc(100% - 16px);margin:12px 8px 6px;padding:8px 10px;border:0;border-radius:9px;outline:0;background:#ffffff12;color:#eaf6ff;font:inherit}.brand-menu-search::placeholder{color:#b7cbd9}.brand-menu-search:focus{box-shadow:inset 0 0 0 1px #a8cee2}.brand-menu-search-results{max-height:210px;overflow-y:auto;padding:3px 8px}.brand-menu-search-results[hidden]{display:none}.brand-menu-search-results button{display:block;width:100%;text-align:left;border:0;border-radius:6px;padding:5px 8px;background:transparent;color:#eaf6ff}.brand-menu-search-results button:hover{background:#ffffff20}.app>.public-ip-field{position:fixed!important;left:auto!important;right:16px!important;top:auto!important;bottom:14px!important;transform:none!important;z-index:9!important;display:flex!important;flex-wrap:wrap;justify-content:flex-end;gap:6px;align-items:center;width:auto!important;max-width:min(55vw,650px)!important;background:transparent!important;white-space:normal!important;font-size:13px!important;font-weight:400!important}.app>.public-ip-field *{font-weight:400!important;font-size:13px!important}.app>.public-ip-field .public-ip-value{font-weight:400!important}.minimal-banner .web-os-version{right:12px!important}.session-qr-button{position:fixed!important;right:18px!important;bottom:18px!important;top:auto!important;transform:none!important;width:190px!important;height:190px!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;opacity:.52;z-index:15!important;transition:opacity .25s ease,transform .25s ease!important}.session-qr-button:hover,.session-qr-button:focus-visible{opacity:1;transform:scale(1.035)!important}.session-qr-button svg{width:100%;height:100%}.brand-corner-menu .session-qr-button{position:relative!important;display:block!important;right:auto!important;bottom:auto!important;top:auto!important;transform:none!important;margin:12px auto 5px!important;width:150px!important;height:150px!important;opacity:.8!important;z-index:auto!important}.brand-corner-menu .session-qr-button:hover,.brand-corner-menu .session-qr-button:focus-visible{opacity:1!important;transform:scale(1.035)!important}.brand-corner-menu .session-qr-button svg{width:100%;height:100%}.session-qr-detail{top:auto!important;bottom:220px!important;right:18px!important}@media(max-width:680px){.session-qr-button{width:112px!important;height:112px!important;right:12px!important;bottom:70px!important}.session-qr-detail{bottom:190px!important;right:12px!important}}@media(max-width:1000px) and (min-width:681px){.minimal-banner .banner-statement{font-size:12px}.minimal-banner .public-ip-field{max-width:calc(100% - 400px);overflow:hidden!important}}@media(max-width:680px){.minimal-banner .banner-statement{position:absolute!important;left:100px!important;top:52px!important;font-size:12px;max-width:calc(100% - 210px);overflow:hidden;text-overflow:ellipsis}.minimal-banner .public-ip-field{left:calc(50% + 8px)!important;top:78px!important;max-width:calc(100% - 125px);transform:translate(-50%,-50%)!important}}
`;
  }
  render() {
    this.style();
    this.root=this.element('div',null,'app',document.body);
    if(this.frontPageMinimal){
      // Temporary presentation mode: preserve the banner/footer shells, hide all their contents and the page body.
      const header=this.element('header',null,'minimal-banner',this.root);
      header.setAttribute('aria-label','Infrastruct Professional banner');
      const brandButton=this.element('button',null,'brand-glass-button',header);
      brandButton.type='button';brandButton.setAttribute('aria-label','Open Infrastruct Professional menu');
      brandButton.setAttribute('aria-haspopup','menu');brandButton.setAttribute('aria-expanded','false');
      const brandIcon=this.element('img',null,null,brandButton);
      brandIcon.src='./infrastruct-favicon.png';brandIcon.alt='';brandIcon.width=28;brandIcon.height=28;
      this.publicIP.mount(header);
      const version=this.element('span',this.webOSVersion.label,'web-os-version',header);
      version.title='Development release · semantic versioning';
      const brandMenu=this.element('section',null,'brand-corner-menu',this.root);
      brandMenu.id='brand-corner-menu';brandMenu.setAttribute('aria-label','Infrastruct Professional menu');
      brandMenu.setAttribute('aria-hidden','true');brandButton.setAttribute('aria-controls',brandMenu.id);
      this.planMenuItems=[];
      const menuComment=this.element('p','Hover over a selection to see its purpose.','brand-menu-comment',brandMenu);
      const comment=(node,description)=>{node.title=description;node.addEventListener('pointerenter',()=>{menuComment.textContent=description;});node.addEventListener('focus',()=>{menuComment.textContent=description;});};
      const planEntries=[['Free','€0/month · Browser-local exploration and planning'],['Starter','€19/month · Individual projects; proposed paid capabilities'],['Professional','€59/month · Developer and business workflows; proposed'],['Enterprise','€199/month · Team governance and organization controls; proposed']];
      const descriptions={Plans:'Compare available and proposed subscription tiers.',Tools:'Browse engineering tool specifications and planning tools.',Services:'Browse browser-local services and infrastructure directories.'};
      for(const label of ['Plans','Tools','Services']){
        const sub=this.element('details',null,'brand-submenu brand-primary-choice',brandMenu);
        const item=this.element('summary',label.toUpperCase(), 'brand-menu-item',sub);
        comment(item,descriptions[label]);
        sub.addEventListener('toggle',()=>{if(sub.open)for(const other of brandMenu.querySelectorAll('.brand-primary-choice'))if(other!==sub)other.open=false;this.audit('brand_menu_expand',{label,expanded:sub.open});});
        if(label==='Plans'){
          for(const [name,description] of planEntries){const link=this.element('button',name.toUpperCase(),null,sub);link.type='button';comment(link,description);link.addEventListener('click',()=>{this.toggleBrandMenu(false);this.webOS.open('Plans');this.audit('submenu_select',{label,name});});}
        }else{
          const groups=label==='Tools'?this.engineeringCatalog.groups.map(group=>({name:group.name,items:group.tools.map(([name])=>name)})):[{name:'Network & identity',items:['WHOIS Lookup','DNS Providers']},{name:'Data & generation',items:['Encoders','Random Generator']},{name:'Hosting & access',items:['Web Hosting Providers','Secure Shell Booth']}];
          for(const group of groups){
            const nested=this.element('details',null,'brand-submenu-group',sub);const summary=this.element('summary',group.name.toUpperCase(),null,nested);comment(summary,'Browse '+group.name.toLowerCase()+' capabilities.');
            for(const name of group.items){
              const link=this.element('button',name.toUpperCase(),null,nested);link.type='button';
              const capabilities=label==='Tools'?this.engineeringCatalog.groups.flatMap(g=>g.tools).find(([tool])=>tool===name)?.[1]:null;
              comment(link,capabilities?capabilities.slice(0,3).join(' · '):'Open '+name+' service.');
              link.addEventListener('click',()=>{
                this.toggleBrandMenu(false);
                if(label==='Tools')this.engineeringCatalogSelection=name;
                this.webOS.open(label);
                if(label==='Tools')this.webOS.active?.windows?.forEach?.(win=>{if(win.name==='Tools'){win.content.replaceChildren();this.infrastructure.render(win.content,'Tools');}});
                this.audit('submenu_select',{label,name});
              });
            }
            nested.addEventListener('toggle',()=>{if(nested.open)for(const other of sub.querySelectorAll('.brand-submenu-group'))if(other!==nested)other.open=false;});
          }
        }
      }
      const search=this.element('input',null,'brand-menu-search',brandMenu);
      search.type='search';search.placeholder='Search as you type...';search.setAttribute('aria-label','Search as you type through website index');
      const searchResults=this.element('div',null,'brand-menu-search-results',brandMenu);searchResults.hidden=true;
      search.addEventListener('input',()=>{
        const query=search.value.trim();searchResults.replaceChildren();searchResults.hidden=!query;
        for(const entry of query?this.siteIndex.search(query):[]){
          const result=this.element('button',entry.title.toUpperCase(),null,searchResults);result.type='button';result.title=entry.description;
          result.addEventListener('click',()=>{this.toggleBrandMenu(false);if(entry.section==='Tools')this.engineeringCatalogSelection=entry.title;this.webOS.open(entry.section==='Index'?'Tools':entry.section);});
        }
        if(query&&!searchResults.children.length)this.element('small','No indexed matches',null,searchResults);
      });
      this.barcodes.mountSession(brandMenu);
      brandMenu.append(menuComment);
      this.brandButton=brandButton;this.brandMenu=brandMenu;
      this.account.mount(brandMenu);
      brandButton.addEventListener('click',event=>{event.stopPropagation();this.barcodes.dismissSession();this.toggleBrandMenu(!brandMenu.classList.contains('is-open'));});
      const main=this.element('main',null,'minimal-main',this.root);
      main.setAttribute('aria-label','Infrastruct Professional');
      const logo=this.element('img',null,'center-logo',main);
      logo.src='./infrastruct-logo.png';logo.alt='Infrastruct Professional';logo.width=1000;logo.decoding='async';
      this.element('small','Here we are not using AI, but here we have the tools to build them.','desktop-motto',this.root);
      this.root.append(this.publicIP.browser.parentNode);
      this.taskbar=null;
      this.onStartOutside=event=>{if(!brandMenu.contains(event.target)&&!brandButton.contains(event.target))this.toggleBrandMenu(false);if(!event.target.closest('.session-qr-detail,.session-qr-button'))this.barcodes.dismissSession();};
      this.onStartEscape=event=>{if(event.key==='Escape'){this.barcodes.dismissSession();if(brandMenu.classList.contains('is-open')){this.toggleBrandMenu(false);brandButton.focus();}}};
      document.addEventListener('pointerdown',this.onStartOutside);
      document.addEventListener('keydown',this.onStartEscape);
      this.webOS.mount(this.environment.mode,this.root);
      if(this.freePlanSelected)for(const item of this.planMenuItems||[])item.hidden=false;
      if(!this.initialPlansOpened){this.initialPlansOpened=true;this.webOS.open('Plans');}
      return;
    }
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
    this.services.render(this.root);
    this.commerce.render(this.root);
    this.profile.render(this.root);
    const footer=this.element('footer',null,null,this.root);
    this.element('span','© '+new Date().getFullYear()+' Infrastruct Professional',null,footer);
    this.runtimeLabel=this.element('span','JS runtime ready · R initializing','muted',footer);
    if(this.environment.mode!=='desktop') {
      const nav=this.element('nav',null,'navmobile',this.root);
      this.action(nav,'‹',()=>this.back());this.action(nav,'○',()=>this.hide());this.action(nav,'▢',()=>this.appSwitcher());
    }
  }
  selectFreePlan(content=null){
    if(!this.account.hasIdentity()){this.account.open('Sign in / Sign up');return;}
    this.freePlanSelected=true;
    this.cookies.ensureEssential();
    for(const item of this.planMenuItems||[])item.hidden=false;
    this.audit('free_plan_entered',{scope:'browser-session'});
    if(content)this.webOS.active?.navigateContent?.(content,'Services');
    else this.webOS.open('Services');
  }
  toggleBrandMenu(open){
    if(!this.brandMenu||!this.brandButton)return;
    if(open){
      this.barcodes.dismissSession();
      if(this.state.recent){this.close();this.state.recent=false;this.audit('recents_dismissed_for_menu');}
      this.webOS.active?.dismissRecents?.();
    }
    this.brandMenu.classList.toggle('is-open',Boolean(open));
    this.brandMenu.setAttribute('aria-hidden',String(!open));
    this.brandButton.setAttribute('aria-expanded',String(Boolean(open)));
    this.audit('brand_menu_toggle',{open:Boolean(open)});
  }
  toggleStartMenu(open){
    if(!this.startMenu||!this.startButton)return;
    this.startMenu.classList.toggle('is-open',Boolean(open));
    this.startMenu.setAttribute('aria-hidden',String(!open));
    this.startButton.setAttribute('aria-expanded',String(Boolean(open)));
    this.audit('start_menu_toggle',{open:Boolean(open)});
  }
  action(parent,label,callback,cls) {const b=this.element('button',label,cls,parent);b.addEventListener('click',()=>{this.audit('action',{label});callback();});return b;}
  open(name) {
    this.close();
    if(this.environment.mode!=='desktop'){if(!this.restoring && this.state.foreground && this.state.foreground!==name)this.state.history.push(this.state.foreground);this.state.foreground=name;this.state.recent=false;}
    this.state.windows = this.state.windows.filter(x=>x!==name);
    this.state.windows.push(name);const w=this.element('section',null,'window',this.root);w.setAttribute('role','dialog');w.setAttribute('aria-label',name);this.window=w;if(this.environment.mode!=='desktop')w.classList.add('mobile-application');
    const bar=this.element('div',null,'windowbar',w);this.element('strong',name,null,bar);if(this.environment.mode==='desktop')this.action(bar,'×',()=>this.close());
    const body=this.element('div',null,'windowbody',w);
    const descriptions={Overview:'Infrastruct Professional is a modular technology and infrastructure organization.',Architecture:'index.html → index.js. JavaScript generates HTML and CSS at runtime. index.R is loaded into webR for browser-side auditing and statistics. All functional components belong to class registries.',Runtime:'Environment detection, class registries, session state and modular UI lifecycle are active.',System:'Client runtime and device environment.',Audit:'Session event registry and statistical analysis.',Applications:'Open application cards and navigation context.'};
    this.element('p',descriptions[name]||'',null,body);
    if(name==='Runtime')this.element('p',`Completed round trips: ${this.lifecycle.roundTrips} · Registered instances: ${this.registry.lifecycle.instances.length}`,null,body);
    if(name==='Audit'||name==='Runtime'||name==='System')this.element('pre',JSON.stringify(name==='Audit'?{events:this.state.events,analytics:this.state.analytics}:name==='System'?this.environment:this.registry,null,2),null,body);
    this.audit('window_open',{name});
  }
  close(){if(this.window){this.window.remove();this.window=null;}}
  showExisting(name){this.restoring=true;try{this.open(name);}finally{this.restoring=false;}}
  appSwitcher(){
    if(this.environment.mode==='desktop')return;this.webOS.active?.dismissRecents?.();this.close();this.state.recent=true;const w=this.element('section',null,'window mobile-application recent-screen',this.root);this.window=w;w.setAttribute('aria-label','Open applications');
    const bar=this.element('div',null,'windowbar',w);this.element('strong','Open applications',null,bar);
    const cards=this.element('div',null,'windowbody appcards',w);
    const names=[...this.state.windows];
    if(!names.length){this.hide();return;}
    names.forEach(name=>{
      const card=this.action(cards,name,()=>this.open(name),'appcard');
      this.element('small','Tap to reopen · swipe horizontally to close',null,card);
      let start=0;card.addEventListener('touchstart',e=>{start=e.changedTouches[0].clientX},{passive:true});
      card.addEventListener('touchend',e=>{if(Math.abs(e.changedTouches[0].clientX-start)>75){this.state.windows=this.state.windows.filter(x=>x!==name);if(this.state.foreground===name)this.state.foreground=null;this.audit('application_swiped',{name});this.appSwitcher();}},{passive:true});
    });
  }
  back(){if(this.environment.mode==='desktop')return this.close();if(this.state.recent){this.state.recent=false;return this.state.foreground?this.showExisting(this.state.foreground):this.close();}const previous=this.state.history.pop();if(previous)return this.showExisting(previous);this.hide();}
  hide(){this.close();this.state.recent=false;this.state.foreground=null;this.webOS.active?.home?.();this.audit('home');}
  onResize(){const previous=this.environment.mode;this.environment=this.detect();this.audit('resize',{width:innerWidth,height:innerHeight});if(previous!==this.environment.mode){const recent=this.state.recent;this.toggleBrandMenu(false);document.removeEventListener('pointerdown',this.onStartOutside);document.removeEventListener('keydown',this.onStartEscape);this.barcodes.dismissSession();this.webOS.active?.unmount();this.account.unmount();this.cookies.unmount();this.root.remove();this.close();this.render();if(this.environment.mode!=='desktop'){if(recent)this.appSwitcher();else if(this.state.foreground)this.showExisting(this.state.foreground);}}}
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
