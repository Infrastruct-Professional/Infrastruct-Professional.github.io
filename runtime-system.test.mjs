import test from 'node:test';
import assert from 'node:assert/strict';
import {RuntimeSystem} from './runtime/runtime-system.js';
import {BackgroundSystem} from './core-systems.js';
test('R audit literals escape quotes, backslashes and newlines',()=>{
  assert.equal(RuntimeSystem.rString('one"two'), '"one\\"two"');
  assert.equal(RuntimeSystem.rString('a\\b'), '"a\\\\b"');
  assert.equal(RuntimeSystem.rString('a\nb'), '"a\\nb"');
});
test('runtime registers JS and R separately without claiming R is already active',()=>{
  const runtime=new RuntimeSystem({});
  assert.equal(runtime.registry.javascript.instances[0].state,'active');
  assert.equal(runtime.registry.r.instances[0].state,'initializing');
  assert.equal(runtime.ready,false);
});
test('completed background tasks are removed before subsequent schedules',()=>{
  const scheduler=new BackgroundSystem({audit(){}});
  let calls=0;scheduler.register('once',()=>{calls++;});
  scheduler.active=true;scheduler.visible=true;scheduler.schedule();
  return new Promise(resolve=>setTimeout(()=>{assert.equal(calls,1);assert.equal(scheduler.tasks.size,0);scheduler.active=false;resolve();},100));
});
