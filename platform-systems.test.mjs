import test from 'node:test';
import assert from 'node:assert/strict';
import { WebOperatingSystem } from './web-os.js';
import { DesktopSystem } from './desktop/system/desktop-system.js';
import { DesktopWindowSystem } from './desktop/window/system/window-system.js';
import { TabletSystem } from './tablet/system/tablet-system.js';
import { MobileSystem } from './mobile/system/mobile-system.js';
test('Web OS delegates to real modules in all four platform system directories',()=>{
  const os=new WebOperatingSystem({});
  assert.ok(os.systems.desktop instanceof DesktopSystem);
  assert.ok(os.systems.desktop instanceof DesktopWindowSystem);
  assert.ok(os.systems.tablet instanceof TabletSystem);
  assert.ok(os.systems.mobile instanceof MobileSystem);
  assert.deepEqual(Object.keys(os.systems),['desktop','tablet','mobile']);
  assert.deepEqual(Object.values(os.systems).map(system=>system.name),['desktop','tablet','mobile']);
});
