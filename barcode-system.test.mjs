import test from 'node:test';
import assert from 'node:assert/strict';
import {BarcodeSystem} from './barcode-system.js';
import qrcode from './qr-generator-vendor.js';
const system=new BarcodeSystem({});
test('window identifiers are EAN-13 with valid checksums and unique sequence',()=>{const codes=Array.from({length:100},()=>system.ean13());assert.equal(new Set(codes).size,100);for(const code of codes){assert.match(code,/^20\d{11}$/);assert.equal(code[12],system.checksum(code.slice(0,12)));assert.equal(system.eanPattern(code).length,95);}});
test('QR encoder creates readable matrix for opaque session payload',()=>{const qr=qrcode(0,'M');qr.addData('infrastruct-session:'+system.sessionId,'Byte');qr.make();assert.ok(qr.getModuleCount()>20);assert.equal(typeof qr.isDark(0,0),'boolean');});
