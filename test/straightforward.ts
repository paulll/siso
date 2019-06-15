import {ProcessorNode} from "../src-ng/ProcessorNode";

const {Executor} = require("../src-ng/Executor");
const {Token} = require('../lib/Token');

class StraightNode extends ProcessorNode {

}

describe('Straightforward Test', function () {
	const executor = new Executor;
	it('should process straightforward task graph', async function () {
		const processed = await new Promise((done) => {
			for (let i = 0; i < 100; ++i) {
				executor.addNode({
					supportedTypes: [[''+i]],
					preprocess: () => 1,
					process: (ctx, [i]) => [new Token(''+(i.data+1),i.data+1)]
				});
			}

			solver.registerNode({
				supportedTypes: [['100']],
				preprocess: () => 1,
				process: (ctx, [i]) => done()
			});

			solver.solve(0, [new Token('0',0)])
		});
	});
});

