/** Browser-reported Linux compatibility; not an installed native OS agent. */
export class LinuxSystem {
  constructor(host){this.host=host;this.registry={lifecycle:{instances:[this],functions:{},nested:{},events:[]},detection:{instances:[],functions:{},nested:{},events:[]}};}
  snapshot(){const ua=globalThis.navigator?.userAgent||'';const detected=/Linux/i.test(ua);const result={name:'linux',label:'Linux',category:'desktop',detected,status:detected?'browser-detected':'not-detected',nativeAccess:false};this.registry.detection.instances=[result];return result;}
}
