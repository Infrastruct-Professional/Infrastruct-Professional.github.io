import { TabletSystem } from '../../tablet/system/tablet-system.js';
/** Mobile-specific system identity with shared Android-style navigation. */
export class MobileSystem extends TabletSystem {
  constructor(host){super(host);this.name='mobile';}
}
