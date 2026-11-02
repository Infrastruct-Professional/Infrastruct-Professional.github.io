/** Infrastruct Web OS release identity; increment intentionally with reviewed releases. */
export class WebOSVersion {
  constructor(){this.major=0;this.minor=1;this.patch=0;this.channel='development';this.registry={release:{instances:[this],functions:{},nested:{},events:[]}};}
  get value(){return `${this.major}.${this.minor}.${this.patch}`;}
  get label(){return `Web OS ${this.value}`;}
}
