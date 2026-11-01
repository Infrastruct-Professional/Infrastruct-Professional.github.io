/** Customer account controls. Authentication must be verified by a trusted server. */
export class AccountSystem {
  constructor(host){this.host=host;this.registry={session:{instances:[],functions:{},nested:{},events:[]}};this.config={endpoint:'',enabled:false};this.authenticated=false;this.menu=null;this.dialog=null;this.providers=['GitHub','Google','Microsoft','Apple'];}
  mount(menu){this.menu=menu;this.renderMenu();if(this.config.enabled)this.refresh();}
  renderMenu(){
    this.actions?.remove();
    this.actions=this.host.element('div',null,'account-menu-actions',this.menu);
    for(const label of this.authenticated?['Sign out']:['Sign in / Sign up']){
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
    this.host.element('p',this.config.enabled?'Continue with an identity provider.':'Choose an identity provider. Connections are awaiting application registration and a secure authentication service.',null,this.dialog);
    const choices=this.host.element('div',null,'account-provider-list',this.dialog);
    for(const provider of this.providers){
      const button=this.host.element('button','Continue with '+provider,'account-provider-button',choices);
      button.type='button';button.addEventListener('click',()=>this.authenticate(provider));
    }
    this.status=this.host.element('p',this.config.enabled?'':'Sign-in is not yet active. No credentials are requested or stored here.','account-provider-status',this.dialog);
    close.focus();this.host.audit('account_dialog_open',{action:label});
  }
  authenticate(provider){
    if(!this.providers.includes(provider))return;
    if(!this.config.enabled){if(this.status)this.status.textContent=provider+' sign-in will be available after secure provider configuration.';return;}
    // A trusted authentication service initiates the provider-specific authorization
    // flow, validates state/PKCE, exchanges codes and issues a verified session.
    const url=this.endpoint('auth/'+provider.toLowerCase()+'/start');
    window.location.assign(url.href);
  }
  close(){this.dialog?.remove();this.dialog=null;}
  async signOut(){
    if(!this.config.enabled)return;
    try{const response=await fetch(this.endpoint('logout'),{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:'{}'});if(!response.ok)throw new Error('Sign-out failed');await this.refresh();}
    catch{this.open('Sign out');const p=this.dialog?.querySelector('p');if(p)p.textContent='Unable to confirm sign-out. Please try again.';}
  }
  unmount(){this.close();this.actions=null;this.menu=null;}
}
