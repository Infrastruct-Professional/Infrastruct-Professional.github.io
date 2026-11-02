import { DesktopSystem } from './desktop/system/desktop-system.js?build=20261102-platform-layout';
import { TabletSystem } from './tablet/system/tablet-system.js?build=20261102-platform-layout';
import { MobileSystem } from './mobile/system/mobile-system.js?build=20261102-platform-layout';
/** Mode-selecting Web OS facade; each platform lives in its own system directory. */
export class WebOperatingSystem {
  constructor(host){this.host=host;this.registry={systems:{instances:[],functions:{},nested:{},events:[]}};this.systems={desktop:new DesktopSystem(host),tablet:new TabletSystem(host),mobile:new MobileSystem(host)};this.registry.systems.instances=Object.values(this.systems);this.active=null;}
  mount(mode,root){if(this.active)this.active.unmount();this.active=this.systems[mode]||this.systems.desktop;this.active.mount(root);this.host.audit('os_mount',{mode:this.active.name});}
  open(name){const descriptions={Workspace:'Infrastructure workspaces and projects.',Plans:'Subscription plans and entitlements.',Dashboard:'Local runtime dashboard.',Systems:'System management and runtime diagnostics.'};return this.active?.open(name,descriptions[name]||'Infrastructure application');}
}
