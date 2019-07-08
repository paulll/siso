import {Executor} from "../src/Executor";
import {ProcessorNode} from "../src/nodes/ProcessorNode";
import {Token} from "../src/Token";

describe("Priority'", () => {
	const executor = new Executor;
	test("should visit nodes in right order", (done) => {
		let counter = 100;
		const step = (v) => {
			expect(v).toBe(counter-1);
			if (!--counter) done();
		};

		for (let i = 0; i < 100; ++i) {
			executor.addNode({
				type: "ProcessorNode",
				input: [["" + i]],
				process: async (ctx, [i]) => step(await i.data)
			} as unknown as ProcessorNode);
		}

		executor.run(Array(100).fill(0).map((x,i) => {
			return new Token(["0"], Promise.resolve(i), i);
		}));
	});

	// todo: test multipleInputs priority
});
