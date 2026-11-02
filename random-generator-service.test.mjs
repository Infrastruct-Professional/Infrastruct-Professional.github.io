import test from 'node:test';
import assert from 'node:assert/strict';
import {RandomGeneratorService} from './random-generator-service.js';
const service=new RandomGeneratorService({});
test('UUID v4 and v7 have correct version and variant',()=>{assert.match(service.uuid4(),/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/);assert.match(service.uuid7(),/^[a-f0-9]{8}-[a-f0-9]{4}-7[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/);});
test('ULID, serial, numeric and tokens follow requested format',()=>{assert.match(service.ulid(),/^[0-9A-HJKMNP-TV-Z]{26}$/);assert.match(service.serial('SN-{A:3}-{D:6}-{X:4}'),/^SN-[A-Z]{3}-[0-9]{6}-[0-9A-F]{4}$/);assert.match(service.generate('pin',12,''),/^\d{12}$/);assert.match(service.generate('base64url',32,''),/^[A-Za-z0-9_-]{32}$/);});
test('invalid pattern length is rejected',()=>assert.throws(()=>service.serial('{D:999}')));
