/** Browser and viewport detection; never assumes privileged OS access. */
export class BrowserDetectionSystem {
  constructor(){this.registry={constructor:{instances:[this],functions:{},nested:{},events:[]},detect:{instances:[],functions:{},nested:{},events:[]}};}
  detect({userAgent=globalThis.navigator?.userAgent||'',maxTouchPoints=globalThis.navigator?.maxTouchPoints||0,width=globalThis.innerWidth||0,height=globalThis.innerHeight||0}={}){
    const touchDevice=/Android|iPad|iPhone|Mobile/i.test(userAgent)||(maxTouchPoints>1&&/Macintosh/i.test(userAgent));
    const tablet=touchDevice&&width>=600&&height>=480;
    const mobile=touchDevice&&!tablet;
    const browser=/Firefox/i.test(userAgent)?'Firefox':/Edg/i.test(userAgent)?'Edge':/Chrome/i.test(userAgent)?'Chrome':/Safari/i.test(userAgent)?'Safari':'Other';
    const os=/Windows/i.test(userAgent)?'Windows':/Android/i.test(userAgent)?'Android':/iPad|iPhone/i.test(userAgent)?'iOS':/Mac/i.test(userAgent)?'macOS':/Linux/i.test(userAgent)?'Linux':'Other';
    const result={mode:mobile?'mobile':tablet?'tablet':'desktop',browser,os,width,height};
    this.registry.detect.instances=[result];return result;
  }
}
