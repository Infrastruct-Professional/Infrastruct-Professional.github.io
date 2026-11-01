/** Encrypted, browser-local planning vault. Only ciphertext is persisted. */
export class EncryptedPlanStorage {
  constructor(host){this.host=host;this.registry={vault:{instances:[this],functions:{},nested:{},events:[]}};this.key=null;this.storageKey='infrastruct.plan.vault.v1';}
  available(){try{if(!globalThis.crypto?.subtle||!globalThis.crypto?.getRandomValues)return false;const key='infrastruct.storage.probe';localStorage.setItem(key,'1');const valid=localStorage.getItem(key)==='1';localStorage.removeItem(key);return valid;}catch{return false;}}
  exists(){try{return Boolean(localStorage.getItem(this.storageKey));}catch{return false;}}
  async derive(passphrase,salt){const base=await crypto.subtle.importKey('raw',new TextEncoder().encode(passphrase),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:310000,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);}
  bytes(values){return Uint8Array.from(atob(values),c=>c.charCodeAt(0));}
  base64(bytes){return btoa(Array.from(bytes,b=>String.fromCharCode(b)).join(''));}
  async unlock(passphrase){if(!this.available())throw Error('Browser storage or Web Crypto is unavailable.');if(passphrase.length<12)throw Error('Use a passphrase of at least 12 characters.');
    const raw=localStorage.getItem(this.storageKey);if(!raw){const salt=crypto.getRandomValues(new Uint8Array(16));this.key=await this.derive(passphrase,salt);try{await this.write({schema:'infrastruct.pro/vault/v1',plans:[]},salt);}catch(e){this.key=null;throw e;}return;}
    const envelope=JSON.parse(raw);if(envelope.version!==1||!envelope.salt||!envelope.iv||!envelope.ciphertext)throw Error('Stored vault format is invalid.');const key=await this.derive(passphrase,this.bytes(envelope.salt));
    try{const clear=await crypto.subtle.decrypt({name:'AES-GCM',iv:this.bytes(envelope.iv)},key,this.bytes(envelope.ciphertext));const parsed=JSON.parse(new TextDecoder().decode(clear));if(!Array.isArray(parsed.plans))throw Error('Invalid vault data.');this.key=key;}catch{throw Error('Incorrect passphrase or damaged encrypted vault.');}
  }
  async read(){if(!this.key)throw Error('Unlock encrypted storage first.');const envelope=JSON.parse(localStorage.getItem(this.storageKey));const clear=await crypto.subtle.decrypt({name:'AES-GCM',iv:this.bytes(envelope.iv)},this.key,this.bytes(envelope.ciphertext));return JSON.parse(new TextDecoder().decode(clear));}
  async write(data,salt){if(!this.key)throw Error('Unlock encrypted storage first.');const old=localStorage.getItem(this.storageKey);const activeSalt=salt||(old?this.bytes(JSON.parse(old).salt):null);if(!activeSalt)throw Error('Vault salt missing.');const iv=crypto.getRandomValues(new Uint8Array(12));const clear=new TextEncoder().encode(JSON.stringify(data));const encrypted=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},this.key,clear));localStorage.setItem(this.storageKey,JSON.stringify({version:1,algorithm:'AES-256-GCM',kdf:'PBKDF2-SHA256',iterations:310000,salt:this.base64(activeSalt),iv:this.base64(iv),ciphertext:this.base64(encrypted)}));}
  async savePlan(plan){const vault=await this.read();vault.plans=vault.plans.filter(p=>p.project!==plan.project);vault.plans.push(plan);await this.write(vault);this.host.audit('encrypted_plan_saved',{count:vault.plans.length});}
  lock(){this.key=null;}
}
