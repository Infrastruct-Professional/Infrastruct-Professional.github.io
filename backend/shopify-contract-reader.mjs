/** Fetches a Shopify subscription contract as untrusted data until independently verified. */
export class ShopifyContractReader {
  constructor({client}={}){
    if(!client||typeof client.executeRead!=='function')throw new Error('Authenticated Shopify Admin client required');
    this.client=client;
    this.registry={queries:{instances:[],functions:{},nested:{},events:[]}};
  }
  async fetch(contractId){
    if(typeof contractId!=='string'||!/^gid:\/\/shopify\/SubscriptionContract\/[1-9][0-9]*$/.test(contractId))throw new Error('Invalid Shopify subscription contract ID');
    const query=`query SubscriptionContractRead($id: ID!) {
      subscriptionContract(id: $id) {
        id status
        customer { id }
        lines(first: 10) { edges { node { id productId } } pageInfo { hasNextPage } }
      }
    }`;
    const data=await this.client.executeRead(query,{id:contractId});
    const item=data?.subscriptionContract;
    if(!item||item.id!==contractId||typeof item.customer?.id!=='string'||typeof item.status!=='string'||!Array.isArray(item.lines?.edges)||item.lines.pageInfo?.hasNextPage!==false)throw new Error('Incomplete Shopify subscription contract');
    const lines=item.lines.edges.map(edge=>({productId:edge?.node?.productId}));
    if(lines.length!==1||typeof lines[0].productId!=='string')throw new Error('Unsupported Shopify contract lines');
    this.registry.queries.instances.push({contractId,operation:'read'});
    // No billing evidence or validUntil inferred from status: caller must verify independently.
    return {id:item.id,customerId:item.customer.id,status:item.status,lines};
  }
}
