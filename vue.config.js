const path = require('path')

module.exports = {
  lintOnSave: true,
  chainWebpack: config => {
    config.entry('app')
      .clear()
      .add('./src/js/main.js')
    config.resolve.alias
      .delete('@')
      .set('@', path.resolve(__dirname, 'src/js'))
      .set('%', path.resolve(__dirname, 'src/scss/modules'))
  }
}
