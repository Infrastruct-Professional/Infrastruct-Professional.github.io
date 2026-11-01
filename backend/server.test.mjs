import {test} from 'node:test';
import assert from 'node:assert/strict';
import {TrustedExecutor} from './server.mjs';
import crypto from 'node:crypto';

class ResponseMock {
  constructor(){this.status=0;this.payload=null;}
  writeHead(status){this.status=status;}
  end(text){this.payload=JSON.parse(text);}
}
class Harness {
  constructor(){this.service=new TrustedExecutor({EXECUTOR_ACCESS_TOKEN:'local-test-token',SHOPIFY_WEBHOOK_SECRET:'local-test-secret'});}
  async request(path,{method='POST',body={},token='',origin='',headers={}}={}){
    const raw=Buffer.from(JSON.stringify(body));
    const req={method,url:path,headers:{authorization:token?'Bearer '+token:'',origin,...headers},async *[Symbol.asyncIterator](){yield raw;}};
    const res=new ResponseMock();await this.service.route(req,res);return res;
  }
}
test('remote operations fail closed without authentication',async()=>{
  const h=new Harness();const r=await h.request('/prepare',{body:{manifest:{schema:'infrastruct.pro/runtime/v1',kind:'server'}}});assert.equal(r.status,401);
});
test('authenticated remote execution still fails closed',async()=>{
  const h=new Harness();const r=await h.request('/execute',{token:'local-test-token',body:{approved:true}});assert.equal(r.status,403);
});
test('prepare requires verified entitlements and target ownership',async()=>{
  const h=new Harness();const r=await h.request('/prepare',{token:'local-test-token',body:{manifest:{schema:'infrastruct.pro/runtime/v1',kind:'server'}}});assert.equal(r.status,403);
});
test('subscription checkout disabled before Shopify configuration',async()=>{
  const h=new Harness();const r=await h.request('/checkout',{token:'local-test-token',body:{planId:'fake'}});assert.equal(r.status,503);
});
test('Shopify webhook rejects bad signature',async()=>{
  const h=new Harness();const r=await h.request('/webhooks/shopify',{headers:{'x-shopify-hmac-sha256':'bad'}});assert.equal(r.status,401);
});
test('valid signed webhook does not grant subscriptions',async()=>{
  const h=new Harness();const body={id:1};const signature=crypto.createHmac('sha256','local-test-secret').update(JSON.stringify(body)).digest('base64');
  const r=await h.request('/webhooks/shopify',{body,headers:{'x-shopify-hmac-sha256':signature}});assert.equal(r.status,202);assert.equal(r.payload.entitlementsUpdated,false);
});
test('cross-origin browser requests rejected',async()=>{
  const h=new Harness();const r=await h.request('/prepare',{origin:'https://untrusted.example',token:'local-test-token'});assert.equal(r.status,403);
});

test('subscription profile fails closed without verified customer identity',async()=>{
  const h=new Harness();const r=await h.request('/profile',{method:'GET',token:'local-test-token'});
  assert.equal(r.status,200);assert.equal(r.payload.authenticated,false);assert.equal(r.payload.status,'unavailable');
});
