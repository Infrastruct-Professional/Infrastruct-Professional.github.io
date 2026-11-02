import test from 'node:test';
import assert from 'node:assert/strict';
import {CloudSystem} from './cloud/cloud-system.js';
import {SiteSystem} from './site/site-system.js';
test('cloud engineering creates provider-neutral non-deployed blueprints',()=>{const cloud=new CloudSystem({});const plan=cloud.blueprint({name:'Test cloud',model:'Hybrid'});assert.equal(plan.deployment,'not-provisioned');assert.equal(plan.layers.length,8);assert.equal(cloud.snapshot().blueprints,1);assert.throws(()=>cloud.blueprint({model:'unknown'}));});
test('site engineering creates non-published website blueprints',()=>{const site=new SiteSystem({});const plan=site.blueprint({name:'Test site',domain:'example.com'});assert.equal(plan.deployment,'not-published');assert.equal(plan.stages.length,7);assert.equal(site.snapshot().blueprints,1);});
