const proxy = require("http-proxy-middleware")

module.exports = app => {
  app.use('/ws/message', proxy.createProxyMiddleware({target: "http://localhost:5000", ws: true}))
}