import test from 'node:test';
import assert from 'node:assert/strict';
import {ShopifySubscriptionReadiness} from './subscription-readiness.mjs';
test('subscription launch requires complete authorized infrastructure',()=>{
  const system=new ShopifySubscriptionReadiness();
  const current=system.evaluate({scopes:['write_products']});
  assert.equal(current.ready,false);
  assert.deepEqual(current.missingScopes,['read_customer_payment_methods','read_own_subscription_contracts','write_own_subscription_contracts']);
  const complete={approved:true,scopes:system.requiredScopes,sellingPlans:['starter','professional','enterprise'],backendDeployed:true,webhooksDurable:true,entitlementsVerified:true,lifecycleTested:true,publicationApproved:true};
  assert.equal(system.evaluate(complete).ready,true);
  assert.equal(system.evaluate({...complete,publicationApproved:false}).ready,false);
});
