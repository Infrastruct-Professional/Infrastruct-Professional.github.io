import {test} from 'node:test';
import assert from 'node:assert/strict';
import {RuntimeStatusSystem} from './runtime-status.js';
test('runtime status never fabricates CPU, visitor or login measurements',()=>{const old=globalThis.navigator;Object.defineProperty(globalThis,'navigator',{value:{hardwareConcurrency:8},configurable:true});try{const status=new RuntimeStatusSystem({barcodes:{sessionId:'local'}});const snapshot=status.snapshot();assert.equal(snapshot.cores,8);assert.equal(snapshot.visitors,'Unavailable');assert.equal(snapshot.loggedIn,'Unavailable');assert.equal(snapshot.reservedRam,'2 × 128 MiB budget');assert.equal(snapshot.sessions,1);}finally{Object.defineProperty(globalThis,'navigator',{value:old,configurable:true});}});
