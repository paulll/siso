import {Context} from "./Context";
import {Token} from "./Token";

export class Executor {
	public nodes: Node[];

	constructor() {
		this.nodes = [];
	}

	public addNode(node: Node) {
		this.nodes.push(node);
	}

	public run(initialTokens: Token[]): Context {
		const ctx = new Context(this);

		ctx.run(initialTokens).then( () => {
			// something
		});

		return ctx;
	}

}