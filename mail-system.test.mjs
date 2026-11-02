import test from 'node:test';
import assert from 'node:assert/strict';
import {MailSystem} from './mail/mail-system.js';
test('EuroDNS mail window uses provider-hosted authentication only',()=>{
 const mail=new MailSystem({});
 assert.equal(mail.config.loginUrl,'https://www.openxchange.eu/appsuite/');
 assert.equal(mail.snapshot().credentialsStored,false);
 assert.equal(mail.snapshot().ownerAccessEnforced,false);
 assert.equal(mail.snapshot().authenticated,false);
 assert.equal(mail.registry.access.instances[0],mail);
});
