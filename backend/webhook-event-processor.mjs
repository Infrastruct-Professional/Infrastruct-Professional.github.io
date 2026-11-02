/** Single-host audit-only event processor with recoverable pending markers. */
import {mkdir,open,readFile,rename} from 'node:fs/promises';
import {dirname} from 'node:path';
import crypto from 'node:crypto';
export class WebhookEventProcessor {
  constructor({path}={}){
    if(typeof path!=='string'||!path.startsWith('/'))throw new Error('Absolute journal path required');
    this.path=path;
    this.registry={events:{instances:[],functions:{},nested:{},events:[]}};
  }
  filename(id){
    if(typeof id!=='string'||!/^[a-zA-Z0-9-]{8,128}$/.test(id))throw new Error('Invalid webhook ID');
    return this.path+'.'+id+'.json';
  }
  async read(id){try{return JSON.parse(await readFile(this.filename(id),'utf8'));}catch(error){if(error.code==='ENOENT')return null;throw error;}}
  async accept({id,shop,topic,raw}={}){
    if(typeof shop!=='string'||typeof topic!=='string'||!Buffer.isBuffer(raw))throw new Error('Invalid webhook input');
    const file=this.filename(id);
    await mkdir(dirname(file),{recursive:true,mode:0o700});
    const record={id,shop,topic,payloadSha256:crypto.createHash('sha256').update(raw).digest('hex'),status:'pending',entitlementsUpdated:false,receivedAt:new Date().toISOString()};
    let handle;
    try{handle=await open(file,'wx',0o600);}catch(error){if(error.code==='EEXIST')return {duplicate:true,record:await this.read(id)};throw error;}
    try{await handle.writeFile(JSON.stringify(record)+'\n');await handle.sync();}finally{await handle.close();}
    this.registry.events.instances.push({id,status:'pending'});
    return {duplicate:false,record};
  }
  async markAudited(id){
    const record=await this.read(id);
    if(!record)throw new Error('Webhook not accepted');
    if(record.status==='audited')return record;
    const updated={...record,status:'audited',auditedAt:new Date().toISOString(),entitlementsUpdated:false};
    const target=this.filename(id),temp=target+'.'+crypto.randomUUID()+'.tmp';
    const handle=await open(temp,'wx',0o600);
    try{await handle.writeFile(JSON.stringify(updated)+'\n');await handle.sync();}finally{await handle.close();}
    await rename(temp,target);
    this.registry.events.instances.push({id,status:'audited'});
    return updated;
  }
}
