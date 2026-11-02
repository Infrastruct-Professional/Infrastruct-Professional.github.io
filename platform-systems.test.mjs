import test from 'node:test';
import assert from 'node:assert/strict';
import { WebOperatingSystem } from './web-os.js';
import { DesktopSystem } from './desktop/system/desktop-system.js?build=20261102-platform-layout';
import { DesktopWindowSystem } from './desktop/window/system/window-system.js';
import { TabletSystem } from './tablet/system/tablet-system.js?build=20261102-platform-layout';
import { MobileSystem } from './mobile/system/mobile-system.js?build=20261102-platform-layout';
test('Web OS delegates to real modules in all four platform system directories',()=>{
  const os=new WebOperatingSystem({});
  assert.ok(os.systems.desktop instanceof DesktopSystem);
  assert.ok(os.systems.desktop instanceof DesktopWindowSystem);
  assert.ok(os.systems.tablet instanceof TabletSystem);
  assert.ok(os.systems.mobile instanceof MobileSystem);
  assert.deepEqual(Object.keys(os.systems),['desktop','tablet','mobile']);
  assert.deepEqual(Object.values(os.systems).map(system=>system.name),['desktop','tablet','mobile']);
});
test('tablet and mobile share one dedicated compact system navigation implementation',()=>{
  const tablet=new TabletSystem({});const mobile=new MobileSystem({});
  assert.equal(typeof tablet.installMobile,'function');
  assert.equal(mobile.installMobile.toString(),tablet.installMobile.toString());
  assert.equal(mobile.name,'mobile');
});
test('popup controls are installed by desktop windows only',()=>{
  assert.equal(Object.hasOwn(DesktopWindowSystem.prototype,'createWindow'),true);
  assert.equal(Object.hasOwn(TabletSystem.prototype,'createWindow'),false);
  assert.equal(Object.hasOwn(MobileSystem.prototype,'createWindow'),false);
  assert.match(DesktopWindowSystem.prototype.createWindow.toString(),/installPopToggle/);
});
