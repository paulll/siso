# Simple Solve

[![build:unknown](https://travis-ci.org/paulll/siso.svg?branch=master)](https://travis-ci.org/paulll/siso)
[![npm](https://img.shields.io/npm/v/@paulll/siso.svg)](https://npmjs.com@paulll/siso)
[![license:mit](https://img.shields.io/npm/l/@paulll/siso.svg)](https://github.com/paulll/siso/blob/master/LICENSE)

Фреймворк для автоматического анализа чего бы то ни было. Изначально 
задумывался для автоматического решения CTF-задач.

## Принцип

В основном похож на [Dataflow Programming](https://ru.wikipedia.org/wiki/Программирование_потоков_данных),
но в данном случае мы оперируем единичными неизменяемыми единицами данных, а не их потоками, а 
"дуги" составляются автоматически в реальном времени, и не могут быть опредены заранее. Позаимствуем
терминологию:

- __Узел__ - черный ящик, принимающий на вход одни данные и выдающий на выходе другие 
на основе входящих
- __Токен__ - единица данных, передаваемая между узлами. Помимо самих данных содержит 
так же информацию об их типе и показатель релевантности

На вход подается некоторый первоначальный набор токенов (обычно исходные данные для анализа),
затем система из узлов создает новые токены на основе существующих. 
Вновь появившиеся токены рассматриваются наравне с первоначальными, и так пока не будут обработаны
все токены.

Подобный принцип хорошо подходит для обработки данных, структура которых заранее неизвестна:
анализ социального графа; решение типовых ctf-задач, декомпозирующихся в более простые

## Пример

Рекурсивная распаковка Base64:

```typescript
import {ProcessorNode, Token, Executor, Context} from "@paulll/siso";

class Base64DecodeTextNode extends ProcessorNode {
  public input = [["string"]];
  public async process(ctx: Context, tokens: Token[]) {
    const data = await tokens[0].data;
    const decoded = Buffer.from(data, "base64");

    // Если data в действительности содержала лишь base64
    if (decoded.toString("base64") === data) {
      return [new Token(["string"], decoded.toString("utf8"), 1)];
    }
  }
}

const executor = new Executor();
executor.addNode(new Base64DecodeTextNode());

const ctx = executor.run([
  new Token(["string"], "U0dWc2JHOGdWMjl5YkdRaA==", 1),
]);

ctx.on("newToken", async (token: Token) => {
  console.log(await token.data);
});
```

Здесь мы имеем всего один узел, который принимает на вход строку, и при обнаружении в ней
base64-содержимого декодирует его, создавая новый токен. Новый токен поступает на вход 
того же узла, и так будет продолжаться, пока вся "матрешка" из base64 не декодируется.



