import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SubscriptionPolicy} from './subscription-policy.mjs';
const policy=new SubscriptionPolicy();
const verified={identityVerified:true,contractVerified:true,customerId:'customer-1',contractCustomerId:'customer-1',shopDomain:'k0yrr9-zr.myshopify.com',contractStatus:'ACTIVE',paymentCurrent:true,productId:'gid://shopify/Product/11005806379341',validUntil:'2099-01-01T00:00:00.000Z'};
test('unverified subscription never grants access',()=>assert.equal(policy.evaluate({...verified,contractVerified:false}).active,false));
test('wrong customer never inherits subscription',()=>assert.equal(policy.evaluate({...verified,contractCustomerId:'customer-2'}).active,false));
test('wrong shop never grants access',()=>assert.equal(policy.evaluate({...verified,shopDomain:'another.myshopify.com'}).active,false));
test('cancelled, unpaid or expired subscriptions are denied',()=>{
 for(const v of [{contractStatus:'CANCELLED'},{paymentCurrent:false},{validUntil:'2020-01-01T00:00:00.000Z'}])assert.equal(policy.evaluate({...verified,...v}).active,false);
});
test('verified active customer receives only product-specific features',()=>{
 const result=policy.evaluate(verified);assert.equal(result.active,true);assert.equal(result.tier,'professional');assert.ok(result.features.includes('advanced-config'));assert.ok(!result.features.includes('team-workflow-planning'));
});
