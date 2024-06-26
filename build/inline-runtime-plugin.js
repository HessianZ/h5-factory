const {getHooks} = require("html-webpack-plugin");

/**
 * 将runtime.js内嵌到html
 * @author hessian
 * @since 2024/6/26
 */
class InlineRuntimePlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('InlineRuntimePlugin', (compilation) => {
      getHooks(compilation).alterAssetTagGroups.tapAsync(
        'InlineRuntimePlugin',
        (data, cb) => {
          const tags = [...data.headTags, ...data.bodyTags];
          tags.forEach(tag => {
            if (tag.tagName === 'script' && tag.attributes.src) {
              const scriptName = tag.attributes.src;
              if (/runtime\..*\.js$/.test(scriptName)) {
                const asset = compilation.assets[scriptName.replace(/^\//, '')];
                if (asset) {
                  tag.innerHTML = asset.source();
                  delete tag.attributes.src;
                }
              }
            }
          });
          cb(null, data);
        }
      );
    });

    // 删除内联后的资源
    compiler.hooks.emit.tapAsync('InlineRuntimePlugin', (compilation, callback) => {
      Object.keys(compilation.assets).forEach((assetName) => {
        if (/runtime\..*\.js$/.test(assetName)) {
          delete compilation.assets[assetName];
        }
      });
      callback();
    });
  }
}

module.exports = InlineRuntimePlugin;
