/** Public proposed subscription catalogue. Not a billing or entitlement source of truth. */
export class PlanCatalog {
  constructor(){
    this.registry={catalog:{functions:{},nested:{},instances:[]}};
    this.config={currency:'EUR',shop:'k0yrr9-zr.myshopify.com',annualDiscountPercent:15,publication:'draft',billingEnabled:false};
    this.plans=[
      {id:'free',title:'Free',monthlyCents:0,productId:null,features:['WHOIS / RDAP domain lookup','DNS and web hosting provider directories','Browser-local encoders','Secure Shell Booth local guidance (no remote SSH)','Encrypted local infrastructure planning'],audience:'Exploration and local planning'},
      {id:'starter',title:'Starter',monthlyCents:1900,productId:'gid://shopify/Product/11005805887821',features:['Everything in Free','Planned: connected DNS record viewing and basic change proposals','Planned: project manifests and reusable configurations'],audience:'Individuals and small projects'},
      {id:'professional',title:'Professional',monthlyCents:5900,productId:'gid://shopify/Product/11005806379341',features:['Everything in Starter','Planned: approved DNS changes and deployment workflows','Planned: advanced configuration and orchestration'],audience:'Developers and businesses'},
      {id:'enterprise',title:'Enterprise',monthlyCents:19900,productId:'gid://shopify/Product/11005806510413',features:['Everything in Professional','Planned: team governance and approval workflows','Planned: organization-wide audit and architecture controls'],audience:'Organizations and teams'}
    ];
    this.registry.catalog.instances.push(this.config,...this.plans);
  }
  annualCents(plan){return Math.round(plan.monthlyCents*12*(100-this.config.annualDiscountPercent)/100);}
  display(cents){return new Intl.NumberFormat('en-FI',{style:'currency',currency:this.config.currency,maximumFractionDigits:2}).format(cents/100);}
  publicPlans(){return this.plans.map(plan=>({...plan,annualCents:this.annualCents(plan),currency:this.config.currency,subscriptionActive:false}));}
}
