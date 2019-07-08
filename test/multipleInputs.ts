import {Executor} from "../src/Executor";
import {ProcessorNode} from "../src/nodes/ProcessorNode";
import {Token} from "../src/Token";

describe("Multiple inputs", () => {
	const executor = new Executor;
	test("should process each token", (done) => {
		for (let i = 0; i < 100; ++i) {
			executor.addNode({
				type: "ProcessorNode",
				input: [["L" + i, "R" + (i+100)]],
				process: async (ctx, [l, r]) => {
					const pos_l = (await l.data) + 1;
					const pos_r = (await r.data) + 1;

					expect(pos_r).toBe(pos_l + 100);

					return [
						new Token(["L" + pos_l], Promise.resolve(pos_l)),
						new Token(["R" + pos_r], Promise.resolve(pos_r)),
					];
				},
			} as unknown as ProcessorNode);
		}

		executor.addNode({
			type: "ProcessorNode",
			input: [["L100", "R200"]],
			process: (ctx, [l, r]) => done(expect(1).toBe(1)),
		} as unknown as ProcessorNode);

		executor.run([
			new Token(["L0"], Promise.resolve(0)),
			new Token(["R100"], Promise.resolve(100))
		]);
	});
});

