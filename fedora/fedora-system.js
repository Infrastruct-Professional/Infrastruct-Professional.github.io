/** Browser-reported Fedora compatibility; not an installed native OS agent. */
export class FedoraSystem {
  constructor(host){this.host=host;this.registry={lifecycle:{instances:[this],functions:{},nested:{},events:[]},detection:{instances:[],functions:{},nested:{},events:[]}};}
  snapshot(){const ua=globalThis.navigator?.userAgent||'';const detected=/Fedora/i.test(ua);const result={name:'fedora',label:'Fedora',category:'desktop',detected,status:detected?'browser-detected':'not-detected',nativeAccess:false};this.registry.detection.instances=[result];return result;}
}
