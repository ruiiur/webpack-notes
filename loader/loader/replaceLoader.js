// 在项目中，如果需要对源代码进行一些包装，可以考虑使用 loader
// 编写一个loader时不能使用箭头函数, 因为 webpack 在调用 loader 的时候， 会把 this 进行变更，变更之后，就可以在 loader 里面使用 this 的一些方法。
const loaderUtils = require('loader-utils');
module.exports =  function (source) {
  // source 代表 loader 要处理的文件源代码，最后 return 出去的是处理好的文件代码
  // this.query 代表 配置 loader 时 options 中配置的内容
  // return source.replace('World', this.query.name);
  // 也可以使用另一种方法
  const options = loaderUtils.getOptions(this);
  return source.replace('World', options.name);
}