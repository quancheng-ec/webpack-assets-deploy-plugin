const { resolve } = require('path')
const { Wrapper } = require('ali-oss')
const { readdirSync, lstatSync, createReadStream } = require('fs')
module.exports = class WebpackAliOssPlugin {
  constructor(options) {
    this.options = options
    this.ossClient = new Wrapper({
      accessKeyId: options.accessKeyId,
      accessKeySecret: options.accessKeySecret,
      bucket: options.bucket,
      region: options.region
    })
    this.fileList = []
  }

  apply(compiler) {
    compiler.plugin('emit', (compilation, callback) => {
      this.fileList = Object.keys(compilation.assets).map(fileName => fileName)
      callback()
    })

    compiler.plugin('done', () => {
      Promise.all(
        this.fileList.map(file => {
          return this.ossClient.putStream(`${this.options.projectName}/${file}`, createReadStream(resolve(compiler.outputPath, file)))
        })
      )
        .then(console.log)
        .catch(console.error)
    })
  }
}
