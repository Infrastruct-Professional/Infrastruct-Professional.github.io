/** WhatsApp adapter contract. No tokens, OAuth sessions or external calls are provisioned. */
export class WhatsappSystem {
  constructor(host){this.host=host;this.registry={lifecycle:{instances:[this],functions:{},nested:{},events:[]},connection:{instances:[],functions:{},nested:{},events:[]}};}
  snapshot(){return {name:'whatsapp',label:'WhatsApp',category:'messaging',status:'not-configured',connected:false,authorization:'required',documentation:'https://developers.facebook.com/docs/whatsapp/'};}
  connectionPlan(){return {provider:'whatsapp',required:['administrator approval','provider application credentials','secure server-side authorization'],execution:'not-started'};}
}
