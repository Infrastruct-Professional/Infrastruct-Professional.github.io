/** Cellular radio control. Browser capability only; does not imply privileged network access. */
export class GsmCapability {
  constructor(host){this.host=host;this.registry={status:{instances:[this],functions:{},nested:{},events:[]}};}
  snapshot(){const environment=this.host.environment||{};const available=Boolean(false);return {name:'gsm',label:'Cellular radio control',available,status:available?'available':'unavailable',scope:'browser'};}
}
