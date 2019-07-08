import {Context} from "../src/Context";
import {Executor} from "../src/Executor";
import {EachJoinNode} from "../src/nodes/EachJoinNode";
import {LastJoinNode} from "../src/nodes/LastJoinNode";
import {ProcessorJoinNode} from "../src/nodes/ProcessorJoinNode";
import {ProcessorNode} from "../src/nodes/ProcessorNode";
import {Token} from "../src/Token";

class TestLastJoinNode extends LastJoinNode {
	public joinTokenType = "in";
	public async process(ctx: Context, tokens: Token[]) {
		return [new Token(["out"], Promise.resolve(tokens), 1)];
	}
}

class TestEachJoinNode extends EachJoinNode {
	public joinTokenType = "in";
	public async process(ctx: Context, tokens: Token[]) {
		return [new Token(["out"], Promise.resolve(tokens), 1)];
	}
}

class TestProcessorJoinNode extends ProcessorJoinNode {
	public joinTokenType = "in";
	public input = [["start"]];
	public async process(ctx: Context, tokens: Token[], joinTokens: Token[]) {
		return [new Token(["out"], Promise.resolve(tokens), 1)];
	}
}

describe("LastJoinNode", () => {
	test("should join", (done) => {
		const executor = new Executor();
		executor.addNode(new TestLastJoinNode());

		const ctx = executor.run([
			new Token(["in"], Promise.resolve(1), 1),
			new Token(["in"], Promise.resolve(2), 1),
			new Token(["in"], Promise.resolve(3), 1),
			new Token(["in"], Promise.resolve(4), 1),
		]);

		ctx.on("newToken", async (token: Token) => {
			const data = await token.data;
			if (token.impl.includes("out") && data.length === 4) {
				done();
			}
		});
	});
});

describe("EachJoinNode", () => {
	test("should join", (done) => {
		const executor = new Executor();
		executor.addNode(new TestEachJoinNode());

		let counter = 4;
		const step = () => {
			if (!--counter) done();
		}

		const ctx = executor.run([
			new Token(["in"], Promise.resolve(1), 1),
			new Token(["in"], Promise.resolve(2), 1),
			new Token(["in"], Promise.resolve(3), 1),
			new Token(["in"], Promise.resolve(4), 1),
		]);

		ctx.on("newToken", async (token: Token) => {
			const data = await token.data;
			if (token.impl.includes("out") ) {
				step();
			}
		});
	});
});

describe("ProcessorJoinNode", () => {
	test("should join", (done) => {
		const executor = new Executor();
		executor.addNode(new TestProcessorJoinNode());
		executor.addNode({
			type: "ProcessorNode",
			input: [["init"]],
			process: async (c, [i]) => [new Token(["start"], Promise.resolve(0), 1)],
		} as unknown as ProcessorNode);

		const ctx = executor.run([
			new Token(["in"], Promise.resolve(1), 1),
			new Token(["in"], Promise.resolve(2), 1),
			new Token(["in"], Promise.resolve(3), 1),
			new Token(["in"], Promise.resolve(4), 1),
			new Token(["init"], Promise.resolve(2), 1),
		]);

		ctx.on("newToken", async (token: Token) => {
			const data = await token.data;
			if (token.impl.includes("out")) {
				done();
			}
		});
	});
});