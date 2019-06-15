"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Executor = void 0;

var _Context = require("./Context");

class Executor {
  constructor() {
    this.nodes = [];
  }

  addNode(node) {
    this.nodes.push(node);
  }

  run(initialTokens) {
    const ctx = new _Context.Context(this);
    ctx.run(initialTokens).then(() => {// something
    });
    return ctx;
  }

}

exports.Executor = Executor;