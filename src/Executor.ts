import {Context} from "./Context";
import {EachJoinNode} from "./nodes/EachJoinNode";
import {LastJoinNode} from "./nodes/LastJoinNode";
import {Node} from "./nodes/Node";
import {ProcessorJoinNode} from "./nodes/ProcessorJoinNode";
import {ProcessorNode} from "./nodes/ProcessorNode";
import {Token} from "./Token";
import {pushOrSet} from "./util/pushOrSet";

/**
 * Представляет из себя набор узлов, задействованных в системе.
 * Разные экземпляры представляют собой разные, изолированные друг от
 * друга системы.
 */
export class Executor {
	private nodes: Node[]

	constructor() {
		this.nodes = [];
	}


	public addNode(node: Node) {
		this.nodes.push(node);

		/*switch (node.type) {
			case "processorNode": {
				const pn = node as ProcessorNode;
				for (const inputGroup of pn.input) {

					pushOrSet(this.processorTemplates)
				}
				break;
			}
			case "lastJoinNode": this.lastJoinNodes.push(node as LastJoinNode); break;
			case "processorJoinNode": this.processorJoinNodes.push(node as ProcessorJoinNode); break;
			case "eachJoinNode": this.eachJoinNodes.push(node as EachJoinNode); break;
		}*/
	}

	public run(initialTokens: Token[]): Context {
		const ctx = new Context(this.nodes);

		ctx.run(initialTokens).then( () => {
			// something
		});

		return ctx;
	}
}