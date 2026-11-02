import { PlanCatalog } from '../plan-catalog.js';
/** Public, read-only API contract for GitHub Pages. Not a trusted payment API. */
export class SiteAPI {
  constructor(host){this.host=host;this.registry={plans:{instances:[],functions:{},nested:{},events:[]}};this.catalog=new PlanCatalog();}
  async plans(){
    // GitHub Pages has no server-side API runtime. Use the shared public catalogue
    // as the versioned read-only API contract until a backend is deployed.
    const plans=this.catalog.publicPlans().map(({id,title,monthlyCents,annualCents,currency,features,audience,productId,variantId,shopifyStatus,sellingPlanReady,subscriptionActive})=>({id,title,monthlyCents,annualCents,currency,features,audience,productId,variantId,shopifyStatus,sellingPlanReady,subscriptionActive}));
    this.registry.plans.events.push({status:'draft',count:plans.length});
    return {version:'v1',publication:'draft',billingEnabled:false,plans};
  }
}
