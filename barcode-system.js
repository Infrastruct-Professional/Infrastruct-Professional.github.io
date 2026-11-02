import qrcode from './qr-generator-vendor.js';
/** Internal EAN-13 window labels and opaque browser-session QR symbols. */
export class BarcodeSystem {
  constructor(host){this.host=host;this.sessionId=crypto.randomUUID();this.sequence=0;this.registry={windows:{instances:[],functions:{},nested:{},events:[]},session:{instances:[this.sessionId],functions:{},nested:{},events:[]}};}
  checksum(digits){const sum=[...digits].reduce((total,digit,index)=>total+Number(digit)*(index%2===0?1:3),0);return String((10-sum%10)%10);}
  ean13(){const prefix='20',sequence=String(++this.sequence).padStart(5,'0'),random=String(this.randomNumber(100000)).padStart(5,'0');const body=prefix+sequence+random;return body+this.checksum(body);}
  randomNumber(max){const limit=Math.floor(0x100000000/max)*max;const value=new Uint32Array(1);do{crypto.getRandomValues(value);}while(value[0]>=limit);return value[0]%max;}
  eanPattern(code){if(!/^\d{13}$/.test(code)||this.checksum(code.slice(0,12))!==code[12])throw Error('Invalid EAN-13');const L=['0001101','0011001','0010011','0111101','0100011','0110001','0101111','0111011','0110111','0001011'],G=['0100111','0110011','0011011','0100001','0011101','0111001','0000101','0010001','0001001','0010111'],R=['1110010','1100110','1101100','1000010','1011100','1001110','1010000','1000100','1001000','1110100'],parity=['LLLLLL','LLGLGG','LLGGLG','LLGGGL','LGLLGG','LGGLLG','LGGGLL','LGLGLG','LGLGGL','LGGLGL'][Number(code[0])];let bits='101';for(let i=1;i<=6;i++)bits+=(parity[i-1]==='L'?L:G)[Number(code[i])];bits+='01010';for(let i=7;i<=12;i++)bits+=R[Number(code[i])];return bits+'101';}
  barcodeSvg(code){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 99 30');svg.setAttribute('role','img');svg.setAttribute('aria-label','Window EAN-13 '+code);const bg=document.createElementNS(svg.namespaceURI,'rect');bg.setAttribute('width','99');bg.setAttribute('height','30');bg.setAttribute('fill','none');svg.append(bg);const bits=this.eanPattern(code);for(let i=0;i<bits.length;i++){if(bits[i]!=='1')continue;const bar=document.createElementNS(svg.namespaceURI,'rect');bar.setAttribute('x',String(i+2));bar.setAttribute('y','2');bar.setAttribute('width','1');bar.setAttribute('height','26');bar.setAttribute('fill','#fff');svg.append(bar);}return svg;}
  async copyIdentifier(value,element){try{await navigator.clipboard.writeText(value);element.title="Copied: "+value;this.host.audit("barcode_copied",{type:value.startsWith("infrastruct-session:")?"session-qr":"window-ean"});}catch{element.title="Clipboard unavailable. Identifier: "+value;}}
  attachWindow(win){const code=this.ean13(),label=this.host.element('span',null,'os-window-barcode',win.element);label.title='Double-click to copy EAN-13: '+code;label.addEventListener('dblclick',event=>{event.stopPropagation();this.copyIdentifier(code,label);});label.append(this.barcodeSvg(code));win.barcode=code;this.registry.windows.instances.push({id:win.id,code});this.host.audit('window_barcode_assigned',{window:win.name,id:win.id});}
  qrSvg(value){const qr=qrcode(0,'M');qr.addData(value,'Byte');qr.make();const size=qr.getModuleCount(),svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox',`0 0 ${size+8} ${size+8}`);svg.setAttribute('role','img');svg.setAttribute('aria-label','Browser session QR code');const bg=document.createElementNS(svg.namespaceURI,'rect');bg.setAttribute('width',String(size+8));bg.setAttribute('height',String(size+8));bg.setAttribute('fill','none');svg.append(bg);for(let row=0;row<size;row++)for(let col=0;col<size;col++){if(!qr.isDark(row,col))continue;const pixel=document.createElementNS(svg.namespaceURI,'rect');pixel.setAttribute('x',String(col+4));pixel.setAttribute('y',String(row+4));pixel.setAttribute('width','1');pixel.setAttribute('height','1');pixel.setAttribute('fill','#fff');svg.append(pixel);}return svg;}
  mountSession(root){const wrapper=this.host.element('button',null,'session-qr-button',root);wrapper.type='button';wrapper.title='Double-click to copy session QR value (not a sign-in credential)';wrapper.setAttribute('aria-label','View browser session QR');wrapper.append(this.qrSvg('infrastruct-session:'+this.sessionId));wrapper.addEventListener('click',event=>{if(event.detail===1)this.showSession(wrapper);});wrapper.addEventListener('dblclick',event=>{event.preventDefault();this.copyIdentifier('infrastruct-session:'+this.sessionId,wrapper);});}
  dismissSession(){
    const panel=this.sessionPanel;if(!panel||!panel.isConnected)return;
    panel.classList.remove('is-open');panel.setAttribute('aria-hidden','true');
    this.sessionPanel=null;
    const finish=()=>panel.remove();panel.addEventListener('transitionend',finish,{once:true});
    setTimeout(finish,280);
  }
  showSession(button){
    if(this.sessionPanel?.isConnected){this.dismissSession();return;}
    const panel=this.host.element('section',null,'session-qr-detail',this.host.root);
    this.sessionPanel=panel;panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Session QR details');panel.setAttribute('aria-hidden','false');
    this.host.element('strong','Browser session QR',null,panel);panel.append(this.qrSvg('infrastruct-session:'+this.sessionId));
    this.host.element('p','This QR represents an anonymous browser-runtime session identifier. It does not authenticate, pair devices or transfer access.',null,panel);
    const copy=this.host.element('button','Copy session identifier',null,panel);copy.type='button';copy.addEventListener('click',()=>navigator.clipboard.writeText(this.sessionId));
    const close=this.host.element('button','Close',null,panel);close.type='button';close.addEventListener('click',()=>this.dismissSession());
    requestAnimationFrame(()=>panel.classList.add('is-open'));
  }
}
