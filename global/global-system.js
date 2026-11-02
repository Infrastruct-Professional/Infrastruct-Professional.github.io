/** Global scope is a contract, not a claim of global infrastructure. */
export class GlobalSystem {
  constructor(host){this.host=host;this.registry={scope:{instances:[this],functions:{},nested:{},events:[]}};this.state={scope:'global',available:false,reason:'No global coordination service configured'};}
  snapshot(){return {...this.state};}
}
