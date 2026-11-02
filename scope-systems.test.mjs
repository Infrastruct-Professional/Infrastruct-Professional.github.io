import test from 'node:test';
import assert from 'node:assert/strict';
import {GlobalSystem} from './global/global-system.js';
import {LocalSystem} from './local/local-system.js';
import {ServerSystem} from './server/server-system.js';
import {ClientSystem} from './client/client-system.js';
import {RuntimeOrchestrator} from './runtime/orchestrator.js';
test('four scopes report honest client, local, server and global boundaries',()=>{
 const host={environment:{mode:'mobile',browser:'Firefox',os:'Android'}};
 const scopes={global:new GlobalSystem(host),local:new LocalSystem(host),server:new ServerSystem(host),client:new ClientSystem(host)};
 const coordinator=new RuntimeOrchestrator(host);coordinator.scopes=scopes;
 const status=coordinator.scopeStatus();
 assert.equal(status.global.available,false);
 assert.equal(status.server.available,false);
 assert.equal(status.local.available,true);
 assert.equal(status.client.mode,'mobile');
 for(const system of Object.values(scopes))assert.ok(system.registry.scope.instances.includes(system));
});
