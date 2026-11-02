import test from 'node:test';
import assert from 'node:assert/strict';
import {ShopifyContractReconciler} from './shopify-contract-reconciler.mjs';
const valid=()=>({identity:{verifiedByTrustedBackend:true,customerId:'gid://shopify/Customer/42'},contract:{id:'gid://shopify/SubscriptionContract/7',customerId:'gid://shopify/Customer/42',status:'ACTIVE',validUntil:'2099-01-01T00:00:00Z',lines:[{productId:'gid://shopify/Product/11005805887821'}]},verification:{source:'authenticated-shopify-admin-api',fetchedByTrustedBackend:true,contractId:'gid://shopify/SubscriptionContract/7',shopDomain:'k0yrr9-zr.myshopify.com',paymentVerified:true}});
test('webhook or browser assertions never grant a subscription',()=>{
 const r=new ShopifyContractReconciler();
 assert.equal(r.reconcile({...valid(),verification:{...valid().verification,source:'webhook'}}).active,false);
 assert.equal(r.reconcile({...valid(),verification:{...valid().verification,fetchedByTrustedBackend:false}}).active,false);
 assert.equal(r.reconcile({...valid(),identity:{verifiedByTrustedBackend:false,customerId:'gid://shopify/Customer/42'}}).active,false);
});
test('contract matching is constrained to one known plan and customer',()=>{
 const r=new ShopifyContractReconciler();
 assert.equal(r.reconcile(valid()).tier,'starter');
 assert.equal(r.reconcile({...valid(),contract:{...valid().contract,lines:[]}}).active,false);
 assert.equal(r.reconcile({...valid(),contract:{...valid().contract,customerId:'another'}}).active,false);
 assert.equal(r.reconcile({...valid(),verification:{...valid().verification,paymentVerified:false}}).active,false);
});
