/** Essential session cookies and separately opted-in optional preferences. */
export class CookieSystem {
  constructor(host){this.host=host;this.registry={consent:{instances:[],functions:{},nested:{},events:[]}};this.cookieName='infrastruct_cookie_choice';}
  choice(){const item=document.cookie.split('; ').find(part=>part.startsWith(this.cookieName+'='));return item?item.slice(this.cookieName.length+1):null;}
  ensureEssential(){if(!this.choice())this.save('essential');}
  optionalAllowed(){return this.choice()==='optional';}
  save(choice){
    if(!['essential','optional'].includes(choice))return;
    document.cookie=`${this.cookieName}=${choice}; Max-Age=15552000; Path=/; SameSite=Lax; Secure`;
    this.registry.consent.events.push({choice});this.host.audit('cookie_preference_saved',{choice});
    this.panel?.remove();this.panel=null;
  }
  mount(root){
    // Consent banner retired; essential preferences are initialized by sign-in / Free activation.
    // Optional consent remains an explicit choice, never inferred from account access.
  }
  unmount(){this.panel?.remove();this.panel=null;}
}
