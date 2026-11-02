/** Trusted-backend Shopify subscription readiness and event interpretation. No entitlements minted. */
export class ShopifySubscriptionAdapter {
  constructor({shopDomain='k0yrr9-zr.myshopify.com'}={}){
    this.shopDomain=shopDomain;
    this.registry={catalog:{instances:[],functions:{},nested:{},events:[]},events:{instances:[],functions:{},nested:{},events:[]}};
    this.products=Object.freeze({
      starter:Object.freeze({productId:'gid://shopify/Product/11005805887821',variantId:'gid://shopify/ProductVariant/55254675390797',monthlyCents:1900}),
      professional:Object.freeze({productId:'gid://shopify/Product/11005806379341',variantId:'gid://shopify/ProductVariant/55254676930893',monthlyCents:5900}),
      enterprise:Object.freeze({productId:'gid://shopify/Product/11005806510413',variantId:'gid://shopify/ProductVariant/55254678307149',monthlyCents:19900})
    });
    this.registry.catalog.instances.push(this.products);
  }
  readiness(){return {shop:this.shopDomain,productCount:Object.keys(this.products).length,productStatus:'draft',sellingPlans:'not-configured',checkout:'disabled',customerIdentity:'not-configured',webhookPersistence:'not-configured',entitlementReconciliation:'not-configured',productionReady:false};}
  interpretWebhook(topic,payload){
    const recognized=['subscription_contracts/create','subscription_contracts/update','subscription_billing_attempts/success','subscription_billing_attempts/failure','app_subscriptions/update'];
    const event={topic,recognized:recognized.includes(topic),reference:typeof payload?.admin_graphql_api_id==='string'?payload.admin_graphql_api_id:null,decision:'audit-only',grantEntitlement:false};
    this.registry.events.instances.push(event);
    return event;
  }
  planForVariant(variantId){return Object.entries(this.products).find(([,product])=>product.variantId===variantId)?.[0]||null;}
}
