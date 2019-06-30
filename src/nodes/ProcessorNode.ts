import {Context} from "../Context";
import {Token} from "../Token";
import {Node} from "./Node";

export abstract class ProcessorNode extends Node {

	public type = "ProcessorNode";

	/**
	 * Possible input token sets.
	 *
	 * If any of these token combinations is found in current context,
	 * this will trigger the node
	 */
	public input: string[][];

	/**
	 *
	 * Обрабатывает набор токенов, порождая новый набор.
	 * Собственно, основа всего
	 *
	 * @param ctx
	 * @param tokens
	 */
	public abstract async process(ctx: Context, tokens: Token[]): Promise<Token[]>;
}
