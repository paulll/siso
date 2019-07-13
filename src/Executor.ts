import {Context} from "./Context";
import {Node} from "./nodes/Node";
import {Token} from "./Token";

/**
 * Представляет из себя набор узлов, задействованных в системе.
 * Разные экземпляры представляют собой разные, изолированные друг от
 * друга системы.
 */
export class Executor {
	private readonly nodes: Node[];

	constructor() {
		this.nodes = [];
	}

	public addNode(node: Node) {
		this.nodes.push(node);
	}

	public run(initialTokens: Token[]): Context {
		const ctx = new Context(this.nodes);

		ctx.run(initialTokens).then( () => {
			// something
		});

		return ctx;
	}
}