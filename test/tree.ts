import {Executor} from "../src/Executor";
import {ProcessorNode} from "../src/nodes/ProcessorNode";
import {Token} from "../src/Token";

describe("Tree Test'", () => {
	const executor = new Executor;
	test("should visit every final node", (done) => {
		let counter = 100;
		const step = () => {
			if (!--counter) done();
		};

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

		for (let i = 0; i < 100; ++i) {
			executor.addNode({
				type: "ProcessorNode",
				input: [["" + i]],
				process: async (ctx, [i]) => step()
			} as unknown as ProcessorNode);
		}

		executor.run([new Token(["0"], Promise.resolve(0))]);
	});

	// todo: test priority order
	// todo: test multiple supported types ( [[a], [b] )
	// todo: test long supported types  ( [[a, b]] )
	// todo: test multiple emitted types
	// todo: test long types priority
});
