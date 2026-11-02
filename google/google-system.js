/** Google adapter contract. No tokens, OAuth sessions or external calls are provisioned. */
export class GoogleSystem {
  constructor(host){this.host=host;this.registry={lifecycle:{instances:[this],functions:{},nested:{},events:[]},connection:{instances:[],functions:{},nested:{},events:[]}};}
  snapshot(){return {name:'google',label:'Google',category:'identity-cloud',status:'not-configured',connected:false,authorization:'required',documentation:'https://developers.google.com/'};}
  connectionPlan(){return {provider:'google',required:['administrator approval','provider application credentials','secure server-side authorization'],execution:'not-started'};}
}
