"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Context = void 0;

var _eventemitter = require("eventemitter2");

var _fastpriorityqueue = _interopRequireDefault(require("fastpriorityqueue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import {ProcessorNode} from "./ProcessorNode";

/**
 * Created for each `Executor.run` call.
 * Represents execution progress,
 * Consists of `Executor` instance and set of `Edge`s
 */
class Context extends _eventemitter.EventEmitter2 {
  constructor(executor) {
    super();
    this.tokens = new Map();
    this.edges = new _fastpriorityqueue.default((a, b) => a.confidence > b.confidence);
    this.executor = executor;
  }

  async run(initialTokens) {
    await this.addEdges(initialTokens);

    while (!this.edges.isEmpty()) {
      const edge = this.edges.poll();
      const newTokens = await forceCast(edge.node).process(this, edge.tokens);

      if (newTokens && Array.isArray(newTokens)) {
        await this.addEdges(newTokens);
      }
    }
  }
  /**
   *
   * todo: итерироваться по типам, а не по токенам
   * @param newTokens
   */


  async addEdges(newTokens) {
    for (const token of newTokens) {
      const existing = this.tokens.get(token.type);

      if (existing) {
        existing.push(token);
      } else {
        this.tokens.set(token.type, [token]);
      }
    }

    for (const node of this.executor.nodes) {
      for (const edge of await node._generateInputs(this, this.tokens, newTokens)) {
        this.edges.add(edge);
      }
    }
  }

}

exports.Context = Context;

function forceCast(input) {
  // @ts-ignore
  return input;
}