import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PlanCatalog} from './plan-catalog.js';
test('catalogue has three unpublished Shopify draft products',()=>{
 const catalog=new PlanCatalog();assert.equal(catalog.plans.length,3);assert.equal(catalog.config.billingEnabled,false);
 for(const p of catalog.publicPlans()){assert.equal(p.subscriptionActive,false);assert.ok(p.productId.startsWith('gid://shopify/Product/'));}
});
test('annual proposals apply 15% discount to twelve monthly payments',()=>{
 const catalog=new PlanCatalog();assert.deepEqual(catalog.plans.map(p=>catalog.annualCents(p)),[19380,60180,202980]);
});
