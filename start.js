const forever = require('forever-monitor')

const child = new (forever.Monitor)('index.js', {
  max: 1,
  silent: false
})
child.start()
