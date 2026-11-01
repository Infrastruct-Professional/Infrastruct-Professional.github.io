import { PlanCatalog } from './plan-catalog.js';
/** Shopify commerce adapter. Public configuration only; secrets and payment verification belong on a trusted backend. */
export class ShopifyCommerce {
  constructor(host){
    this.host=host;
    this.catalog=new PlanCatalog();
    this.registry={configuration:{functions:{},nested:{},instances:[]},checkout:{functions:{},nested:{},instances:[]}};
    this.config={storeDomain:'k0yrr9-zr.myshopify.com',apiEndpoint:'',checkoutMode:'hosted',enabled:false};
    this.registry.configuration.instances.push(this.config);
    this.planModel={type:'recurring-subscription',catalogSource:'shopify',accessSource:'verified-backend',tiers:[],billingIntervals:[],entitlements:[],customerHosting:false};
    this.registry.configuration.instances.push(this.planModel);
  }
  validUrl(value){try{const url=new URL(value);return url.protocol==='https:'?url:null;}catch{return null;}}
  async getOffers(){
    const url=this.validUrl(this.config.apiEndpoint);
    if(!this.config.enabled||!url)return [];
    const endpoint=new URL('plans',url.href.endsWith('/')?url.href:url.href+'/');
    const response=await fetch(endpoint,{credentials:'omit',headers:{Accept:'application/json'}});
    if(!response.ok)throw new Error('Commerce catalogue is unavailable');
    const payload=await response.json();
    if(!Array.isArray(payload.plans))throw new Error('Invalid catalogue response');
    return payload.plans.filter(o=>typeof o.id==='string'&&typeof o.title==='string'&&typeof o.price==='string'&&typeof o.currency==='string'&&typeof o.interval==='string');
  }
  async checkout(planId){
    const url=this.validUrl(this.config.apiEndpoint);
    if(!this.config.enabled||!url)throw new Error('Shopify is not connected');
    const endpoint=new URL('checkout',url.href.endsWith('/')?url.href:url.href+'/');
    const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({planId})});
    if(!response.ok)throw new Error('Unable to initiate checkout');
    const payload=await response.json();
    const destination=this.validUrl(payload.checkoutUrl);
    if(!destination)throw new Error('Invalid checkout destination');
    const hostname=destination.hostname.toLowerCase();
    const store=this.config.storeDomain.toLowerCase().replace(/^https?:\/\//,'').replace(/\/$/,'');
    if(!(hostname==='shopify.com'||hostname.endsWith('.shopify.com')||hostname===store))throw new Error('Checkout host not approved');
    this.host.audit('commerce_checkout_redirect',{planId});
    window.location.assign(destination.href);
  }
  render(parent){
    const e=(tag,text,cls,p)=>this.host.element(tag,text,cls,p);
    const section=e('section',null,'commerce-section',parent);
    e('div','SUBSCRIPTION PLANS','eyebrow',section);
    e('h2','Infrastruct Professional subscriptions',null,section);
    e('p','Subscribe for access to Infrastruct Professional tools. Shopify handles recurring billing; your infrastructure remains yours. Plan names, prices and limits will appear after connection.',null,section);
    const status=e('p',this.config.enabled?'Connecting to Shopify…':'Subscription plans are being prepared. Shopify authentication and billing are not yet connected.','commerce-status',section);
    const list=e('div',null,'commerce-grid',section);
    if(!this.config.enabled){
      const drafts=this.catalog.publicPlans();
      for(const draft of drafts){
        const card=e('div',null,'commerce-card',list);
        e('strong',draft.title,null,card);e('span',this.catalog.display(draft.monthlyCents)+' / month',null,card);e('small','Proposed annual billing: '+this.catalog.display(draft.annualCents)+' / year (15% discount)',null,card);e('small',draft.audience,null,card);
        const features=e('ul',null,'plan-features',card);for(const feature of draft.features)e('li',feature,null,features);
        const button=e('button','Subscription launching soon',null,card);button.disabled=true;
      }
      e('p','Prices and capabilities are proposed and subject to final approval. Recurring billing and subscription access are not yet active.','commerce-status',section);
    }
    if(!this.config.enabled)return;
    this.getOffers().then(offers=>{
      list.replaceChildren();status.textContent=offers.length?'Available subscription plans':'No subscription plans are currently published.';
      offers.forEach(offer=>{const card=e('div',null,'commerce-card',list);e('strong',offer.title,null,card);e('span',offer.price+' '+offer.currency+' / '+offer.interval,null,card);const button=e('button','Subscribe through Shopify',null,card);button.addEventListener('click',()=>this.checkout(offer.id).catch(error=>{status.textContent=error.message;}));});
    }).catch(()=>{status.textContent='Shopify catalogue unavailable; no charges can be initiated.';});
  }
}
