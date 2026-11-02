/** GitHub adapter contract. No tokens, OAuth sessions or external calls are provisioned. */
export class GithubSystem {
  constructor(host){this.host=host;this.registry={lifecycle:{instances:[this],functions:{},nested:{},events:[]},connection:{instances:[],functions:{},nested:{},events:[]}};}
  snapshot(){return {name:'github',label:'GitHub',category:'developer',status:'not-configured',connected:false,authorization:'required',documentation:'https://docs.github.com/en/rest'};}
  connectionPlan(){return {provider:'github',required:['administrator approval','provider application credentials','secure server-side authorization'],execution:'not-started'};}
}
