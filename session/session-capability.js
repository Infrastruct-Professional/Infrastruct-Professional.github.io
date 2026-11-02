/** Session storage. Browser capability only; does not imply privileged network access. */
export class SessionCapability {
  constructor(host){this.host=host;this.registry={status:{instances:[this],functions:{},nested:{},events:[]}};}
  snapshot(){const environment=this.host.environment||{};const available=Boolean((()=>{try{return typeof sessionStorage!=='undefined'}catch{return false}})());return {name:'session',label:'Session storage',available,status:available?'available':'unsupported',scope:'browser'};}
}
