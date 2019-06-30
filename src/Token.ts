export class Token {
	public impl: string[]; // instead of just type
	public data: Promise<any>; // LazyToken
	public relevance: number;

	constructor(impl: string[], data: Promise<any>, relevance: number = 1) {
		this.impl = impl.slice();
		this.data = data;
		this.relevance = relevance;
	}
}