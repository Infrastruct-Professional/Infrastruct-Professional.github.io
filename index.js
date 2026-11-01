class InfrastructProfessional {
  constructor() {
    this.registry = { constructor: { events: [] }, detect: { events: [] }, render: { events: [] }, audit: { events: [] } };
    this.environment = this.detect();
    this.render();
    this.audit();
  }
  detect() {
    const mobile = /Android|iPhone|Mobile/i.test(navigator.userAgent);
    const tablet = /iPad|Tablet/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && innerWidth >= 700);
    return { mode: mobile ? 'mobile' : tablet ? 'tablet' : 'desktop', browser: navigator.userAgent, viewport: [innerWidth, innerHeight] };
  }
  render() {
    const style = document.createElement('style');
    style.textContent = `:root{color-scheme:dark;font-family:Inter,system-ui,Arial,sans-serif;background:#08121e;color:#edf7ff}*{box-sizing:border-box}body{margin:0;min-height:100vh;background:radial-gradient(ellipse at 80% 8%,#153e60,transparent 50%),#08121e}header{display:flex;justify-content:space-between;align-items:center;padding:24px clamp(22px,6vw,100px);border-bottom:1px solid #ffffff19}header strong{letter-spacing:.2em;font-size:13px}header span{color:#55d7ff;font-size:12px}main{min-height:75vh;display:flex;flex-direction:column;justify-content:center;padding:55px clamp(22px,9vw,150px)}.eyebrow{letter-spacing:.4em;color:#59d7f8;font-size:12px;text-transform:uppercase}h1{font-size:clamp(50px,9vw,120px);letter-spacing:-.07em;line-height:.96;margin:20px 0 28px;max-width:1100px}h1 em{font-style:normal;color:#58cfff}p{font-size:clamp(17px,2vw,22px);line-height:1.6;color:#aabed1;max-width:640px}.line{width:78px;height:3px;background:#4ad3ff;margin-top:32px}footer{padding:25px clamp(22px,6vw,100px);color:#8097aa;font-size:12px;border-top:1px solid #ffffff19}svg{width:48px;height:48px;vertical-align:middle;margin-right:12px}@media(max-width:700px){header{padding:20px}main{min-height:72vh;padding:45px 24px}h1{font-size:clamp(46px,13vw,72px)}}`;
    document.head.append(style);
    const header = document.createElement('header');
    const mark = document.createElement('strong');
    mark.textContent = '⬡  INFRASTRUCT PROFESSIONAL';
    const status = document.createElement('span');status.textContent='INFRASTRUCTURE • SYSTEMS • ENGINEERING';
    header.append(mark,status);
    const main = document.createElement('main');
    const eyebrow=document.createElement('div');eyebrow.className='eyebrow';eyebrow.textContent='Technology & infrastructure';
    const heading=document.createElement('h1');heading.append('Building the ',Object.assign(document.createElement('em'),{textContent:'framework'}),' for what comes next.');
    const description=document.createElement('p');description.textContent='Infrastruct Professional develops modern infrastructure, engineering systems and digital foundations designed for tomorrow.';
    const line=document.createElement('div');line.className='line';main.append(eyebrow,heading,description,line);
    const footer=document.createElement('footer');footer.textContent='© '+new Date().getFullYear()+' Infrastruct Professional';
    document.body.append(header,main,footer);
  }
  async audit() {
    this.registry.audit.events.push({type:'initialized',timestamp:new Date().toISOString(),mode:this.environment.mode});
    // Optional browser-side webR analytics can be activated once index.R is connected.
  }
}
new InfrastructProfessional();
