/** Wi-Fi control. Browser capability only; does not imply privileged network access. */
export class WifiCapability {
  constructor(host){this.host=host;this.registry={status:{instances:[this],functions:{},nested:{},events:[]}};}
  snapshot(){const environment=this.host.environment||{};const available=Boolean(false);return {name:'wifi',label:'Wi-Fi control',available,status:available?'available':'unavailable',scope:'browser'};}
}
