/** Shopify commerce adapter. Public configuration only; secrets and payment verification belong on a trusted backend. */
export class ShopifyCommerce {
  constructor(host){
    this.host=host;
    this.registry={configuration:{functions:{},nested:{},instances:[]},checkout:{functions:{},nested:{},instances:[]}};
    this.config={storeDomain:'',apiEndpoint:'',checkoutMode:'hosted',enabled:false};
    this.registry.configuration.instances.push(this.config);
    this.services=[
      {kind:'dns',title:'Domain & DNS configuration'},
      {kind:'software',title:'Software project preparation'},
      {kind:'infrastructure',title:'Infrastructure deployment assistance'},
      {kind:'business',title:'Business technology planning'}
    ];
  }
  validUrl(value){try{const url=new URL(value);return url.protocol==='https:'?url:null;}catch{return null;}}
  async getOffers(){
    const url=this.validUrl(this.config.apiEndpoint);
    if(!this.config.enabled||!url)return [];
    const endpoint=new URL('offers',url.href.endsWith('/')?url.href:url.href+'/');
    const response=await fetch(endpoint,{credentials:'omit',headers:{Accept:'application/json'}});
    if(!response.ok)throw new Error('Commerce catalogue is unavailable');
    const payload=await response.json();
    if(!Array.isArray(payload.offers))throw new Error('Invalid catalogue response');
    return payload.offers.filter(o=>typeof o.id==='string'&&typeof o.title==='string'&&typeof o.price==='string'&&typeof o.currency==='string');
  }
  async checkout(offerId){
    const url=this.validUrl(this.config.apiEndpoint);
    if(!this.config.enabled||!url)throw new Error('Shopify is not connected');
    const endpoint=new URL('checkout',url.href.endsWith('/')?url.href:url.href+'/');
    const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({offerId})});
    if(!response.ok)throw new Error('Unable to initiate checkout');
    const payload=await response.json();
    const destination=this.validUrl(payload.checkoutUrl);
    if(!destination)throw new Error('Invalid checkout destination');
    const hostname=destination.hostname.toLowerCase();
    const store=this.config.storeDomain.toLowerCase().replace(/^https?:\/\//,'').replace(/\/$/,'');
    if(!(hostname==='shopify.com'||hostname.endsWith('.shopify.com')||hostname===store))throw new Error('Checkout host not approved');
    this.host.audit('commerce_checkout_redirect',{offerId});
    window.location.assign(destination.href);
  }
  render(parent){
    const e=(tag,text,cls,p)=>this.host.element(tag,text,cls,p);
    const section=e('section',null,'commerce-section',parent);
    e('div','PAYMENTS & SERVICE ACCESS','eyebrow',section);
    e('h2','Shopify checkout',null,section);
    e('p','Service charges will be handled by Shopify within the Infrastruct Professional workflow. No payment details are collected by this workstation.',null,section);
    const status=e('p',this.config.enabled?'Connecting to Shopify…':'Shopify connection pending — service planning remains available.','commerce-status',section);
    const list=e('div',null,'commerce-grid',section);
    this.services.forEach(service=>{const card=e('div',null,'commerce-card',list);e('strong',service.title,null,card);e('small','Price and checkout available after merchant connection.',null,card);});
    if(!this.config.enabled)return;
    this.getOffers().then(offers=>{
      list.replaceChildren();status.textContent=offers.length?'Available paid services':'No paid services are currently published.';
      offers.forEach(offer=>{const card=e('div',null,'commerce-card',list);e('strong',offer.title,null,card);e('span',offer.price+' '+offer.currency,null,card);const button=e('button','Purchase through Shopify',null,card);button.addEventListener('click',()=>this.checkout(offer.id).catch(error=>{status.textContent=error.message;}));});
    }).catch(()=>{status.textContent='Shopify catalogue unavailable; no charges can be initiated.';});
  }
}
