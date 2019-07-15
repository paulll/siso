import {product} from "cartesian-product-generator";
import {EventEmitter2} from "eventemitter2";
import FastPriorityQueue from "fastpriorityqueue";

import {Edge} from "./Edge";
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
 *
 * events:
 *  - newEdge
 *  - processedEdge
 *  - newToken
 */
export class Context extends EventEmitter2 {

	public readonly data: object;

	private readonly processorTemplates: Map<string, Array<{node: ProcessorNode | ProcessorJoinNode, subst: Token[][], idx: number}>>;
	private readonly joinTemplates: Map<string, EachJoinNode[]>;
	private readonly lastJoins: LastJoinNode[];

	private readonly edges: FastPriorityQueue<Edge>;
	private readonly edgesDeDup: Set<string>;
	private readonly tokens: Map<string, Token[]>;
	private readonly nodeIds: WeakMap<Node, number>;
	private readonly tokenIds: WeakMap<Token, number>;
	private lastTokenId: number;

	constructor(nodes: Node[], data: object = {}) {
		super();

		this.tokens = new Map();
		this.edges = new FastPriorityQueue<Edge>((a, b) => a.confidence > b.confidence);
		this.data = data;

		this.processorTemplates = new Map();
		this.joinTemplates = new Map();
		this.lastJoins = [];
		this.edgesDeDup = new Set();
		this.nodeIds = new WeakMap();
		this.tokenIds = new WeakMap();
		this.lastTokenId = 0;

		let lastNodeId = 0;

		for (const node of nodes) {
			this.nodeIds.set(node, ++lastNodeId);

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
									if (idx === i) { return [""]; }
									return getOrCreate(this.tokens, t);
								}),
							});
						}
					}
					break;
				}
				case "LastJoinNode": {
					const ljn = node as LastJoinNode;
					this.lastJoins.push(ljn);
					break;
				}
				case "EachJoinNode": {
					const jn = node as EachJoinNode;
					pushOrSet(this.joinTemplates, jn.joinTokenType, jn);
					break;
				}
			}
		}
	}

	public async run(initialTokens: Token[]) {
		await this.addEdges(initialTokens);

		do {
			if (!this.edges.isEmpty()) {
				const edge = this.edges.poll();
				switch (edge.node.type) {
					case "ProcessorNode": {
						const node = edge.node as ProcessorNode;
						const newTokens = await node.process(this, edge.tokens);
						this.emit("processedEdge", edge);
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

			for (const ljn of this.lastJoins) {
				if (!this.edges.isEmpty()) { break; }
				const tokens = this.tokens.get(ljn.joinTokenType);
				const newTokens = await ljn.process(this, tokens);
				this.emit("processedEdge", new Edge(ljn, tokens, Number.EPSILON), newTokens);

				if (newTokens && Array.isArray(newTokens)) {
					await this.addEdges(newTokens);
				}
			}
		} while (!this.edges.isEmpty());
	}

	/**
	 * Генерирует новые ребра на основе вновь полученных токенов
	 *
	 * @param newTokens - вновь полученные токены
	 */
	private async addEdges(newTokens: Token[]) {

		// Регистрируем токены
		for (const token of newTokens) {
			this.emit("newToken", token);
			this.tokenIds.set(token, ++this.lastTokenId);
			for (const type of token.impl) {
				pushOrSet(this.tokens, type, token);
			}
		}

		// Для каждого токена для каждого его типа
		for (const token of newTokens) {
			for (const type of token.impl) {
				const template = this.processorTemplates.get(type) || [];
				for (const {node, subst, idx} of template) {
					for (const input of product(...subst)) {
						if (input.length !== subst.length) { continue; }
						input[idx] = token;

						const nodeId = this.nodeIds.get(node);
						const tokenIds = input.map((t) => this.tokenIds.get(t));
						const id = `${nodeId}#${tokenIds.join("-")}`;

						if (this.edgesDeDup.has(id)) {
							continue;
						}

						const edge = new Edge(node, input, input.reduce((a, b) => a * b.relevance, 1));

						this.edgesDeDup.add(id);
						this.edges.add(edge);
						this.emit("newEdge", edge);
					}
				}

				const jns = this.joinTemplates.get(type);
				if (jns) {
					for (const jn of jns) {
						const tokens = this.tokens.get(type);
						const nts = await jn.process(this, tokens);
						this.emit("processedEdge", new Edge(jn, tokens, Number.EPSILON));
						if (nts && Array.isArray(nts)) {
							await this.addEdges(nts);
						}
					}
				}
			}
		}
	}

}