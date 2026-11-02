import test from 'node:test';
import assert from 'node:assert/strict';
import {PlanCatalog} from './plan-catalog.js';
import {SiteAPI} from './api/site-api.js';
test('three existing Shopify drafts match public proposed plan pricing without activating billing',async()=>{
 const catalog=new PlanCatalog();
 const ids=['starter','professional','enterprise'];
 const prices=[1900,5900,19900];
 for(let i=0;i<ids.length;i++){
   const plan=catalog.plans.find(p=>p.id===ids[i]);
   assert.equal(plan.monthlyCents,prices[i]);
   assert.match(plan.productId,/^gid:\/\/shopify\/Product\/\d+$/);
   assert.match(plan.variantId,/^gid:\/\/shopify\/ProductVariant\/\d+$/);
   assert.equal(plan.shopifyStatus,'DRAFT');
   assert.equal(plan.sellingPlanReady,false);
 }
 const api=new SiteAPI({});const result=await api.plans();
 assert.equal(result.billingEnabled,false);
 assert.equal(result.plans.filter(p=>p.productId).length,3);
 assert.ok(result.plans.every(p=>!p.subscriptionActive));
});
