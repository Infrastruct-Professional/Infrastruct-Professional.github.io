/** Telegram adapter contract. No tokens, OAuth sessions or external calls are provisioned. */
export class TelegramSystem {
  constructor(host){this.host=host;this.registry={lifecycle:{instances:[this],functions:{},nested:{},events:[]},connection:{instances:[],functions:{},nested:{},events:[]}};}
  snapshot(){return {name:'telegram',label:'Telegram',category:'messaging',status:'not-configured',connected:false,authorization:'required',documentation:'https://core.telegram.org/bots/api'};}
  connectionPlan(){return {provider:'telegram',required:['administrator approval','provider application credentials','secure server-side authorization'],execution:'not-started'};}
}
