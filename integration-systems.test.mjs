import test from 'node:test';
import assert from 'node:assert/strict';
import {IntegrationRegistry} from './runtime/integration-registry.js';
import {RuntimeOrchestrator} from './runtime/orchestrator.js';
test('ten provider and OS systems instantiate and report safe status',()=>{
 const host={};const integrations=new IntegrationRegistry(host);const orchestrator=new RuntimeOrchestrator(host);orchestrator.integrations=integrations;
 const states=orchestrator.integrationStatus();
 assert.deepEqual(Object.keys(states).sort(),['telegram','whatsapp','github','google','microsoft','linux','debian','fedora','android','ios'].sort());
 for(const name of ['telegram','whatsapp','github','google','microsoft']){
   assert.equal(states[name].connected,false);
   assert.equal(integrations.systems[name].connectionPlan().execution,'not-started');
 }
 for(const name of ['linux','debian','fedora','android','ios'])assert.equal(states[name].nativeAccess,false);
 assert.equal(integrations.registry.systems.instances.length,10);
});
