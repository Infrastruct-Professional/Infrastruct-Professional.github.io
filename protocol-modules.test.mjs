import test from 'node:test';
import assert from 'node:assert/strict';
import {ProtocolRegistry} from './runtime/protocol-registry.js';
import {SiteAPI} from './api/site-api.js';
import {CookieSystem} from './cookies/cookie-system.js';
import {DNSProviderService} from './dns/dns-provider-service.js';
import {SecureShellBooth} from './ssh/secure-shell-booth.js';
test('all 22 protocol directories have wired browser modules or owned services',()=>{
 const host={environment:{browser:'Firefox'},siteAPI:{},cookies:{},dnsProviders:{},shellBooth:{}};
 const registry=new ProtocolRegistry(host);const states=registry.snapshot();
 assert.equal(Object.keys(states).length,22);
 for(const name of ['api','cookies','dns','ssh','url','uri','session','pgp','https','http','dhcp','vpn','ad','nfs','nfc','gsm','gps','wifi','firefox','chrome','safari','lang'])assert.ok(states[name],name);
 assert.equal(states.vpn.available,false);
 assert.equal(states.firefox.available,true);
 assert.equal(states.ssh.status,'planning-only');
 for(const cls of [SiteAPI,CookieSystem,DNSProviderService,SecureShellBooth])assert.equal(typeof cls,'function');
});
