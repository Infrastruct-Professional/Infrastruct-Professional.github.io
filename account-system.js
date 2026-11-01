/** Customer account controls. Authentication must be verified by a trusted server. */
export class AccountSystem {
  constructor(host){this.host=host;this.registry={session:{instances:[],functions:{},nested:{},events:[]}};this.config={endpoint:'',enabled:false};this.authenticated=false;this.menu=null;this.dialog=null;}
  mount(menu){this.menu=menu;this.renderMenu();if(this.config.enabled)this.refresh();}
  renderMenu(){
    this.actions?.remove();
    this.actions=this.host.element('div',null,'account-menu-actions',this.menu);
    for(const label of this.authenticated?['Sign out']:['Sign in','Sign up']){
      const button=this.host.element('button',label,'brand-menu-item',this.actions);
      button.type='button';button.addEventListener('click',()=>{this.host.toggleBrandMenu(false);if(label==='Sign out')this.signOut();else this.open(label);});
    }
  }
  endpoint(path){const url=new URL(this.config.endpoint);if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash)throw new Error('Invalid account API endpoint');if(!url.pathname.endsWith('/'))url.pathname+='/';return new URL(path,url);}
  async refresh(){
    try{const response=await fetch(this.endpoint('session'),{credentials:'include',cache:'no-store',headers:{Accept:'application/json'}});if(!response.ok)throw new Error('Session unavailable');const data=await response.json();this.authenticated=data?.authenticated===true;}
    catch{this.authenticated=false;}
    if(this.menu?.isConnected)this.renderMenu();
  }
  open(label){
    this.dialog?.remove();this.dialog=this.host.element('section',null,'account-dialog',this.host.root);
    this.dialog.setAttribute('role','dialog');this.dialog.setAttribute('aria-modal','true');this.dialog.setAttribute('aria-label',label);
    const header=this.host.element('div',null,'account-dialog-header',this.dialog);
    this.host.element('strong',label,null,header);
    const close=this.host.element('button','×',null,header);close.type='button';close.setAttribute('aria-label','Close');close.addEventListener('click',()=>this.close());
    this.host.element('p',this.config.enabled?'Account access requires verification by the secure identity provider.':'Secure account registration and sign-in are being prepared. No accounts can be created or authenticated yet.',null,this.dialog);
    if(this.config.enabled){const action=this.host.element('button','Continue securely',null,this.dialog);action.addEventListener('click',()=>{const url=this.endpoint(label==='Sign up'?'register':'login');window.location.assign(url.href);});}
    close.focus();this.host.audit('account_dialog_open',{action:label});
  }
  close(){this.dialog?.remove();this.dialog=null;}
  async signOut(){
    if(!this.config.enabled)return;
    try{const response=await fetch(this.endpoint('logout'),{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:'{}'});if(!response.ok)throw new Error('Sign-out failed');await this.refresh();}
    catch{this.open('Sign out');const p=this.dialog?.querySelector('p');if(p)p.textContent='Unable to confirm sign-out. Please try again.';}
  }
  unmount(){this.close();this.actions=null;this.menu=null;}
}
