/** Trusted-server-only Shopify Admin API read client. No subscription access granted. */
export class ShopifyAdminClient {
  constructor({shopDomain='k0yrr9-zr.myshopify.com',token='',apiVersion='2026-10',transport=globalThis.fetch}={}){
    if(!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(shopDomain))throw new Error('Invalid Shopify shop domain');
    if(!/^20\d{2}-(01|04|07|10)$/.test(apiVersion))throw new Error('Invalid Shopify API version');
    this.shopDomain=shopDomain;
    this.token=token;
    this.apiVersion=apiVersion;
    this.transport=transport;
    this.registry={requests:{instances:[],functions:{},nested:{},events:[]}};
  }
  async executeRead(query,variables={}){
    if(!this.token)throw new Error('Shopify Admin API token not configured');
    if(typeof query!=='string'||!/^\s*query\b/.test(query)||query.length>4096)throw new Error('Only bounded read queries permitted');
    const response=await this.transport(`https://${this.shopDomain}/admin/api/${this.apiVersion}/graphql.json`,{
      method:'POST',headers:{'Content-Type':'application/json','X-Shopify-Access-Token':this.token},body:JSON.stringify({query,variables}),signal:AbortSignal.timeout(10000)
    });
    if(!response.ok)throw new Error(`Shopify Admin API HTTP ${response.status}`);
    const payload=await response.json();
    if(!payload||Array.isArray(payload.errors)&&payload.errors.length||!payload.data)throw new Error('Shopify Admin API query rejected');
    this.registry.requests.instances.push({operation:'read',successful:true});
    return payload.data;
  }
  async inspectScopes(){
    const data=await this.executeRead('query ShopifySubscriptionScopes { currentAppInstallation { accessScopes { handle } } }');
    const scopes=data.currentAppInstallation?.accessScopes;
    if(!Array.isArray(scopes)||!scopes.every(item=>typeof item.handle==='string'))throw new Error('Invalid Shopify scopes response');
    return scopes.map(item=>item.handle);
  }
}
