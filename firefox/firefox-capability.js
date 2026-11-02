/** Firefox browser adapter. Browser capability only; does not imply privileged network access. */
export class FirefoxCapability {
  constructor(host){this.host=host;this.registry={status:{instances:[this],functions:{},nested:{},events:[]}};}
  snapshot(){const environment=this.host.environment||{};const available=Boolean(environment.browser==='Firefox');return {name:'firefox',label:'Firefox browser adapter',available,status:available?'available':'unsupported',scope:'browser'};}
}
