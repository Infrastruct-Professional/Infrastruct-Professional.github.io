import test from 'node:test';
import assert from 'node:assert/strict';
import {ShopifyContractReader} from './shopify-contract-reader.mjs';
const id='gid://shopify/SubscriptionContract/17';
const data={subscriptionContract:{id,status:'ACTIVE',customer:{id:'gid://shopify/Customer/3'},lines:{edges:[{node:{id:'line',productId:'gid://shopify/Product/11005805887821'}}],pageInfo:{hasNextPage:false}}}};
test('contract reader only permits validated IDs and returns no billing assertion',async()=>{
 let variables;
 const reader=new ShopifyContractReader({client:{executeRead:async(_query,v)=>{variables=v;return data;}}});
 await assert.rejects(reader.fetch('gid://shopify/SubscriptionContract/1/extra'),/Invalid/);
 const contract=await reader.fetch(id);
 assert.deepEqual(variables,{id});
 assert.equal(contract.customerId,'gid://shopify/Customer/3');
 assert.equal(Object.hasOwn(contract,'paymentCurrent'),false);
 assert.equal(Object.hasOwn(contract,'validUntil'),false);
});
test('contract reader rejects partial and paginated results',async()=>{
 const reader=new ShopifyContractReader({client:{executeRead:async()=>({subscriptionContract:{...data.subscriptionContract,lines:{...data.subscriptionContract.lines,pageInfo:{hasNextPage:true}}}})}});
 await assert.rejects(reader.fetch(id),/Incomplete/);
});
