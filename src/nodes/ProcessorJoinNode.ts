import {Context} from "../Context";
import {Token} from "../Token";
import {Node} from "./Node";

export abstract class ProcessorJoinNode extends Node {

	public type = "ProcessorJoinNode";

	/**
	 * Possible input token sets.
	 *
	 * If any of these token combinations is found in current context,
	 * this will trigger the node
	 */
	public input: string[][];

	/**
	 * Существующие токены этого типа будут так же переданы в .process()
	 */
	public joinTokenType: string;

	/**
	 *
	 * Обрабатывает набор токенов, порождая новый набор.
	 * Собственно, основа всего
	 *
	 * @param ctx
	 * @param tokens
	 * @param joinTokens
	 */
	public abstract async process(ctx: Context, tokens: Token[], joinTokens: Token[]): Promise<Token[]>;
}
