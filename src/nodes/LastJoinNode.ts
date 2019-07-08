import {Context} from "../Context";
import {Token} from "../Token";
import {Node} from "./Node";

export abstract class LastJoinNode extends Node {
	public type = "LastJoinNode";

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