export class Token {
	public impl: string[]; // instead of just type
	public data: Promise<any>; // LazyToken
	public relevance: number;

	constructor(impl: string[], data: any, relevance: number = 1) {
		this.impl = impl.slice();
		this.data = Promise.resolve(data);
		this.relevance = relevance;
	}
}