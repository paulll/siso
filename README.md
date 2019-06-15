# Simple Solve
Automatically solve different classes of tasks 
just by implementing required submodules for task dataflow.

Basically, dynamic dataflow programming framework. Just like regular data flow framework,
but flows are constructed dynamically. 

## Structure
- Executor _of_ `Set<Node>`
- Context _of_ `Executor`, `Set<Edge>` _is_ `EventEmitter`
- Edge _of_ `Set<Token>`, `Node`
- Token _of_ `impl`, `data`, `confidence`, `path`
- Node _of_ `required`, `preprocess()`, `process()` 
- GeneratorNode _is_ `Node`
- ProcessorNode _is_ `Node`
- JoinNode _is_ `GeneratorNode`

## Todo:
- remove `data` from `Context`
- fire events on progress
- add `ProcessorNode` (that pushes data on process)
- add `GeneratorNode` (that generates data on demand)
- zero-input nodes support (useful for `GeneratorNode`)
- add `JoinNode` (input all existing tokens of same type, only last output actual)
- `Token.implements` field
- parallel computing support