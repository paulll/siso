import {Context} from "../src/Context";
import {Executor} from "../src/Executor";
import {ProcessorNode} from "../src/nodes/ProcessorNode";
import {Token} from "../src/Token";

describe("Straightforward Test", () => {
	const executor = new Executor;
	test("should process straightforward task graph", (done) => {
		for (let i = 0; i < 100; ++i) {
			executor.addNode({
				type: "ProcessorNode",
				input: [["" + i]],
				process: async (ctx, [i]) => {
					const pos = (await i.data) + 1 ;
					return [new Token(["" + pos], Promise.resolve(pos))];
				},
			} as unknown as ProcessorNode);
		}

		executor.addNode({
			type: "ProcessorNode",
			input: [["100"]],
			process: (ctx, [i]) => done(expect(1).toBe(1)),
		} as unknown as ProcessorNode);

		executor.run([new Token(["0"], Promise.resolve(0))]);
	});
});
