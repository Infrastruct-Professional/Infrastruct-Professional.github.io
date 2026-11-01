/** Essential cookie preferences only. No analytics or marketing cookies are set. */
export class CookieSystem {
  constructor(host){this.host=host;this.registry={consent:{instances:[],functions:{},nested:{},events:[]}};this.cookieName='infrastruct_cookie_choice';}
  choice(){const item=document.cookie.split('; ').find(part=>part.startsWith(this.cookieName+'='));return item?item.slice(this.cookieName.length+1):null;}
  save(choice){
    if(!['essential','optional'].includes(choice))return;
    document.cookie=`${this.cookieName}=${choice}; Max-Age=15552000; Path=/; SameSite=Lax; Secure`;
    this.registry.consent.events.push({choice});this.host.audit('cookie_preference_saved',{choice});
    this.panel?.remove();this.panel=null;
  }
  mount(root){
    if(this.choice())return;
    this.panel=this.host.element('aside',null,'cookie-panel',root);
    this.panel.setAttribute('aria-label','Cookie preferences');
    this.host.element('strong','Cookie preferences',null,this.panel);
    this.host.element('p','We use an essential cookie to remember your choice. Optional cookies are not currently used. Public plans work without accepting optional cookies.',null,this.panel);
    const actions=this.host.element('div',null,'cookie-actions',this.panel);
    for(const [text,choice] of [['Essential only','essential'],['Accept optional','optional']]){
      const button=this.host.element('button',text,null,actions);button.type='button';button.addEventListener('click',()=>this.save(choice));
    }
  }
  unmount(){this.panel?.remove();this.panel=null;}
}
