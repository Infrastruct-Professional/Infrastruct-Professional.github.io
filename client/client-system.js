/** Client capabilities are browser-reported, not server-verified identities. */
export class ClientSystem {
  constructor(host){this.host=host;this.registry={scope:{instances:[this],functions:{},nested:{},events:[]}};}
  snapshot(){return {scope:'client',available:true,mode:this.host.environment?.mode||'unknown',browser:this.host.environment?.browser||'unknown',os:this.host.environment?.os||'unknown'};}
}
