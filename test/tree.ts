const {Solver} = require("../lib/Solver");
const {Token} = require('../lib/Token');

describe('Tree Test', function () {
	it('should visit every final node', async function () {
		const solver = new Solver;
		const processed = await new Promise((done) => {
			let counter = 100;
			const step = () => {
				if (!--counter) done();
			};

			for (let i = 0; i < 100; ++i) {
				solver.registerNode({
					supportedTypes: [[''+i]],
					preprocess: () => 1,
					process: (ctx, [i]) => [new Token(''+(i.data+1),i.data+1)]
				});
			}

			for (let i = 0; i < 100; ++i) {
				solver.registerNode({
					supportedTypes: [[''+i]],
					preprocess: () => 1,
					process: (ctx, [i]) => step()
				});
			}

			solver.solve(0, [new Token('0',0)])
		});
	});

	// todo: test priority order
	// todo: test multiple supported types ( [[a], [b] )
	// todo: test long supported types  ( [[a, b]] )
	// todo: test multiple emitted types
	// todo: test long types priority
});