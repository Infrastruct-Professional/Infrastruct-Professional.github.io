/** Deployment boundary: static GitHub Pages is not an executable backend. */
export class ServerSystem {
  constructor(host){this.host=host;this.registry={scope:{instances:[this],functions:{},nested:{},events:[]}};this.state={scope:'server',available:false,execution:'not-deployed',authorization:'required'};}
  snapshot(){return {...this.state};}
}
