"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ProcessorNode = void 0;

var _Edge = require("./Edge");

var _Node = require("./Node");

class ProcessorNode extends _Node.Node {
  /**
   * Possible input token sets.
   *
   * If any of these token combinations is found in current context,
   * this will trigger the node
   */

  /**
   *
   * Вызывается до обработки набора токенов, возвращает степень уверенности в том, что входные данные годятся [0,1]
   * Меньше значение - меньше приоритет в очереди ребер. Если возвращен 0, ребро изымется из очереди и не будет
   * обработано.
   *
   * @param ctx - current executor context
   * @param tokens
   */

  /**
   *
   * Обрабатывает набор токенов, порождая новый набор.
   * Собственно, основа всего
   *
   * @param ctx
   * @param tokens
   */

  /**
   *
   * Порождает ребра входящие в данный узел для данных новых токенов.
   * То есть, это вызывается при порождении любых новых токенов
   *
   * Самый главный и ресурсоемкий фрагмент. По идее можно было бы в тупую перебирать комбинации, и это
   * даже работало бы на небольших объемах. Но в общем случае - ужас
   *
   * todo: понять как это оптимизировать или ускорить
   * todo: поддержка сложных типов токенов
   *
   * @param ctx
   * @param tokens
   * @param newTokens
   * @private
   */
  async _generateInputs(ctx, tokens, newTokens) {
    /*
    	На текущий момент работает так:
    	для каждой this.input
    		если в ней присутствует тип хотя бы одного нового токена
    			генерируем все возможные подстановки для нее
    			для каждой подставновки
    				если в ней присутствует хотя бы один новый токен
    					создаем ребро
    */
    const newTokenTypes = new Set(newTokens.map(token => token.type));
    const edges = [];

    for (const inputCombination of this.input) {
      if (inputCombination.every(slot => !newTokenTypes.has(slot))) {
        continue;
      }

      const substitutions = [];

      for (const slot of inputCombination) {
        const found = tokens.get(slot);

        if (!found) {
          break;
        }

        substitutions.push(found);
      }

      if (substitutions.length === inputCombination.length) {
        for (const subst of cartesianProduct(substitutions)) {
          if (!subst.every(slot => !newTokens.includes(slot))) {
            continue;
          } // must include $item


          if (new Set(subst).size !== subst.length) {
            continue;
          } // if duplicates


          const confidence = (await this.preprocess(ctx, subst)) * subst.reduce((a, b) => a * b.confidence, 1);

          if (confidence) {
            const edge = new _Edge.Edge(forceCast(this), subst, confidence);
            edges.push(edge);
          }
        }
      }
    }

    return edges;
  }

}

exports.ProcessorNode = ProcessorNode;

function cartesianProduct(arrays) {
  const current = new Array(arrays.length);
  return function* backtracking(index) {
    if (index === arrays.length) {
      yield current.slice();
    } else {
      for (const num of arrays[index]) {
        current[index] = num;
        yield* backtracking(index + 1);
      }
    }
  }(0);
}

function forceCast(input) {
  // @ts-ignore
  return input;
}