/** Planned depot/backend host. Configuration is public, but no service is deployed or contacted. */
export class DepotSystem {
  constructor(host){
    this.host=host;
    this.registry={configuration:{instances:[],functions:{},nested:{},events:[]},lifecycle:{instances:[this],functions:{},nested:{},events:[]}};
    this.configuration=Object.freeze({ipv4:'91.158.236.166',role:'future-backend-depot',domainForest:'pending',endpoint:null});
    this.registry.configuration.instances.push(this.configuration);
  }
  snapshot(){return {name:'depot',ipv4:this.configuration.ipv4,role:this.configuration.role,domainForest:this.configuration.domainForest,backend:'not-deployed',connected:false,endpoint:this.configuration.endpoint};}
  connectionPlan(){return {target:this.configuration.ipv4,prerequisites:['domain forest established','DNS and TLS configured','authenticated backend deployed','administrator approval'],status:'awaiting-infrastructure',automaticConnection:false};}
}
