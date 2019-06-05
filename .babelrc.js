const config = {
  plugins: [
    "@babel/transform-runtime",
    ["@babel/proposal-decorators", {
      legacy: true
    }],
    "@babel/proposal-class-properties",
    "@babel/transform-async-to-generator",
    "@babel/proposal-async-generator-functions"
  ]
}

if (!process.env.BABEL_ESM) {
  config.plugins.push(
    "@babel/transform-modules-commonjs",
    ["babel-plugin-add-module-exports", {
      addDefaultProperty: true
    }]
  )
}

module.exports = config
