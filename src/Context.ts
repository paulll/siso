import {EventEmitter2} from "eventemitter2";
import FastPriorityQueue from "fastpriorityqueue";
import {product} from "cartesian-product-generator";

import {Edge} from "./Edge";
import {Executor} from "./Executor";
import {EachJoinNode} from "./nodes/EachJoinNode";
import {LastJoinNode} from "./nodes/LastJoinNode";
import {Node} from "./nodes/Node";
import {ProcessorJoinNode} from "./nodes/ProcessorJoinNode";
import {ProcessorNode} from "./nodes/ProcessorNode";
import {Token} from "./Token";

import {getOrCreate} from "./util/getOrCreate";
import {pushOrSet} from "./util/pushOrSet";


/**
 * Created for each `Executor.run` call.
 * Represents execution progress,
 * Consists of `Executor` instance and set of `Edge`s
 */
export class Context extends EventEmitter2 {

	//
	public processorTemplates: Map<string, Array<{node: ProcessorNode | ProcessorJoinNode, subst: Token[][], idx: number}>>;
	public eachJoinTemplates: Map<string, EachJoinNode>;

	private readonly edges: FastPriorityQueue<Edge>;
	private readonly tokens: Map<string, Token[]>;

	constructor(nodes: Node[]) {
		super();

		this.tokens = new Map();
		this.edges = new FastPriorityQueue<Edge>((a, b) => a.confidence > b.confidence);

		this.processorTemplates = new Map();
		this.eachJoinTemplates = new Map();

		for (const node of nodes) {
			switch (node.type) {

				// Генерируем для каждого типа шаблоны вида {узел, подстановка, позиция вставки}
				// это позволит затем моментально сгенерировать список ребер при получении нового токена
				case "ProcessorNode":
				case "ProcessorJoinNode": {
					const pn = node as ProcessorNode;
					for (const inputGroup of pn.input) {
						for (const [idx, type] of inputGroup.entries()) {
							pushOrSet(this.processorTemplates, type, {
								node, idx, subst: inputGroup.map((t, i) => {
									if (idx === i) { return ['']; }
									return getOrCreate(this.tokens, t);
								}),
							});
						}
					}
					break;
				}
				// ....case "eachJoinNode": pushOrSet(this.processorTemplates, , )
				// case "processorJoinNode": this.processorJoinNodes.push(node as ProcessorJoinNode); break;
				// case "eachJoinNode": this.eachJoinNodes.push(node as EachJoinNode); break;
			}
		}
	}

	public async run(initialTokens: Token[]) {
		await this.addEdges(initialTokens);

		//
		while (!this.edges.isEmpty()) {
			const edge = this.edges.poll();
			switch (edge.node.type) {
				case "ProcessorNode": {
					const node = edge.node as ProcessorNode;
					const newTokens = await node.process(this, edge.tokens);
					if (newTokens && Array.isArray(newTokens)) {
						await this.addEdges(newTokens);
					}
					break;
				}
				case "ProcessorJoinNode": {
					const node = edge.node as ProcessorJoinNode;
					const newTokens = await node.process(this, edge.tokens, this.tokens.get(node.joinTokenType));
					if (newTokens && Array.isArray(newTokens)) {
						await this.addEdges(newTokens);
					}
					break;
				}
			}
		}


	}

	/**
	 * Генерирует новые ребра на основе вновь полученных токенов
	 *
	 * @param newTokens - вновь полученные токены
	 */
	private async addEdges(newTokens: Token[]) {

		// Регистрируем токены
		for (const token of newTokens) {
			for (const type of token.impl) {
				const existing = this.tokens.get(type);
				if (existing) {
					existing.push(token);
				} else {
					this.tokens.set(type, [token]);
				}
			}
		}

		// Для каждого токена для каждого его типа
		for (const token of newTokens) {
			for (const type of token.impl) {
				const template = this.processorTemplates.get(type) || [];
				for (const {node, subst, idx} of template) {
					for (const input of product(subst)) {
						input[idx] = token;
						this.edges.add(new Edge(node, input, 1));
					}
				}
			}
		}
	}

}

function forceCast<T>(input: any): T {
	// @ts-ignore
	return input;
}
