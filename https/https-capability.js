/** Secure browser transport. Browser capability only; does not imply privileged network access. */
export class HttpsCapability {
  constructor(host){this.host=host;this.registry={status:{instances:[this],functions:{},nested:{},events:[]}};}
  snapshot(){const environment=this.host.environment||{};const available=Boolean(globalThis.location?.protocol==='https:');return {name:'https',label:'Secure browser transport',available,status:available?'available':'unsupported',scope:'browser'};}
}
