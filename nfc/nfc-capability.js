/** Web NFC. Browser capability only; does not imply privileged network access. */
export class NfcCapability {
  constructor(host){this.host=host;this.registry={status:{instances:[this],functions:{},nested:{},events:[]}};}
  snapshot(){const environment=this.host.environment||{};const available=Boolean(typeof globalThis.NDEFReader==='function');return {name:'nfc',label:'Web NFC',available,status:available?'available':'unsupported',scope:'browser'};}
}
