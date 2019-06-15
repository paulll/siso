import {EventEmitter2} from "eventemitter2";
import FastPriorityQueue from "fastpriorityqueue";
import {Edge} from "./Edge";
import {Executor} from "./Executor";
import {ProcessorNode} from "./ProcessorNode";
import {Token} from "./Token";
// import {ProcessorNode} from "./ProcessorNode";

/**
 * Created for each `Executor.run` call.
 * Represents execution progress,
 * Consists of `Executor` instance and set of `Edge`s
 */
export class Context extends EventEmitter2 {
	private readonly executor: Executor;
	private readonly edges: FastPriorityQueue<Edge>;
	private readonly tokens: Map<string, Token[]>;

	constructor(executor: Executor) {
		super();

		this.tokens = new Map();
		this.edges = new FastPriorityQueue<Edge>((a, b) => a.confidence > b.confidence);
		this.executor = executor;
	}

	public async run(initialTokens: Token[]) {
		await this.addEdges(initialTokens);

		while (!this.edges.isEmpty()) {
			const edge = this.edges.poll();
			const newTokens = await forceCast<ProcessorNode>(edge.node).process(this, edge.tokens);
			if (newTokens && Array.isArray(newTokens)) {
				await this.addEdges(newTokens);
			}
		}
	}

	/**
	 *
	 * todo: итерироваться по типам, а не по токенам
	 * @param newTokens
	 */
	private async addEdges(newTokens: Token[]) {
		for (const token of newTokens) {
			const existing = this.tokens.get(token.type);
			if (existing) {
				existing.push(token);
			} else {
				this.tokens.set(token.type, [token]);
			}
		}

		for (const node of this.executor.nodes) {
			for (const edge of await node._generateInputs(this, this.tokens, newTokens)) {
				this.edges.add(edge);
			}
		}
	}

}


function forceCast<T>(input: any): T {
	// @ts-ignore
	return input;
}
