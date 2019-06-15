"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Edge = void 0;

class Edge {
  constructor(node, tokens, confidence) {
    this.node = node;
    this.tokens = tokens;
    this.confidence = confidence;
  }

}

exports.Edge = Edge;