/** Geolocation API. Browser capability only; does not imply privileged network access. */
export class GpsCapability {
  constructor(host){this.host=host;this.registry={status:{instances:[this],functions:{},nested:{},events:[]}};}
  snapshot(){const environment=this.host.environment||{};const available=Boolean(typeof globalThis.navigator?.geolocation?.getCurrentPosition==='function');return {name:'gps',label:'Geolocation API',available,status:available?'available':'unsupported',scope:'browser'};}
}
