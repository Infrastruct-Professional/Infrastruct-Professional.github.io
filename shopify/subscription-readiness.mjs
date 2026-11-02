/** Fail-closed readiness assessment for a future authorized Shopify subscription app. */
export class ShopifySubscriptionReadiness {
  constructor() {
    this.registry={requirements:{instances:[],functions:{},nested:{},events:[]}};
    this.requiredScopes=Object.freeze(['write_products','read_customer_payment_methods','read_own_subscription_contracts','write_own_subscription_contracts']);
    this.requirements=Object.freeze(['Subscription API access approved','Required scopes granted','Three monthly selling plans verified','Trusted backend deployed','Durable webhook replay protection','Verified customer entitlements','Renewal and cancellation tests passed','Publication approved']);
    this.registry.requirements.instances.push(...this.requirements);
  }
  evaluate(state={}) {
    const granted=new Set(state.scopes||[]);
    const missingScopes=this.requiredScopes.filter(scope=>!granted.has(scope));
    const checks={
      approved:state.approved===true,
      scopes:missingScopes.length===0,
      sellingPlans:Array.isArray(state.sellingPlans)&&['starter','professional','enterprise'].every(id=>state.sellingPlans.includes(id)),
      backend:state.backendDeployed===true,
      webhooks:state.webhooksDurable===true,
      entitlements:state.entitlementsVerified===true,
      lifecycle:state.lifecycleTested===true,
      publication:state.publicationApproved===true
    };
    return {ready:Object.values(checks).every(Boolean),checks,missingScopes};
  }
}
