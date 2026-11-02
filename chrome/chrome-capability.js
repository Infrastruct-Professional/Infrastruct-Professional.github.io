/** Chrome browser adapter. Browser capability only; does not imply privileged network access. */
export class ChromeCapability {
  constructor(host){this.host=host;this.registry={status:{instances:[this],functions:{},nested:{},events:[]}};}
  snapshot(){const environment=this.host.environment||{};const available=Boolean(environment.browser==='Chrome');return {name:'chrome',label:'Chrome browser adapter',available,status:available?'available':'unsupported',scope:'browser'};}
}
