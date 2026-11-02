import test from 'node:test';
import assert from 'node:assert/strict';
import {ShopifySubscriptionAdapter} from './shopify-subscription-adapter.mjs';
test('mapped Shopify subscription products remain non-billable until backend readiness',()=>{
 const adapter=new ShopifySubscriptionAdapter();const state=adapter.readiness();
 assert.equal(state.productionReady,false);
 assert.equal(state.productCount,3);
 assert.equal(state.checkout,'disabled');
 assert.equal(adapter.planForVariant('gid://shopify/ProductVariant/55254676930893'),'professional');
 assert.equal(adapter.planForVariant('unknown'),null);
});
test('webhook interpretation cannot grant access even for recognized events',()=>{
 const adapter=new ShopifySubscriptionAdapter();
 for(const topic of ['subscription_contracts/create','subscription_billing_attempts/success','orders/paid']){
   const event=adapter.interpretWebhook(topic,{admin_graphql_api_id:'gid://shopify/SubscriptionContract/123'});
   assert.equal(event.grantEntitlement,false);
   assert.equal(event.decision,'audit-only');
 }
});

test('subscription API access fails closed when required Shopify scopes are missing',()=>{
 const adapter=new ShopifySubscriptionAdapter();
 const check=adapter.checkScopes(['write_products','read_products','write_checkouts']);
 assert.equal(check.eligible,false);
 assert.deepEqual(check.missing,['read_customer_payment_methods','read_own_subscription_contracts','write_own_subscription_contracts']);
 assert.equal(adapter.readiness().subscriptionApiAccess,'missing-required-scopes');
});
