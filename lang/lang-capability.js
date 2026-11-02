/** Browser language metadata. Browser capability only; does not imply privileged network access. */
export class LangCapability {
  constructor(host){this.host=host;this.registry={status:{instances:[this],functions:{},nested:{},events:[]}};}
  snapshot(){const environment=this.host.environment||{};const available=Boolean(typeof globalThis.navigator?.language==='string');return {name:'lang',label:'Browser language metadata',available,status:available?'available':'unsupported',scope:'browser'};}
}
