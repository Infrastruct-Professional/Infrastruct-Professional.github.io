/** VPN control. Browser capability only; does not imply privileged network access. */
export class VpnCapability {
  constructor(host){this.host=host;this.registry={status:{instances:[this],functions:{},nested:{},events:[]}};}
  snapshot(){const environment=this.host.environment||{};const available=Boolean(false);return {name:'vpn',label:'VPN control',available,status:available?'available':'unavailable',scope:'browser'};}
}
