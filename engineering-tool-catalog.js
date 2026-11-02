/** Capability taxonomy and future implementation scopes; entries are not executable engines. */
export class EngineeringToolCatalog {
  constructor(host){
    this.host=host;
    this.registry={groups:{instances:[],functions:{},nested:{},events:[]}};
    this.groups=[
      {name:'Machine code & translation',tools:[
        ['Assembler',['Instruction sets and architectures','Assembly syntax and directives','Symbols, labels and relocations','Object files and linking','Macro assembly','Cross-assembly','Diagnostics and listings']],
        ['Disassembler',['Binary formats and sections','Instruction decoding','Linear sweep and recursive traversal','Symbols and control-flow graphs','Cross-architecture analysis','Data versus code detection','Annotated listings']],
        ['Compiler',['Lexical, syntax and semantic analysis','Intermediate representations','Type checking','Optimisation passes','Code generation and linking','Ahead-of-time and just-in-time compilation','Cross-compilation and diagnostics']],
        ['Decompiler',['Binary lifting to intermediate representation','Control-flow recovery','Type and variable inference','Pseudocode generation','Function and call-graph reconstruction','Symbol recovery','Limitations of source reconstruction']]]},
      {name:'Lexical & structural processing',tools:[
        ['Lexer',['Token rules and grammars','Unicode and encodings','Whitespace and comments','Token positions and spans','Streaming and incremental tokenisation','Error tokens and diagnostics']],
        ['Delexer',['Token-to-text reconstruction','Whitespace and formatting','Comments and trivia preservation','Escaping and quoting','Round-trip fidelity','Source maps']],
        ['Parser',['Grammar definitions','LL, LR and PEG strategies','Abstract and concrete syntax trees','Error recovery','Incremental parsing','Validation and diagnostics']],
        ['Transparser',['Grammar-to-grammar transformation','AST rewriting','Schema and format migration','Source maps and provenance','Semantic preservation checks','Round-trip validation']],
        ['Crossparser',['Multi-language syntax adapters','Shared intermediate representations','Dialect detection','Cross-format mapping','Ambiguity resolution','Interoperability tests']]]},
      {name:'Data transformation & diagnostics',tools:[
        ['Compressor',['Lossless algorithms and dictionaries','Streaming and block modes','Compression level and ratio','Checksums and integrity','Archive formats','Benchmarking and memory limits']],
        ['Decompressor',['Format and codec detection','Streaming extraction','Integrity and checksum verification','Resource and output-size limits','Corruption handling','Safe archive path validation']],
        ['Debugger',['Breakpoints and watchpoints','Step in, over and out','Call stacks and variable inspection','Memory and register views','Tracing and profiling','Exception handling','Remote debugging and source maps']]]}
    ];
    this.registry.groups.instances.push(...this.groups);
  }
  render(parent,selected=''){
    const section=this.host.element('section',null,'engineering-catalog',parent);
    this.host.element('h3','Engineering tool catalogue',null,section);
    this.host.element('p','Explore tool families and their logical capabilities. These are specifications for future engines, not working compilers, debuggers or binary analysis tools.',null,section);
    for(const group of this.groups){
      const category=this.host.element('details',null,'engineering-catalog-group',section);
      category.open=group.tools.some(([name])=>name===selected);
      this.host.element('summary',group.name.toUpperCase(),null,category);
      for(const [name,capabilities] of group.tools){
        const item=this.host.element('details',null,'engineering-catalog-tool',category);item.open=name===selected;
        this.host.element('summary',name.toUpperCase(),null,item);
        const list=this.host.element('ul',null,null,item);
        for(const capability of capabilities)this.host.element('li',capability,null,list);
      }
      category.addEventListener('toggle',()=>{if(category.open){for(const other of section.querySelectorAll('.engineering-catalog-group'))if(other!==category)other.open=false;}});
    }
    return section;
  }
}
