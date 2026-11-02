import { RuntimeSystem } from '../../desktop/system/runtime-base.js';
import { DesktopWindowSystem } from '../../desktop/window/system/window-system.js';
/** Tablet navigation, application surfaces and recent-card management. */
export class TabletSystem extends RuntimeSystem {
  constructor(host){super(host,'tablet');this.register('recents');}
  mount(root){super.mount(root);this.installMobile();}
  installMobile(){new DesktopWindowSystem(this.host).installStyles();this.nav=this.host.element('nav',null,'os-mobile-nav',this.root);this.nav.setAttribute('aria-label','System navigation');
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
