/** Browser-local Web OS dashboard. Values are explicitly scoped to this runtime. */
export class DashboardSystem {
  constructor(host){this.host=host;this.registry={constructor:{instances:[this],functions:{},nested:{},events:[]},render:{instances:[],functions:{},nested:{},events:[]}};}
  render(content){
    const e=(tag,text,cls,parent)=>this.host.element(tag,text,cls,parent);
    e('h2','Runtime Dashboard','dashboard-heading',content);
    e('p','Local runtime overview. Global visitor counts, verified accounts and host resource utilization require backend instrumentation.','dashboard-note',content);
    const grid=e('div',null,'dashboard-grid',content);
    const metric=(title,value,detail)=>{const card=e('section',null,'dashboard-card',grid);e('small',title,null,card);e('strong',String(value),null,card);e('p',detail,null,card);};
    const status=this.host.runtimeStatus.snapshot();
    metric('Logical cores',status.cores??'-','Reported by the browser, not CPU utilization');
    metric('RAM',status.ram,'JavaScript heap where exposed');
    metric('Reserved RAM',status.reservedRam,'Two 128 MiB logical budgets, not physical allocation');
    metric('Pools locally',status.ramPools,'Logical RAM pools in this browser runtime');
    metric('Pools globally','-','Requires server-side instrumentation');
    metric('Visitors','-','Global analytics not connected');
    metric('Logged in','-','Verified authentication not connected');
    metric('Background priority','25% idle target','Cooperative idle scheduling, not OS process priority');
    const actions=e('div',null,'dashboard-actions',content);
    for(const name of ['Plans','Tools','Services']){const button=e('button','Open '+name,null,actions);button.type='button';button.addEventListener('click',()=>this.host.webOS.open(name));}
    this.registry.render.events.push({time:Date.now(),metrics:8});
  }
}
