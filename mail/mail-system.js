/** EuroDNS mail access launcher. Never collects credentials on the public website. */
export class MailSystem {
  constructor(host){
    this.host=host;
    this.registry={access:{instances:[this],functions:{},nested:{},events:[]},navigation:{instances:[],functions:{},nested:{},events:[]}};
    this.config=Object.freeze({provider:'EuroDNS',loginUrl:'https://my.eurodns.com/login',webmailHelpUrl:'https://help.eurodns.com/s/topic/0TO3X000000YSNuWAO/webmail-interface?language=en_US',mode:'external-provider-login'});
  }
  snapshot(){return {provider:this.config.provider,mode:this.config.mode,authenticated:false,credentialsStored:false,ownerAccessEnforced:false};}
  render(content){
    const el=(tag,text,cls,parent)=>this.host.element(tag,text,cls,parent);
    el('h2','MAIL · EURODNS',null,content);
    el('p','Your EuroDNS mail access window. Authentication takes place directly on the official EuroDNS website, not inside Infrastruct Professional.',null,content);
    const card=el('section',null,'dashboard-card',content);
    el('strong','EuroDNS account login',null,card);
    el('p','Open the official EuroDNS sign-in page in a new browser tab. Once signed in, navigate to Products → Email to manage your mailbox.',null,card);
    this.action(card,'Open EuroDNS login',this.config.loginUrl);
    const help=el('section',null,'dashboard-card',content);
    el('strong','Webmail help',null,help);
    el('p','For the webmail interface and provider-specific sign-in instructions, consult the EuroDNS help centre.',null,help);
    this.action(help,'Open webmail instructions',this.config.webmailHelpUrl);
    el('small','Privacy: No password, session token or email credentials are requested, stored or proxied here. This launcher is public; exclusive owner access requires real authentication and server-side authorization in a future backend.',null,content);
  }
  action(parent,label,url){const button=this.host.element('button',label,null,parent);button.type='button';button.addEventListener('click',()=>{this.registry.navigation.events.push({target:url,time:Date.now()});this.host.audit('mail_external_navigation',{provider:'EuroDNS'});globalThis.open?.(url,'_blank','noopener,noreferrer');});}
}
