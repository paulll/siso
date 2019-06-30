import {Node} from "./Node";
import {Context} from "../Context";
import {Token} from "../Token";

export abstract class EachJoinNode extends Node {
	public type = "EachJoinNode";

	/**
	 * Существующие токены этого типа будут переданы в .process()
	 */
	public joinTokenType: string;

	/**
	 *
	 * Обрабатывает набор всех токенов заданного типа, порождая новый набор.
	 *
	 * @param ctx
	 * @param joinTokens
	 */
	public abstract async process(ctx: Context, joinTokens: Token[]): Promise<Token[]>;
}