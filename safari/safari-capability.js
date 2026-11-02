/** Safari browser adapter. Browser capability only; does not imply privileged network access. */
export class SafariCapability {
  constructor(host){this.host=host;this.registry={status:{instances:[this],functions:{},nested:{},events:[]}};}
  snapshot(){const environment=this.host.environment||{};const available=Boolean(environment.browser==='Safari');return {name:'safari',label:'Safari browser adapter',available,status:available?'available':'unsupported',scope:'browser'};}
}
