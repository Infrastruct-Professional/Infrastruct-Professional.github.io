import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {WebhookReplayStore} from './webhook-replay-store.mjs';
test('webhook replay journal prevents duplicate IDs across process instances',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'ip-webhooks-'));
 try{
  const path=join(dir,'events');
  const a=new WebhookReplayStore({path}),b=new WebhookReplayStore({path});
  const results=await Promise.all([a.record('webhook-12345678'),b.record('webhook-12345678')]);
  assert.deepEqual(results.map(x=>x.duplicate).sort(),[false,true]);
  assert.equal((await b.read('webhook-12345678')).id,'webhook-12345678');
  await assert.rejects(a.record('../invalid'),/Invalid/);
 }finally{await rm(dir,{recursive:true,force:true});}
});
