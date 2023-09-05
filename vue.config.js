'use strict'
const path = require('path')

function resolve(dir) {
  return path.join(__dirname, dir)
}

// gzip压缩
const CompressionWebpackPlugin = require('compression-webpack-plugin')
// 代码压缩
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')


// 是否为生产环境
const isProduction = process.env.NODE_ENV !== 'development'
// 本地环境是否需要使用cdn
const devNeedCdn = true
// cdn链接
const vueJS = isProduction ? '//cdn.staticfile.org/vue/2.6.11/vue.min.js' : '//cdn.staticfile.org/vue/2.6.11/vue.js'
const vuexJS = isProduction ? '//cdn.staticfile.org/vuex/3.5.1/vuex.min.js' : '//cdn.staticfile.org/vuex/3.5.1/vuex.js'
const vueRouterJS = isProduction ? '//cdn.staticfile.org/vue-router/3.4.3/vue-router.min.js' : '//cdn.staticfile.org/vue-router/3.4.3/vue-router.js'
const uiJS = isProduction ? '//cdn.staticfile.org/element-ui/2.14.0/index.min.js' : '//cdn.staticfile.org/element-ui/2.14.0/index.js'
const axiosJS = isProduction ? '//cdn.staticfile.org/axios/0.19.2/axios.min.js' : '//cdn.staticfile.org/axios/0.19.2/axios.js'
const cdn = {
  // cdn：模块名称和模块作用域命名（对应window里面挂载的变量名称）
  externals: {
    vue: 'Vue',
    vuex: 'Vuex',
    'vue-router': 'VueRouter',
    'element-ui': 'ELEMENT',
    'axios': 'axios'
  },
  // cdn的css链接
  css: [
    '//cdn.staticfile.org/element-ui/2.14.0/theme-chalk/index.css',
  ],
  // cdn的js链接
  js: [
    vueJS,vuexJS,vueRouterJS,uiJS,axiosJS
  ]
}

module.exports = {
  publicPath: './',   //基本路径
  outputDir: 'dist',  //打包输出目录
  assetsDir: 'static',    // 静态资源放置目录 相对于outputDir的目录
  // indexPath: 'index.html',    //html输出路径
  filenameHashing: false,    //文件名hash
  productionSourceMap: false,  //删除.map文件 加速生产环境构建
  lintOnSave: true,   // 保存时使用 ‘eslint-loader’ 进行检查 这个值会在 @vue/cli-plugin-eslint 被安装之后生效
  runtimeCompiler: false,  //是否使用包含运行时编译器的 Vue 构建版本
  devServer: {
    port: 8088,
    host: '0.0.0.0',
    open: true,
    hot: true,  // 是否启用模块的热替换功能，开启hot后，将在不刷新整个页面的情况下通过新模块替换老模块来做到实时预览
  },




  // 通过 webpack-merge 合并到最终的配置中
  configureWebpack: config => {
    // 用cdn方式引入，则构建时要忽略相关资源
    if (isProduction || devNeedCdn) config.externals = cdn.externals

    if (process.env.NODE_ENV === 'production') {
      return {
        plugins: [
          new CompressionWebpackPlugin({
            algorithm: 'gzip',//开启gzip
            test: /\.js$|\.html$|.\css/, // 匹配文件名
            threshold: 10240, // 对超过10k的数据压缩
            deleteOriginalAssets: false // 不删除源文件
          })
        ]
      }
    }

    config.optimization = {
      splitChunks: {
        cacheGroups: {
          vendor: {
            chunks: 'all',
            test: /node_modules/,
            name: 'vendor',
            minChunks: 1,
            maxInitialRequests: 5,
            minSize: 0,
            priority: 100
          },
          common: {
            chunks: 'all',
            test: /[\\/]src[\\/]js[\\/]/,
            name: 'common',
            minChunks: 2,
            maxInitialRequests: 5,
            minSize: 0,
            priority: 60
          },
          styles: {
            name: 'styles',
            test: /\.(sa|sc|c)ss$/,
            chunks: 'all',
            enforce: true
          },
          runtimeChunk: {
            name: 'manifest'
          }
        }
      }
    }
  },


  // 接收一个基于 webpack-chain 的 ChainableConfig 实例
  chainWebpack: config => {
    config.plugin('html').tap(args => {
      // 生产环境或本地需要cdn时，才注入cdn
      if (isProduction || devNeedCdn) args[0].cdn = cdn
      return args
    })
    if (process.env.NODE_ENV === 'production') {
      return {
        plugins: [
          new UglifyJsPlugin({
            uglifyOptions: {
              ie8: false,
              ecma: 8,
              warnings: false,
              compress: {
                drop_console: true,
                drop_debugger: false,
                pure_funcs: ['console.log']
              }
            }
          })
        ]
      }
    }
  },
}