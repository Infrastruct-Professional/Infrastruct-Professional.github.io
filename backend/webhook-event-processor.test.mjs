import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {WebhookEventProcessor} from './webhook-event-processor.mjs';
test('webhook audit journal retains pending and audited state across instances',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'ip-event-'));
 try{
  const path=join(dir,'webhook');
  const first=new WebhookEventProcessor({path}),second=new WebhookEventProcessor({path});
  const input={id:'webhook-87654321',shop:'example.myshopify.com',topic:'orders/create',raw:Buffer.from('{"id":1}')};
  const result=await first.accept(input);
  assert.equal(result.record.status,'pending');
  assert.equal(result.record.entitlementsUpdated,false);
  assert.equal((await second.accept(input)).duplicate,true);
  assert.equal((await second.read(input.id)).status,'pending');
  await second.markAudited(input.id);
  assert.equal((await first.read(input.id)).status,'audited');
  assert.equal((await first.markAudited(input.id)).entitlementsUpdated,false);
  await assert.rejects(first.accept({...input,id:'../bad'}),/Invalid webhook ID/);
 }finally{await rm(dir,{recursive:true,force:true});}
});
