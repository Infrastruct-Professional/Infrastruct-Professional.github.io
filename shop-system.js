/** Browser-local draft inventory, shop, cart and checkout; no payment processing. */
export class ShopSystem {
  constructor(host){
    this.host=host;
    this.registry={inventory:{instances:[],functions:{},nested:{},events:[]},cart:{instances:[],functions:{},nested:{},events:[]},checkout:{instances:[],functions:{},nested:{},events:[]}};
    this.inventory=[{id:'free',name:'Free',priceCents:0,stock:null,description:'Browser-local exploration and planning',active:true},{id:'starter',name:'Starter',priceCents:1900,stock:null,description:'Proposed individual project subscription',active:false},{id:'professional',name:'Professional',priceCents:5900,stock:null,description:'Proposed developer and business subscription',active:false},{id:'enterprise',name:'Enterprise',priceCents:19900,stock:null,description:'Proposed organization subscription',active:false}];
    this.cart=new Map();this.orders=[];this.registry.inventory.instances=this.inventory;
  }
  product(id){return this.inventory.find(item=>item.id===id);}
  add(id,quantity=1){const product=this.product(id);if(!product)throw Error('Unknown inventory item');if(!product.active)throw Error('Product not available for checkout');if(!Number.isSafeInteger(quantity)||quantity<1||quantity>99)throw Error('Invalid quantity');const next=(this.cart.get(id)||0)+quantity;if(next>99)throw Error('Quantity limit exceeded');this.cart.set(id,next);this.host?.audit?.('shop_cart_add',{id,quantity});return next;}
  remove(id){this.cart.delete(id);this.host?.audit?.('shop_cart_remove',{id});}
  lines(){return [...this.cart].map(([id,quantity])=>({product:this.product(id),quantity})).filter(line=>line.product);}
  total(){return this.lines().reduce((sum,line)=>sum+line.product.priceCents*line.quantity,0);}
  confirm(){const lines=this.lines();if(!lines.length)throw Error('Cart is empty');if(lines.some(line=>!line.product.active||line.product.priceCents!==0))throw Error('Paid checkout is not connected');const receipt={id:crypto.randomUUID(),createdAt:new Date().toISOString(),status:'local-free-confirmation',totalCents:0,lines:lines.map(line=>({id:line.product.id,quantity:line.quantity,priceCents:line.product.priceCents}))};this.orders.push(receipt);this.registry.checkout.instances.push(receipt);this.cart.clear();this.host?.audit?.('shop_checkout_confirmed',{order:receipt.id,totalCents:0});return receipt;}
  render(content,section='Shop'){
    const e=(tag,text,cls,parent)=>this.host.element(tag,text,cls,parent);
    const nav=e('nav',null,'shop-nav',content);for(const name of ['Shop','Cart','Checkout']){const b=e('button',name,null,nav);b.type='button';b.addEventListener('click',()=>this.host.webOS.open(name));}
    e('h2',section.toUpperCase(),null,content);
    if(section==='Shop'){
      e('p','Available and proposed subscriptions. Paid purchases are disabled until verified billing is connected.',null,content);
      const grid=e('div',null,'shop-grid',content);
      for(const product of this.inventory){const card=e('article',null,'shop-card',grid);e('strong',product.name,null,card);e('span',this.host.commerce.catalog.display(product.priceCents)+' / month',null,card);e('small',product.description,null,card);e('small',product.active?'Available for local zero-charge confirmation':'Preview only · Not purchasable',null,card);if(section==='Shop'){const button=e('button',product.active?'Add to cart':'Not available',null,card);button.type='button';button.disabled=!product.active;button.addEventListener('click',()=>{this.add(product.id);this.host.webOS.open('Cart');});}}
    }else if(section==='Cart'){
      const lines=this.lines();if(!lines.length)e('p','Your cart is empty.',null,content);
      for(const line of lines){const row=e('div',null,'shop-cart-line',content);e('span',line.product.name+' × '+line.quantity,null,row);const remove=e('button','Remove',null,row);remove.type='button';remove.addEventListener('click',()=>{this.remove(line.product.id);content.replaceChildren();this.render(content,'Cart');});}
      e('strong','Total: '+this.host.commerce.catalog.display(this.total()),null,content);
      const checkout=e('button','Continue to checkout',null,content);checkout.type='button';checkout.disabled=!lines.length;checkout.addEventListener('click',()=>this.host.webOS.open('Checkout'));
    }else if(section==='Checkout'){
      const lines=this.lines();e('p','Local zero-charge checkout only. No payment method is collected and no paid subscription is activated.',null,content);
      for(const line of lines)e('p',line.product.name+' × '+line.quantity,null,content);
      e('strong','Total due: '+this.host.commerce.catalog.display(this.total()),null,content);
      const confirm=e('button','Confirm free checkout',null,content);confirm.type='button';confirm.disabled=!lines.length||this.total()!==0||lines.some(line=>!line.product.active);
      const status=e('p','',null,content);status.setAttribute('role','status');confirm.addEventListener('click',()=>{try{const receipt=this.confirm();status.textContent='Local confirmation '+receipt.id+' · No charge made';confirm.disabled=true;}catch(error){status.textContent=error.message;}});
    }
  }
}
