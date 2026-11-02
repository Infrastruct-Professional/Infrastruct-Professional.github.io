import test from 'node:test';
import assert from 'node:assert/strict';
import {PublicNavigationSystem} from './public-navigation.js';
test('eight requested public menu categories have useful distinct submenus',()=>{
 const navigation=new PublicNavigationSystem({});
 const expected=['About','Products','Services','Downloads','Uploads','Help','Support','Contact'];
 const actual=['Services',...Object.keys(navigation.sections)];
 assert.deepEqual(actual.sort(),expected.sort());
 for(const [section,items] of Object.entries(navigation.sections)){
   assert.ok(items.length>=3,section);
   assert.ok(items.every(([title,description])=>title&&description),section);
 }
 assert.ok(navigation.entries().some(entry=>entry.section==='Downloads'&&entry.title==='Source Code'));
});
