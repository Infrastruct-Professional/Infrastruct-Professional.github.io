/** EuroDNS-hosted Open-Xchange App Suite launcher; never collects mailbox credentials. */
export class MailSystem {
  constructor(host){
    this.host=host;
    this.registry={access:{instances:[this],functions:{},nested:{},events:[]},navigation:{instances:[],functions:{},nested:{},events:[]}};
    this.config=Object.freeze({provider:'Open-Xchange',hostingProvider:'EuroDNS',loginUrl:'https://www.openxchange.eu/appsuite/',webmailHelpUrl:'https://help.eurodns.com/s/article/How-to-access-my-webmail-account?language=en_US',mode:'external-provider-login'});
  }
  snapshot(){return {provider:this.config.provider,hostingProvider:this.config.hostingProvider,mode:this.config.mode,authenticated:false,credentialsStored:false,ownerAccessEnforced:false};}
  render(content,view='Mail'){
    const el=(tag,text,cls,parent)=>this.host.element(tag,text,cls,parent);
    el('h2',view==='Mail Login'?'OPEN-XCHANGE · LOGIN':view==='Mail Help'?'OPEN-XCHANGE · HELP':'MAIL · OPEN-XCHANGE',null,content);
    if(view==='Mail Login'){
      el('p','Sign in to your EuroDNS-hosted Open-Xchange mailbox using the official provider website.',null,content);
      const card=el('section',null,'dashboard-card',content);
      el('strong','Mailbox login',null,card);
      el('p','Use your complete mailbox email address and the password set when that mailbox was activated.',null,card);
      this.action(card,'Open Open-Xchange sign-in',this.config.loginUrl);
      el('small','The sign-in form is hosted by Open-Xchange. This window never asks for or stores your mailbox password.',null,content);
    }else if(view==='Mail Help'){
      el('p','Official instructions from EuroDNS for accessing its Open-Xchange webmail service.',null,content);
      const card=el('section',null,'dashboard-card',content);
      el('strong','Webmail instructions',null,card);
      el('p','The full email address is your username. Your mailbox password is the password created when the mailbox was activated.',null,card);
      this.action(card,'Read EuroDNS instructions',this.config.webmailHelpUrl);
      this.action(card,'Open Webmail',this.config.loginUrl);
    }else{
      el('p','EuroDNS-hosted Open-Xchange App Suite mailbox access.',null,content);
      const card=el('section',null,'dashboard-card',content);
      el('strong','Mail access',null,card);
      el('p','Open the dedicated sign-in window or provider instructions. Mail content remains on Open-Xchange until a separately authorized integration is implemented.',null,card);
      this.navigate(card,'Login Window','Mail Login');
      this.navigate(card,'Help Window','Mail Help');
    }
    el('small','Privacy: no mailbox credentials or tokens are requested or stored here. Owner-only access is not enforced by the public website; that requires trusted backend authentication.',null,content);
  }
  navigate(parent,label,windowName){const button=this.host.element('button',label,null,parent);button.type='button';button.addEventListener('click',()=>this.host.webOS.open(windowName));}
  action(parent,label,url){const button=this.host.element('button',label,null,parent);button.type='button';button.addEventListener('click',()=>{this.registry.navigation.events.push({target:url,time:Date.now()});this.host.audit('mail_external_navigation',{provider:'Open-Xchange'});globalThis.open?.(url,'_blank','noopener,noreferrer');});}
}
