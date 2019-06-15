import {Context} from "./Context";
import {Edge} from "./Edge";
import {Token} from "./Token";

export abstract class Node {
	public abstract async _generateInputs(ctx: Context, tokens: Map<string, Token[]>, newTokens: Token[]): Promise<Edge[]>;
}