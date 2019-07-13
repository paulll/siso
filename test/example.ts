import {Context, Executor, ProcessorNode, Token} from "../src";

describe("readme example", () => {
	test("should execute example from readme", (done) => {
		class Base64DecodeTextNode extends ProcessorNode {
			public input = [["string"]];
			public async process(ctx: Context, tokens: Token[]) {
				const data = await tokens[0].data;
				const decoded = Buffer.from(data, "base64");
				if (decoded.toString("base64") === data) {
					return [new Token(["string"], decoded.toString("utf8"), 1)];
				}
			}
		}

		const executor = new Executor();
		executor.addNode(new Base64DecodeTextNode());

		const ctx = executor.run([
			new Token(["string"], "U0dWc2JHOGdWMjl5YkdRaA==", 1),
		]);

		ctx.on("newToken", async (token: Token) => {
			// console.log(await token.data);
			if (await token.data === "Hello World!") {
				done();
			}
		});
	});
});