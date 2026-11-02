/** URI reference parsing. Browser capability only; does not imply privileged network access. */
export class UriCapability {
  constructor(host){this.host=host;this.registry={status:{instances:[this],functions:{},nested:{},events:[]}};}
  snapshot(){const environment=this.host.environment||{};const available=Boolean(typeof URL==='function');return {name:'uri',label:'URI reference parsing',available,status:available?'available':'unsupported',scope:'browser'};}
}
