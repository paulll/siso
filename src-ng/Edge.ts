import {Node} from "./Node";
import {Token} from "./Token";

export class Edge {
	public node: Node;
	public tokens: Token[];
	public confidence: number;

	constructor(node: Node, tokens: Token[], confidence: number) {
		this.node = node;
		this.tokens = tokens;
		this.confidence = confidence;
	}
}