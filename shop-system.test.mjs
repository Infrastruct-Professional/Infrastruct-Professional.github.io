import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ShopSystem} from './shop-system.js';
test('inventory and cart support only available products',()=>{const shop=new ShopSystem({audit(){}});assert.equal(shop.inventory.length,4);assert.throws(()=>shop.add('starter'),/not available/);assert.equal(shop.add('free'),1);assert.equal(shop.total(),0);assert.equal(shop.lines()[0].quantity,1);shop.remove('free');assert.equal(shop.lines().length,0);});
test('checkout records local zero charge confirmation and clears cart',()=>{const shop=new ShopSystem({audit(){}});assert.throws(()=>shop.confirm(),/empty/);shop.add('free');const receipt=shop.confirm();assert.equal(receipt.status,'local-free-confirmation');assert.equal(receipt.totalCents,0);assert.equal(shop.lines().length,0);assert.equal(shop.orders.length,1);});
