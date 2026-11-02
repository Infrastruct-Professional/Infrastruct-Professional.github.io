import { DesktopWindowSystem } from '../window/system/window-system.js';
/** Desktop operating system owns the window subsystem. */
export class DesktopSystem extends DesktopWindowSystem {
  constructor(host){super(host);this.registry.desktop={instances:[this],functions:{},nested:{},events:[]};}
}
