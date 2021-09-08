// 需要定义一个方法，接收入口文件，并进行分析
const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser'); // 代码分析，解析出抽象语法树
const traverse = require('@babel/traverse').default; // 可以对分析出的抽象语法树进行遍历
const babel = require('@babel/core'); // 把 es6 的语法转化成 es5
// default 代表默认是 ES module的导出
const moduleAnalyser = (filename) => {
  const content = fs.readFileSync(filename, 'utf-8'); // 获取入口文件内容
  // 然后使用 @babel/parser 对获取的内容进行分析
  const ast = parser.parse(content, {
    sourceType: 'module' // 如果要分析的文件使用的是 ES module，便这样配置
  }); // 对文件进行分析
  // console.log(ast.program.body, 'ast.program.body'); // 抽象语法树
  // 再对分析出的对语法树进行遍历
  const dependencies = {};
  traverse(ast, {
    ImportDeclaration({ node }) { // 对 type 是 ImportDeclaration(引用声明) 的节点进行处理
      const dirname = path.dirname(filename);
      const newFilePath = './' + path.join(dirname, node.source.value)
      dependencies[node.source.value] = newFilePath;
    }
  }) // 遍历抽象语法树，得出依赖关系存在 dependencies 对象中，键是相对路径，值是绝对路径
  // console.log(dependencies);
  const { code } = babel.transformFromAstSync(ast, null, {
    presets: ["@babel/preset-env"]
  }) // 把这个模块的语法转成浏览器可以识别的语法
  // console.log(code, 'code');
  return {
    filename,
    dependencies,
    code
  }
}
// const moduleInfo = moduleAnalyser('./src/index.js');
// console.log(moduleInfo)

// 以上是对一个入口文件进行分析，怎么分析入口文件及其依赖，及其依赖的依赖
// 以下是 DependenciesGraph 依赖图谱
const makeDependenciesGraph = (entry) => {
  const entryModule = moduleAnalyser(entry);
  const graphArray = [entryModule];
  for (let i = 0; i < graphArray.length; i++) {
    const item = graphArray[i];
    const { dependencies } = item;
    if (dependencies) {
      for (j in dependencies) {
        graphArray.push(moduleAnalyser(dependencies[j]))
      }
    }
  }
  const graph = {};
  graphArray.forEach(item => {
    graph[item.filename] = {
      dependencies: item.dependencies,
      code: item.code
    }
  })
  return graph; // 这就是 DependenciesGraph ，也就是依赖图谱
}

// const graphInfo = makeDependenciesGraph('./src/index.js');
// console.log(graphInfo);

// 以下是生成代码的内容
const generateCode = (entry) => {
  const graph = JSON.stringify(makeDependenciesGraph(entry));
  return `
    (function(graph) {
      function require(module) {
        function localRequire(relativePath) {
          return require(graph[module].dependencies[relativePath]);
        }
        var exports = {};
        (function(require, exports, code){
          eval(code)
        })(localRequire, exports, graph[module].code)
        return exports;
      };
      require('${entry}')
    })(${graph});
  `;
}

const code = generateCode('./src/index.js');
console.log(code);