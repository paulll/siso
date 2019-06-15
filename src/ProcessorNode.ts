import {Context} from "./Context";
import {Edge} from "./Edge";
import {Node} from "./Node";
import {Token} from "./Token";

export abstract class ProcessorNode extends Node {
	/**
	 * Possible input token sets.
	 *
	 * If any of these token combinations is found in current context,
	 * this will trigger the node
	 */
	protected input: string[][];

	/**
	 *
	 * Вызывается до обработки набора токенов, возвращает степень уверенности в том, что входные данные годятся [0,1]
	 * Меньше значение - меньше приоритет в очереди ребер. Если возвращен 0, ребро изымется из очереди и не будет
	 * обработано.
	 *
	 * @param ctx - current executor context
	 * @param tokens
	 */
	public abstract async preprocess(ctx: Context, tokens: Token[]): Promise<number>;

	/**
	 *
	 * Обрабатывает набор токенов, порождая новый набор.
	 * Собственно, основа всего
	 *
	 * @param ctx
	 * @param tokens
	 */
	public abstract async process(ctx: Context, tokens: Token[]): Promise<Token[]>;

	/**
	 *
	 * Порождает ребра входящие в данный узел для данных новых токенов.
	 * То есть, это вызывается при порождении любых новых токенов
	 *
	 * Самый главный и ресурсоемкий фрагмент. По идее можно было бы в тупую перебирать комбинации, и это
	 * даже работало бы на небольших объемах. Но в общем случае - ужас
	 *
	 * todo: понять как это оптимизировать или ускорить
	 * todo: поддержка сложных типов токенов
	 *
	 * @param ctx
	 * @param tokens
	 * @param newTokens
	 * @private
	 */
	public async _generateInputs(ctx: Context, tokens: Map<string, Token[]>, newTokens: Token[]): Promise<Edge[]> {
		/*
			На текущий момент работает так:
			для каждой this.input
				если в ней присутствует тип хотя бы одного нового токена
					генерируем все возможные подстановки для нее
					для каждой подставновки
						если в ней присутствует хотя бы один новый токен
							создаем ребро
		*/
		const newTokenTypes = new Set(newTokens.map((token) => token.type));
		const edges: Edge[] = [];
		for (const inputCombination of this.input) {
			if (inputCombination.every((slot) => !newTokenTypes.has(slot))) { continue; }

			const substitutions = [];
			for (const slot of inputCombination) {
				const found = tokens.get(slot);
				if (!found) { break; }
				substitutions.push(found);
			}

			if (substitutions.length === inputCombination.length) {
				for (const subst of cartesianProduct(substitutions)) {
					if (!subst.every((slot) => !newTokens.includes(slot))) { continue; } // must include $item
					if ((new Set(subst)).size !== subst.length) { continue; } // if duplicates
					const confidence = await this.preprocess(ctx, subst)
						* subst.reduce((a: number, b: Token) => a * b.confidence, 1);
					if (confidence) {
						const edge = new Edge(forceCast<Node>(this), subst, confidence);
						edges.push(edge);
					}
				}
			}
		}
		return edges;
	}
}

function cartesianProduct<T>(arrays: T[][]) {
	const current = new Array(arrays.length);
	return (function* backtracking(index) {
		if (index === arrays.length) { yield current.slice(); } else { for (const num of arrays[index]) {
			current[index] = num;
			yield* backtracking(index + 1);
		}}
	})(0);
}

function forceCast<T>(input: any): T {
	// @ts-ignore
	return input;
}
