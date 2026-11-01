/** Public proposed subscription catalogue. Not a billing or entitlement source of truth. */
export class PlanCatalog {
  constructor(){
    this.registry={catalog:{functions:{},nested:{},instances:[]}};
    this.config={currency:'EUR',shop:'k0yrr9-zr.myshopify.com',annualDiscountPercent:15,publication:'draft',billingEnabled:false};
    this.plans=[
      {id:'free',title:'Free',monthlyCents:0,productId:null,features:['Browser-local text, image, audio and supported video encoding','Infrastructure planning checklist and JSON export','DNS and web hosting provider directories','Secure Shell Booth local guidance (no remote SSH)'],audience:'Anyone exploring infrastructure tools'},
      {id:'starter',title:'Starter',monthlyCents:1900,productId:'gid://shopify/Product/11005805887821',features:['Infrastructure and DNS planning','Software project manifests','Local exports'],audience:'Individuals and small projects'},
      {id:'professional',title:'Professional',monthlyCents:5900,productId:'gid://shopify/Product/11005806379341',features:['Starter planning capabilities','Advanced configuration workflows','Runtime orchestration planning'],audience:'Developers and businesses'},
      {id:'enterprise',title:'Enterprise',monthlyCents:19900,productId:'gid://shopify/Product/11005806510413',features:['Professional planning capabilities','Team workflow planning','Advanced audit and architecture planning'],audience:'Organizations and teams'}
    ];
    this.registry.catalog.instances.push(this.config,...this.plans);
  }
  annualCents(plan){return Math.round(plan.monthlyCents*12*(100-this.config.annualDiscountPercent)/100);}
  display(cents){return new Intl.NumberFormat('en-FI',{style:'currency',currency:this.config.currency,maximumFractionDigits:2}).format(cents/100);}
  publicPlans(){return this.plans.map(plan=>({...plan,annualCents:this.annualCents(plan),currency:this.config.currency,subscriptionActive:false}));}
}
