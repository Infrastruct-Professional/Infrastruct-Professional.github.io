import test from 'node:test';
import assert from 'node:assert/strict';
import {ShopifyAdminClient} from './shopify-admin-client.mjs';
test('Shopify Admin API client fails closed without server-side credentials',async()=>{
 const client=new ShopifyAdminClient();
 await assert.rejects(client.inspectScopes(),/not configured/);
 await assert.rejects(new ShopifyAdminClient({token:'secret'}).executeRead('mutation { something }'),/read queries/);
 assert.throws(()=>new ShopifyAdminClient({shopDomain:'evil.example',token:'secret'}),/Invalid Shopify/);
});
test('Shopify Admin API client queries scopes with authenticated server transport',async()=>{
 let request;
 const client=new ShopifyAdminClient({token:'server-only-test-token',transport:async(url,options)=>{request={url,options};return {ok:true,json:async()=>({data:{currentAppInstallation:{accessScopes:[{handle:'write_products'}]}}})};}});
 assert.deepEqual(await client.inspectScopes(),['write_products']);
 assert.equal(request.url,'https://k0yrr9-zr.myshopify.com/admin/api/2026-10/graphql.json');
 assert.equal(request.options.headers['X-Shopify-Access-Token'],'server-only-test-token');
 assert.equal(client.registry.requests.instances.length,1);
});
test('Shopify API GraphQL errors never become verified evidence',async()=>{
 const client=new ShopifyAdminClient({token:'secret',transport:async()=>({ok:true,json:async()=>({errors:[{message:'Access denied'}]})})});
 await assert.rejects(client.inspectScopes(),/query rejected/);
});
