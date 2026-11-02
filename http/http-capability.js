/** HTTP browser requests. Browser capability only; does not imply privileged network access. */
export class HttpCapability {
  constructor(host){this.host=host;this.registry={status:{instances:[this],functions:{},nested:{},events:[]}};}
  snapshot(){const environment=this.host.environment||{};const available=Boolean(typeof fetch==='function');return {name:'http',label:'HTTP browser requests',available,status:available?'available':'unsupported',scope:'browser'};}
}
