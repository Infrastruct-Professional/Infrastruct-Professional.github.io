/** Durable single-host webhook replay journal. Not a distributed queue. */
import {open,readFile,mkdir} from 'node:fs/promises';
import {dirname} from 'node:path';
export class WebhookReplayStore {
  constructor({path}={}){
    if(typeof path!=='string'||!path.startsWith('/'))throw new Error('Absolute journal path required');
    this.path=path;
    this.registry={events:{instances:[],functions:{},nested:{},events:[]}};
  }
  async record(id){
    if(typeof id!=='string'||!/^[a-zA-Z0-9-]{8,128}$/.test(id))throw new Error('Invalid webhook identifier');
    await mkdir(dirname(this.path),{recursive:true,mode:0o700});
    // Exclusive create of per-event marker provides atomic deduplication on one local filesystem.
    const marker=this.path+'.'+id;
    let handle;
    try{handle=await open(marker,'wx',0o600);}catch(error){if(error.code==='EEXIST')return {duplicate:true};throw error;}
    try{await handle.writeFile(JSON.stringify({id,receivedAt:new Date().toISOString()})+'\n');await handle.sync();}
    finally{await handle.close();}
    this.registry.events.instances.push({id,duplicate:false});
    return {duplicate:false};
  }
  async read(id){
    if(!/^[a-zA-Z0-9-]{8,128}$/.test(id))throw new Error('Invalid webhook identifier');
    try{return JSON.parse(await readFile(this.path+'.'+id,'utf8'));}catch(error){if(error.code==='ENOENT')return null;throw error;}
  }
}
