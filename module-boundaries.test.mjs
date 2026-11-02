import test from 'node:test';
import assert from 'node:assert/strict';
import {RuntimeSystem} from './runtime/runtime-system.js';
import {RuntimeOrchestrator} from './runtime/orchestrator.js';
import {RuntimeStatusSystem} from './runtime/runtime-status.js';
import {EngineeringToolCatalog} from './tools/engineering-tool-catalog.js';
import {RandomGeneratorService} from './tools/random-generator-service.js';
import {WhoisLookupService} from './services/whois-lookup-service.js';
test('runtime tools and services expose modules from owned directories',()=>{
  for(const cls of [RuntimeSystem,RuntimeOrchestrator,RuntimeStatusSystem,EngineeringToolCatalog,RandomGeneratorService,WhoisLookupService])assert.equal(typeof cls,'function');
});
