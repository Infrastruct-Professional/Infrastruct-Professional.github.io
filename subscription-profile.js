/** Customer subscription profile UI. Read-only until a trusted authenticated billing backend exists. */
export class SubscriptionProfile {
  constructor(host){this.host=host;this.registry={profile:{functions:{},nested:{},instances:[]},actions:{functions:{},nested:{},instances:[]}};this.config={endpoint:'',enabled:false};this.registry.profile.instances.push(this.config);}
  async load(){
    if(!this.config.enabled)throw new Error('Customer authentication is not connected');
    const base=new URL(this.config.endpoint);
    if(base.protocol!=='https:'||base.username||base.password||base.search||base.hash)throw new Error('Invalid profile endpoint');
    if(!base.pathname.endsWith('/'))base.pathname+='/';
    const response=await fetch(new URL('profile',base),{credentials:'include',headers:{Accept:'application/json'},cache:'no-store'});
    if(!response.ok)throw new Error('Unable to verify subscription profile');
    const profile=await response.json();
    if(typeof profile?.status!=='string'||typeof profile?.authenticated!=='boolean')throw new Error('Invalid profile response');
    return profile;
  }
  render(parent){
    const e=(tag,text,cls,p)=>this.host.element(tag,text,cls,p);
    const section=e('section',null,'subscription-profile',parent);
    e('div','CUSTOMER ACCOUNT','eyebrow',section);
    e('h2','Subscription profile',null,section);
    e('p','Your Infrastruct Professional plan controls access to workstation capabilities, not ownership of your infrastructure.',null,section);
    const status=e('p','Profile access will be available after secure customer sign-in and Shopify subscription verification are connected.','commerce-status',section);
    if(!this.config.enabled)return;
    const refresh=e('button','Refresh subscription status',null,section);
    const details=e('div',null,'subscription-details',section);
    const load=async()=>{refresh.disabled=true;details.replaceChildren();try{const profile=await this.load();status.textContent=profile.authenticated?'Subscription information verified by the connected backend.':'Sign in to view your subscription.';if(profile.authenticated){e('strong','Status: '+profile.status,null,details);if(typeof profile.planName==='string')e('p','Plan: '+profile.planName,null,details);if(typeof profile.renewalDate==='string')e('p','Next renewal: '+profile.renewalDate,null,details);if(Array.isArray(profile.features))e('p','Enabled capabilities: '+profile.features.filter(x=>typeof x==='string').join(', '),null,details);}}catch(error){status.textContent=error.message;}finally{refresh.disabled=false;}};
    refresh.addEventListener('click',load);load();
  }
}
