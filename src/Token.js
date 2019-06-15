export class Token {
	confidence: number;
	path: Token<string>;
	type: string;
	data: any;

	constructor(type: string, data: any) {
		this.type = type;
		this.data = data;
		this.path = [];
		this.confidence = 1;
	}
}