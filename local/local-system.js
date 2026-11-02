/** Browser-local runtime scope; logical allocations are not physical RAM reservations. */
export class LocalSystem {
  constructor(host){this.host=host;this.registry={scope:{instances:[this],functions:{},nested:{},events:[]}};}
  snapshot(){return {scope:'local',available:true,execution:'browser',storage:'browser-managed',persistentServer:false};}
}
