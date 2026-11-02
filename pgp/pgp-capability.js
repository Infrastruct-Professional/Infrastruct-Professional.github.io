/** OpenPGP encryption. Browser capability only; does not imply privileged network access. */
export class PgpCapability {
  constructor(host){this.host=host;this.registry={status:{instances:[this],functions:{},nested:{},events:[]}};}
  snapshot(){const environment=this.host.environment||{};const available=Boolean(false);return {name:'pgp',label:'OpenPGP encryption',available,status:available?'available':'unavailable',scope:'browser'};}
}
