/** Client-side encoding utilities. Media is never uploaded. */
export class EncodingService {
  constructor(host){this.host=host;this.registry={encoding:{instances:[],functions:{},nested:{},events:[]}};this.maxBytes=30*1024*1024;}
  el(tag,text,cls,parent){return this.host.element(tag,text,cls,parent);}
  download(blob,name){const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),3000);}
  mount(parent){
    const root=this.el('section',null,'encoding-service',parent);this.el('h3','Encoding Studio',null,root);
    this.el('p','Convert text, images and audio locally in your browser. Video encoding is available through supported browser recording formats. Files are not uploaded.',null,root);
    const selector=this.el('label','Content type',null,root),type=this.el('select',null,null,selector);
    for(const name of ['Text','Image','Audio','Video']){const option=this.el('option',name,null,type);option.value=name;}
    const area=this.el('div',null,'encoding-controls',root),status=this.el('p','Ready.','encoding-status',root);status.setAttribute('role','status');
    const setStatus=message=>{status.textContent=message;};
    const render=()=>{
      area.replaceChildren();const kind=type.value;
      if(kind==='Text'){
        const input=this.el('textarea',null,null,area);input.rows=5;input.placeholder='Enter text to encode';input.setAttribute('aria-label','Text input');
        const format=this.el('select',null,null,area);
        for(const name of ['Base64 encode (UTF-8)','Base64 decode (UTF-8)','URL encode','URL decode','HTML entity encode','UTF-8 file']){const opt=this.el('option',name,null,format);opt.value=name;}
        const output=this.el('textarea',null,null,area);output.rows=5;output.readOnly=true;output.setAttribute('aria-label','Encoded result');
        const run=this.el('button','Convert text',null,area);run.type='button';run.addEventListener('click',()=>{try{const value=input.value,mode=format.value;let result='';if(mode==='Base64 encode (UTF-8)')result=btoa(Array.from(new TextEncoder().encode(value),byte=>String.fromCharCode(byte)).join(''));else if(mode==='Base64 decode (UTF-8)')result=new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(atob(value),c=>c.charCodeAt(0)));else if(mode==='URL encode')result=encodeURIComponent(value);else if(mode==='URL decode')result=decodeURIComponent(value);else if(mode==='HTML entity encode')result=value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));else result=value;output.value=result;setStatus('Text conversion complete.');if(mode==='UTF-8 file')this.download(new Blob([result],{type:'text/plain;charset=utf-8'}),'encoded-text.txt');}catch(error){setStatus('Conversion failed: invalid input or unsupported encoding.');}});
      }else{
        const accept={Image:'image/*',Audio:'audio/*',Video:'video/*'}[kind],fileLabel=this.el('label','Choose '+kind.toLowerCase()+' file',null,area),fileInput=this.el('input',null,null,fileLabel);fileInput.type='file';fileInput.accept=accept;
        const format=this.el('select',null,null,area);
        const formats=kind==='Image'?[['image/png','PNG'],['image/jpeg','JPEG'],['image/webp','WebP']]:kind==='Audio'?[['audio/wav','WAV (PCM 16-bit)']]:[['video/webm','WebM (browser supported)']];
        for(const [value,label] of formats){const opt=this.el('option',label,null,format);opt.value=value;}
        const button=this.el('button','Encode '+kind.toLowerCase(),null,area);button.type='button';
        button.addEventListener('click',async()=>{const file=fileInput.files?.[0];if(!file){setStatus('Choose a file first.');return;}if(file.size>this.maxBytes){setStatus('File exceeds the 30 MB local processing limit.');return;}button.disabled=true;setStatus('Encoding locally…');try{
          if(kind==='Image')await this.image(file,format.value);
          else if(kind==='Audio')await this.audio(file);
          else await this.video(file);
          setStatus('Encoding complete. Download started.');this.registry.encoding.events.push({kind,success:true});this.host.audit('encoding_completed',{kind});
        }catch(error){setStatus('Encoding unavailable: '+error.message);}finally{button.disabled=false;}});
        if(kind==='Video')this.el('p','Video is re-recorded at playback speed using captureStream and MediaRecorder where supported. Audio tracks may not be retained; this is not a full transcoder.','encoding-note',area);
        if(kind==='Audio')this.el('p','WAV output is uncompressed 16-bit PCM. Large or long audio may exceed browser memory.','encoding-note',area);
      }
    };type.addEventListener('change',render);render();
  }
  async image(file,mime){const bitmap=await createImageBitmap(file);try{const canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;const ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas unavailable');ctx.drawImage(bitmap,0,0);const blob=await new Promise(resolve=>canvas.toBlob(resolve,mime,.9));if(!blob||blob.type!==mime)throw Error('Format not supported');this.download(blob,'encoded-image.'+({'image/png':'png','image/jpeg':'jpg','image/webp':'webp'}[mime]));}finally{bitmap.close();}}
  async audio(file){const context=new (window.AudioContext||window.webkitAudioContext)();try{const decoded=await context.decodeAudioData(await file.arrayBuffer());const channels=Math.min(decoded.numberOfChannels,2),rate=decoded.sampleRate,frames=decoded.length,bytes=44+frames*channels*2;if(bytes>150*1024*1024)throw Error('Output exceeds memory limit');const buffer=new ArrayBuffer(bytes),view=new DataView(buffer);const write=(offset,text)=>{for(let i=0;i<text.length;i++)view.setUint8(offset+i,text.charCodeAt(i));};write(0,'RIFF');view.setUint32(4,bytes-8,true);write(8,'WAVE');write(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,channels,true);view.setUint32(24,rate,true);view.setUint32(28,rate*channels*2,true);view.setUint16(32,channels*2,true);view.setUint16(34,16,true);write(36,'data');view.setUint32(40,bytes-44,true);const data=Array.from({length:channels},(_,i)=>decoded.getChannelData(i));let offset=44;for(let i=0;i<frames;i++)for(let c=0;c<channels;c++){const v=Math.max(-1,Math.min(1,data[c][i]));view.setInt16(offset,v<0?v*32768:v*32767,true);offset+=2;}this.download(new Blob([buffer],{type:'audio/wav'}),'encoded-audio.wav');}finally{await context.close();}}
  async video(file){if(!window.MediaRecorder||!HTMLVideoElement.prototype.captureStream)throw Error('Video capture encoding is not supported in this browser');if(!MediaRecorder.isTypeSupported('video/webm'))throw Error('WebM recording is not supported');const video=document.createElement('video');video.muted=true;video.playsInline=true;video.preload='auto';const url=URL.createObjectURL(file);video.src=url;try{await new Promise((resolve,reject)=>{video.onloadedmetadata=resolve;video.onerror=()=>reject(Error('Cannot decode video'));});if(!Number.isFinite(video.duration)||video.duration>120)throw Error('Video must be 2 minutes or shorter');const stream=video.captureStream();const recorder=new MediaRecorder(stream,{mimeType:'video/webm'}),chunks=[];recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};const finished=new Promise((resolve,reject)=>{recorder.onstop=resolve;recorder.onerror=()=>reject(Error('Recorder failed'));});recorder.start();await video.play();await new Promise((resolve,reject)=>{video.onended=resolve;video.onerror=()=>reject(Error('Playback failed'));});if(recorder.state!=='inactive')recorder.stop();await finished;stream.getTracks().forEach(track=>track.stop());this.download(new Blob(chunks,{type:'video/webm'}),'encoded-video.webm');}finally{video.pause();URL.revokeObjectURL(url);video.removeAttribute('src');video.load();}}
}
