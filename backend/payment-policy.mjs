/** Payment state model; never trusts browser-side assertions or redirect URLs. */
export class PaymentPolicy {
  constructor(){
    this.registry={methods:{functions:{},nested:{},instances:[]},decisions:{functions:{},nested:{},instances:[]}};
    this.methods={card:{recurringCandidate:true,enabled:false},paypal:{recurringCandidate:true,enabled:false,reason:'paypal-express-subscriptions-disabled'},bitcoin:{recurringCandidate:false,enabled:false},bankTransfer:{recurringCandidate:false,enabled:false}};
    this.registry.methods.instances.push(this.methods);
  }
  confirm(input){
    const deny=reason=>({confirmed:false,sendConfirmation:false,activateSubscription:false,reason});
    if(!input||input.serverVerified!==true||input.paymentCaptured!==true)return deny('payment-unverified');
    if(typeof input.customerId!=='string'||!input.customerId||input.customerId!==input.paidCustomerId)return deny('customer-mismatch');
    if(typeof input.orderId!=='string'||!input.orderId)return deny('order-unverified');
    if(!Number.isSafeInteger(input.amountCents)||input.amountCents<=0||input.amountCents!==input.expectedAmountCents||input.currency!=='EUR')return deny('amount-or-currency-mismatch');
    if(!Object.hasOwn(this.methods,input.method))return deny('unsupported-method');
    if(input.subscriptionVerified!==true||input.contractStatus!=='ACTIVE')return {confirmed:true,sendConfirmation:true,activateSubscription:false,reason:'payment-verified-subscription-not-active'};
    if(this.methods[input.method].recurringCandidate!==true)return {confirmed:true,sendConfirmation:true,activateSubscription:false,reason:'manual-renewal-requires-separate-contract'};
    return {confirmed:true,sendConfirmation:true,activateSubscription:true,reason:'verified-payment-and-contract'};
  }
}
