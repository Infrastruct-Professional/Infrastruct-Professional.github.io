/** Microsoft adapter contract. No tokens, OAuth sessions or external calls are provisioned. */
export class MicrosoftSystem {
  constructor(host){this.host=host;this.registry={lifecycle:{instances:[this],functions:{},nested:{},events:[]},connection:{instances:[],functions:{},nested:{},events:[]}};}
  snapshot(){return {name:'microsoft',label:'Microsoft',category:'identity-cloud',status:'not-configured',connected:false,authorization:'required',documentation:'https://learn.microsoft.com/en-us/graph/overview'};}
  connectionPlan(){return {provider:'microsoft',required:['administrator approval','provider application credentials','secure server-side authorization'],execution:'not-started'};}
}
