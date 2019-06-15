//@flow

import {Token} from './Token'

export interface Node {
	supportedTypes: Array<Array<string>>,
	preprocess: (context: any, vectors: Array<Token>) => Promise<number>,
	process: (context: any, vectors: Array<Token>) => Promise<Array<Token>>
}
