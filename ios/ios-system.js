/** Browser-reported iOS compatibility; not an installed native OS agent. */
export class IosSystem {
  constructor(host){this.host=host;this.registry={lifecycle:{instances:[this],functions:{},nested:{},events:[]},detection:{instances:[],functions:{},nested:{},events:[]}};}
  snapshot(){const ua=globalThis.navigator?.userAgent||'';const detected=/iPhone|iPad|iPod/i.test(ua);const result={name:'ios',label:'iOS',category:'mobile',detected,status:detected?'browser-detected':'not-detected',nativeAccess:false};this.registry.detection.instances=[result];return result;}
}
