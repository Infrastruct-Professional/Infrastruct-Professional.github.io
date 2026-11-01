/** Secure Shell Booth: safe terminal guidance and SSH connection planning.
 * Never executes arbitrary commands or opens a remote connection in GitHub Pages.
 */
export class SecureShellBooth {
  constructor(host){this.host=host;this.registry={session:{instances:[],functions:{},nested:{},events:[]},command:{instances:[],functions:{},nested:{},events:[]}};this.gateway={enabled:false,endpoint:null};this.history=[];}
  el(tag,text,cls,parent){return this.host.element(tag,text,cls,parent);}
  mount(parent){
    const booth=this.el('section',null,'ssh-booth',parent);
    this.el('h3','Secure Shell Booth',null,booth);
    this.el('p','Prepare SSH access and explore terminal commands. Remote shell connections are not enabled on this static website.',null,booth);
    const status=this.el('div','● Offline · Local guidance mode · No remote execution','ssh-status',booth);
    status.setAttribute('role','status');
    const settings=this.el('div',null,'ssh-settings',booth);
    const hostLabel=this.el('label','Host or IP',null,settings);const host=this.el('input',null,null,hostLabel);host.placeholder='server.example.com';host.autocomplete='off';host.maxLength=253;
    const userLabel=this.el('label','Username',null,settings);const user=this.el('input',null,null,userLabel);user.placeholder='deploy';user.autocomplete='off';user.maxLength=64;
    const portLabel=this.el('label','Port',null,settings);const port=this.el('input',null,null,portLabel);port.type='number';port.min='1';port.max='65535';port.value='22';
    const action=this.el('button','Prepare SSH command',null,settings);action.type='button';
    const output=this.el('pre','Welcome to Secure Shell Booth. Type help for supported local guidance commands.','ssh-terminal-output',booth);
    output.setAttribute('role','log');output.setAttribute('aria-live','polite');
    const inputForm=this.el('form',null,'ssh-terminal-input',booth);
    const prompt=this.el('span','booth $',null,inputForm);const input=this.el('input',null,null,inputForm);input.autocomplete='off';input.spellcheck=false;input.setAttribute('aria-label','Local guidance command');input.maxLength=160;
    const submit=this.el('button','Run locally',null,inputForm);submit.type='submit';
    const print=line=>{output.textContent+=(output.textContent?'\n':'')+line;output.scrollTop=output.scrollHeight;};
    action.addEventListener('click',()=>{
      const hostname=host.value.trim(),username=user.value.trim(),p=Number(port.value);
      if(!/^(?=.{1,253}$)[a-zA-Z0-9][a-zA-Z0-9.:-]*$/.test(hostname)||!/^[a-z_][a-z0-9_-]{0,63}$/i.test(username)||!Number.isInteger(p)||p<1||p>65535){print('Invalid host, username or port. No connection attempted.');return;}
      print(`Suggested command for your own trusted terminal: ssh -p ${p} ${username}@${hostname}`);
      print('Verify the server host key fingerprint through a trusted channel before accepting it. Never paste private keys or passwords here.');
      this.registry.session.events.push({type:'command-prepared'});this.host.audit('ssh_command_prepared');
    });
    inputForm.addEventListener('submit',event=>{event.preventDefault();const command=input.value.trim();input.value='';if(!command)return;
      if(command==='clear'){output.textContent='';return;}
      print('booth $ '+command);
      const responses={help:'Available local guidance: help, status, whoami, pwd, ls, ssh-help, security, clear',status:'Offline · local guidance only · no authenticated SSH gateway connected',whoami:'guest (local guide, not a server user)',pwd:'/guide (virtual path, not a server filesystem)',ls:'README  SSH-GUIDE', 'ssh-help':'SSH: use a trusted terminal or a verified gateway. Example: ssh -p 22 user@host. Prefer key-based auth, host-key verification and least privilege.',security:'Use verified host keys, short-lived credentials, MFA at the identity layer, least privilege, audit trails and strict session limits. Do not enter secrets in this guide.'};
      print(Object.hasOwn(responses,command)?responses[command]:'Not supported in local guidance mode. Remote commands are disabled.');
      this.registry.command.events.push({type:'guidance'});this.host.audit('ssh_guidance_command');
    });
    this.el('p','Security boundary: no browser-to-SSH connection, credential collection, server execution or stored session. Production use requires a separately deployed, authenticated, audited SSH gateway with explicit target authorization.', 'ssh-disclaimer',booth);
    return booth;
  }
}
