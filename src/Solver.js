//@flow

import {Token} from './Token'
import {Node} from './Node'
import {Context} from './Context'

const PriorityQueue = require('fastpriorityqueue');
const EventEmitter = require('eventemitter2');

const eq = <T>(a:Array<T>, b:Array<T>) => a.length === b.length && a.every(x => b.some(y => x === y));

interface Edge {
	node: Node,
	tokens: Array<Token>,
	confidence: number
}

class Solver extends EventEmitter {
	_nodes: Array<Node>;

	constructor() {
		super();
		this._nodes = [];
	}

	/**
	 *
	 * @param node
	 */
	registerNode(node: Node) {
		this._nodes.push(node);
	}

	/**
	 *
	 * @param data - context data
	 * @param initial_tokens - initial tokens
	 * @returns {Promise<void>}
	 */
	async solve(data: any, initial_tokens: Array<Token>) {
		let force_stop = false;

		const ctx: Context = {
			data, stop: () => void(force_stop = true)
		};

		const tokens: Map<string, Array<Token>> = new Map;
		const edges = new PriorityQueue<Edge>((a:Edge, b:Edge) => a.confidence - b.confidence);

		await this.addTokens(ctx, edges, tokens, initial_tokens);

		while (!edges.isEmpty() && !force_stop) {
			const edge = edges.poll();
			const new_tokens = await edge.node.process(ctx, edge.tokens);
			//console.log('running:', edge.tokens);
			if (new_tokens && Array.isArray(new_tokens)) {
				await this.addTokens(
					ctx, edges, tokens,
					new_tokens
				);
			}
		}

		return ctx.data;
	}

	async addTokens(
		ctx: Context,
		edges: PriorityQueue<Edge>,
		tokens: Map<string, Array<Token>>,
		new_tokens: Array<Token>
	) {

		for (let token of new_tokens) {
			const existing = tokens.get(token.type);
			if (existing)
				existing.push(token);
			else
				tokens.set(token.type, [token]);
		}

		/**
		 * For each $item in $new_tokens
		 *   search nodes[].supportedTypes[],
		 *     that contains of $item + $tokens
		 */
		for(let token of new_tokens) { // long
			for (let node of this._nodes) { // long
				for (let typeset of node.supportedTypes) { // short
					// if found typeset that contains at least one slot for $item
					if (!typeset.includes(token.type)) continue;

					const substitutions = [];
					for (let slot of typeset) {
						const found = tokens.get(slot);
						if (!found) break;
						substitutions.push(found);
					}

					if (substitutions.length === typeset.length) {
						for (let subst of cartesianProduct(substitutions)) {
							if (!subst.includes(token)) continue; // must include $item
							if ((new Set(subst)).size !== subst.length) continue; // if duplicates
							const confidence = await node.preprocess(ctx, subst);
							if (confidence) edges.add({
								node,
								tokens: subst,
								confidence: subst.reduce((a:number,b:Token) => a*b.confidence, 1) * confidence
							});
						}
					}
				}
			}
		}
	}
}

function cartesianProduct(arrays) {
	let current = new Array(arrays.length);
	return (function* backtracking(index) {
		if(index === arrays.length) yield current.slice();
		else for(let num of arrays[index]) {
			current[index] = num;
			yield* backtracking(index+1);
		}
	})(0);
}

exports.Solver = Solver;