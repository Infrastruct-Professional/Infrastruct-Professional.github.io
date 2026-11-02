import { ShopifySubscriptionAdapter } from './shopify-subscription-adapter.mjs';
/** Separate trusted executor scaffold. No live infrastructure changes or billing activation. Node 20+. */
import http from 'node:http';
import crypto from 'node:crypto';

export class TrustedExecutor {
  constructor(config=process.env){
    this.config=config;
    this.registry={operations:new Map(),events:[],entitlements:new Map(),webhookIds:new Map()};
    this.port=Number(config.PORT||8787);
    this.allowedOrigin=config.PUBLIC_ORIGIN||'https://infrastruct.pro';
    this.accessToken=config.EXECUTOR_ACCESS_TOKEN||'';
    this.webhookSecret=config.SHOPIFY_WEBHOOK_SECRET||'';
    this.shopDomain=config.SHOPIFY_SHOP_DOMAIN||'k0yrr9-zr.myshopify.com';
    this.mode='dry-run';
    this.shopifySubscriptions=new ShopifySubscriptionAdapter({shopDomain:this.shopDomain});
  }
  record(type,details={}){this.registry.events.push({type,time:new Date().toISOString(),...details});}
  send(res,status,payload,headers={}){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers});res.end(JSON.stringify(payload));}
  async read(req){const parts=[];let bytes=0;for await(const part of req){bytes+=part.length;if(bytes>65536)throw new Error('Payload too large');parts.push(part);}return Buffer.concat(parts);}
  authorized(req){if(!this.accessToken)return false;const token=req.headers.authorization?.replace(/^Bearer /,'')||'';const a=Buffer.from(token),b=Buffer.from(this.accessToken);return a.length===b.length&&crypto.timingSafeEqual(a,b);}
  verifiedWebhook(raw,header){if(!this.webhookSecret||typeof header!=='string')return false;const expected=crypto.createHmac('sha256',this.webhookSecret).update(raw).digest('base64');const a=Buffer.from(header),b=Buffer.from(expected);return a.length===b.length&&crypto.timingSafeEqual(a,b);}
  async route(req,res){
    const url=new URL(req.url,'http://localhost');
    const origin=req.headers.origin;
    if(origin&&origin!==this.allowedOrigin)return this.send(res,403,{error:'Origin not permitted'});
    const cors=origin===this.allowedOrigin?{'Access-Control-Allow-Origin':this.allowedOrigin,'Vary':'Origin','Access-Control-Allow-Headers':'Authorization, Content-Type','Access-Control-Allow-Methods':'GET, POST, OPTIONS'}:{};
    if(req.method==='OPTIONS')return this.send(res,204,{},cors);
    if(req.method==='GET'&&url.pathname==='/health')return this.send(res,200,{status:'ready',mode:this.mode,billing:'not-connected',executor:'dry-run'},cors);
    let raw;try{raw=await this.read(req);}catch{return this.send(res,413,{error:'Request too large'},cors);}
    if(req.method==='POST'&&url.pathname==='/webhooks/shopify'){
      if(!this.verifiedWebhook(raw,req.headers['x-shopify-hmac-sha256']))return this.send(res,401,{error:'Invalid webhook signature'},cors);
      const shop=String(req.headers['x-shopify-shop-domain']||'').toLowerCase();
      const topic=String(req.headers['x-shopify-topic']||'');
      const id=String(req.headers['x-shopify-webhook-id']||'');
      if(shop!==this.shopDomain||!/^[-a-z0-9_/.]{1,128}$/.test(topic)||!/^[a-zA-Z0-9-]{8,128}$/.test(id))return this.send(res,400,{error:'Invalid webhook metadata'},cors);
      // In-memory deduplication is only for local tests. Production requires persistent replay-safe storage.
      if(this.registry.webhookIds.has(id))return this.send(res,202,{accepted:true,duplicate:true,entitlementsUpdated:false},cors);
      if(this.registry.webhookIds.size>=1024)this.registry.webhookIds.delete(this.registry.webhookIds.keys().next().value);
      this.registry.webhookIds.set(id,Date.now());
      // HMAC plus metadata is not payment or subscription verification. No entitlements are granted.
      const interpreted=this.shopifySubscriptions.interpretWebhook(topic,(()=>{try{return JSON.parse(raw.toString('utf8'));}catch{return null;}})());
      this.record('shopify_webhook_received',{topic,shop,id,recognized:interpreted.recognized});
      return this.send(res,202,{accepted:true,entitlementsUpdated:false},cors);
    }
    if(!this.authorized(req))return this.send(res,401,{error:'Authentication not configured or invalid'},cors);
    let body={};try{body=raw.length?JSON.parse(raw.toString('utf8')):{};}catch{return this.send(res,400,{error:'Invalid JSON'},cors);}
    if(req.method==='GET'&&url.pathname==='/plans')return this.send(res,200,{plans:[],status:'shopify-not-configured'},cors);
    if(req.method==='GET'&&url.pathname==='/shopify/readiness')return this.send(res,200,this.shopifySubscriptions.readiness(),cors);
    if(req.method==='GET'&&url.pathname==='/entitlements')return this.send(res,200,{active:false,reason:'billing-not-configured'},cors);
    if(req.method==='GET'&&url.pathname==='/profile')return this.send(res,200,{authenticated:false,status:'unavailable',planName:null,renewalDate:null,features:[],reason:'customer-identity-and-billing-not-configured'},cors);
    if(req.method==='POST'&&url.pathname==='/checkout')return this.send(res,503,{error:'Shopify subscription checkout is not configured'},cors);
    if(req.method==='POST'&&url.pathname==='/prepare'){
      const manifest=body.manifest;
      if(manifest?.schema!=='infrastruct.pro/runtime/v1'||!['dns','software','infrastructure','business','server'].includes(manifest.kind))return this.send(res,400,{error:'Invalid manifest'},cors);
      // No customer target or verified subscription yet: fail closed, never mint an executable approval token.
      return this.send(res,403,{error:'Verified subscription, customer target ownership and executor authorization required'},cors);
    }
    if(req.method==='POST'&&url.pathname==='/execute')return this.send(res,403,{error:'Remote execution disabled until verified authorization and target binding'},cors);
    if(req.method==='POST'&&url.pathname==='/revoke')return this.send(res,403,{error:'No remote operations are enabled'},cors);
    return this.send(res,404,{error:'Not found'},cors);
  }
  listen(){const server=http.createServer((req,res)=>this.route(req,res).catch(()=>this.send(res,500,{error:'Internal error'})));server.listen(this.port,'127.0.0.1');return server;}
}
if(process.argv[1]&&import.meta.url===new URL('file://'+process.argv[1]).href)new TrustedExecutor().listen();
