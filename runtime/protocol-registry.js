import { UrlCapability } from '../url/url-capability.js';
import { UriCapability } from '../uri/uri-capability.js';
import { SessionCapability } from '../session/session-capability.js';
import { PgpCapability } from '../pgp/pgp-capability.js';
import { HttpsCapability } from '../https/https-capability.js';
import { HttpCapability } from '../http/http-capability.js';
import { DhcpCapability } from '../dhcp/dhcp-capability.js';
import { VpnCapability } from '../vpn/vpn-capability.js';
import { AdCapability } from '../ad/ad-capability.js';
import { NfsCapability } from '../nfs/nfs-capability.js';
import { NfcCapability } from '../nfc/nfc-capability.js';
import { GsmCapability } from '../gsm/gsm-capability.js';
import { GpsCapability } from '../gps/gps-capability.js';
import { WifiCapability } from '../wifi/wifi-capability.js';
import { FirefoxCapability } from '../firefox/firefox-capability.js';
import { ChromeCapability } from '../chrome/chrome-capability.js';
import { SafariCapability } from '../safari/safari-capability.js';
import { LangCapability } from '../lang/lang-capability.js';
/** One registered instance per namespace; privileged operations remain unimplemented. */
export class ProtocolRegistry {
  constructor(host){
    this.host=host;
    this.modules={
      url:new UrlCapability(host),
      uri:new UriCapability(host),
      session:new SessionCapability(host),
      pgp:new PgpCapability(host),
      https:new HttpsCapability(host),
      http:new HttpCapability(host),
      dhcp:new DhcpCapability(host),
      vpn:new VpnCapability(host),
      ad:new AdCapability(host),
      nfs:new NfsCapability(host),
      nfc:new NfcCapability(host),
      gsm:new GsmCapability(host),
      gps:new GpsCapability(host),
      wifi:new WifiCapability(host),
      firefox:new FirefoxCapability(host),
      chrome:new ChromeCapability(host),
      safari:new SafariCapability(host),
      lang:new LangCapability(host),
    };
    this.registry={modules:{instances:Object.values(this.modules),functions:{},nested:{},events:[]}};
  }
  snapshot(){
    const states=Object.fromEntries(Object.entries(this.modules).map(([name,module])=>[name,module.snapshot()]));
    states.api={name:'api',label:'Public read-only plan catalogue',available:Boolean(this.host.siteAPI),status:'local-contract',scope:'browser'};
    states.cookies={name:'cookies',label:'Cookie preference management',available:Boolean(this.host.cookies),status:'browser-managed',scope:'browser'};
    states.dns={name:'dns',label:'DNS provider directory',available:Boolean(this.host.dnsProviders),status:'provider-links-only',scope:'browser'};
    states.ssh={name:'ssh',label:'SSH connection planning',available:Boolean(this.host.shellBooth),status:'planning-only',scope:'browser'};
    return states;
  }
}
