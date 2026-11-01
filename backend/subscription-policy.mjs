/** Server-side policy engine. No Shopify claims are trusted without independent verification. */
export class SubscriptionPolicy {
  constructor(){
    this.registry={policies:{functions:{},nested:{},instances:[]},evaluations:{functions:{},nested:{},instances:[]}};
    this.products=new Map([
      ['gid://shopify/Product/11005805887821',{tier:'starter',features:['dns-planning','manifest-export']}],
      ['gid://shopify/Product/11005806379341',{tier:'professional',features:['dns-planning','manifest-export','advanced-config','orchestration-planning']}],
      ['gid://shopify/Product/11005806510413',{tier:'enterprise',features:['dns-planning','manifest-export','advanced-config','orchestration-planning','team-workflow-planning','audit-planning']}]
    ]);
    this.registry.policies.instances.push(this.products);
  }
  evaluate(input){
    const deny=reason=>({active:false,reason,tier:null,features:[]});
    if(!input||input.identityVerified!==true||input.contractVerified!==true)return deny('identity-or-contract-unverified');
    if(typeof input.customerId!=='string'||!input.customerId||input.customerId!==input.contractCustomerId)return deny('customer-mismatch');
    if(input.shopDomain!=='k0yrr9-zr.myshopify.com')return deny('shop-mismatch');
    if(input.contractStatus!=='ACTIVE'||input.paymentCurrent!==true)return deny('subscription-not-current');
    if(typeof input.productId!=='string'||!this.products.has(input.productId))return deny('unknown-product');
    if(typeof input.validUntil!=='string'||!Number.isFinite(Date.parse(input.validUntil))||Date.parse(input.validUntil)<=Date.now())return deny('expired');
    const plan=this.products.get(input.productId);
    return {active:true,reason:'verified',tier:plan.tier,features:[...plan.features],validUntil:input.validUntil};
  }
}
