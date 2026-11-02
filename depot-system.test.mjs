import test from 'node:test';
import assert from 'node:assert/strict';
import {DepotSystem} from './depot/depot-system.js';
import {RuntimeOrchestrator} from './runtime/orchestrator.js';
test('depot retains configured address without claiming a deployed backend',()=>{
 const depot=new DepotSystem({});const runtime=new RuntimeOrchestrator({});runtime.depot=depot;
 assert.equal(runtime.depotStatus().ipv4,'91.158.236.166');
 assert.equal(runtime.depotStatus().connected,false);
 assert.equal(runtime.depotStatus().backend,'not-deployed');
 assert.equal(depot.connectionPlan().automaticConnection,false);
 assert.equal(depot.registry.configuration.instances[0].ipv4,'91.158.236.166');
});
