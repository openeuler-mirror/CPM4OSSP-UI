module.exports = {
  // 输出目录
  outputDir: 'mpms',
  // 控制静态资源使用相对路径
  publicPath: './',
  assetsDir: 'static',
  // 本地服务器
  devServer: {
    port: 8080,
    open: true
  },
  configureWebpack: {
    name: '系统软件安装管理平台',
    devtool: '#eval-source-map'
  },
  pluginOptions: {
    // electron构建时的插件
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        productName: 'mpms-system',
        electronDownload: {
          // mirror: 'http://172.30.31.77:8080/uploadfiles/electron/',
          customDir: 'v13.6.9'
        }
      },
      icon: 'build/icons/32x32.png',
      desktop: {
        Icon: 'build/icons/32x32.png'
      }
    }
  },
  // 系统打开时的标题
  chainWebpack: config => {
    config.plugin('html').tap(args => {
      args[0].title = '系统软件安装管理平台'
      args[0].build = new Date().getTime()
      return args
    })
  }
}
