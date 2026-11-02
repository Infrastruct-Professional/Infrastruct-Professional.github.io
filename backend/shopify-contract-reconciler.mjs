/** Maps independently fetched Shopify contract records to candidate entitlement decisions. */
import {SubscriptionPolicy} from './subscription-policy.mjs';

export class ShopifyContractReconciler {
  constructor({shopDomain='k0yrr9-zr.myshopify.com'}={}){
    this.shopDomain=shopDomain;
    this.policy=new SubscriptionPolicy();
    this.registry={contracts:{instances:[],functions:{},nested:{},events:[]},decisions:{instances:[],functions:{},nested:{},events:[]}};
  }
  reconcile({identity,contract,verification}={}){
    const deny=reason=>({active:false,reason,tier:null,features:[]});
    // A signed webhook or browser checkout return cannot satisfy this trust boundary.
    if(verification?.source!=='authenticated-shopify-admin-api'||verification?.fetchedByTrustedBackend!==true||verification?.contractId!==contract?.id)return deny('contract-not-independently-verified');
    if(verification?.shopDomain!==this.shopDomain||verification?.paymentVerified!==true)return deny('payment-not-verified');
    if(identity?.verifiedByTrustedBackend!==true||identity?.customerId!==contract?.customerId)return deny('customer-not-verified');
    if(!Array.isArray(contract?.lines)||contract.lines.length!==1)return deny('unsupported-contract-lines');
    const line=contract.lines[0];
    const result=this.policy.evaluate({identityVerified:true,contractVerified:true,customerId:identity.customerId,contractCustomerId:contract.customerId,shopDomain:this.shopDomain,contractStatus:contract.status,paymentCurrent:true,productId:line.productId,validUntil:contract.validUntil});
    this.registry.decisions.instances.push({contractId:contract.id,active:result.active,reason:result.reason});
    return result;
  }
}
