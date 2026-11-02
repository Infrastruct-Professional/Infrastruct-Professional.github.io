import test from 'node:test';
import assert from 'node:assert/strict';
import {BrowserDetectionSystem} from './browser/detect/browser-detection.js';
test('browser detection selects mobile, tablet and desktop by viewport and input',()=>{
  const detector=new BrowserDetectionSystem();
  assert.equal(detector.detect({userAgent:'Mozilla/5.0 (Linux; Android 16) Chrome/130 Mobile',width:390,height:844}).mode,'mobile');
  assert.equal(detector.detect({userAgent:'Mozilla/5.0 (Linux; Android 16) Chrome/130',width:800,height:1280}).mode,'tablet');
  assert.equal(detector.detect({userAgent:'Mozilla/5.0 (Windows NT 10.0) Firefox/120',width:1440,height:900}).mode,'desktop');
});
