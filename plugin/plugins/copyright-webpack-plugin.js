// 实现此插件的原因，是为了在生成资源到 output 目录之前，生成一个文件版权文件 copyright.txt
class CopyRightWebpackPlugin {
  constructor(options) {
    // options 是在 webpack.config.js 中配置此插件时传入的内容
    console.log(options, '这个插件被使用啦')
  }
  apply(compiler) {
    // compiler 就是webpack的一个实例，里面存放了配置和打包的所有内容
    // emit 是一个异步的时刻，代表生成资源到 output 目录之前的时刻， 所以需要使用 tapAsync
    compiler.hooks.emit.tapAsync('CopyRightWebpackPlugin', (compilation, cb)=> {
      // compilation 中存放的就是跟本次打包有关的内容
      // console.log(compilation.assets, '123123');
      compilation.assets['copyright.txt'] = {
        source: function() {
          return 'copyright by du'
        },
        size: function() {
          return 15
        }
      }
      cb();
    })
    // compile 是一个同步的时刻， 代表一个新的编译(compilation)创建之后，钩入(hook into) compiler， 使用方法 tap
    compiler.hooks.compile.tap('CopyRightWebpackPlugin', (compilation)=> {
      console.log('compile');
    })
  }
}

module.exports = CopyRightWebpackPlugin

// "scripts": {
//   "debug": "node --inspect --inspect-brk node_modules/webpack/bin/webpack.js",
//   "build": "webpack"
// }
// inspect 是指要开启 node 的调试工具
// --inspect-brk 是指在 webpack. js 文件的第一行打断点