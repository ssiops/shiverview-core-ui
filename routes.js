var Cache = require('./lib/cache.js');
var cache = new Cache();

module.exports = [
  {
    url: '/routes',
    method: 'get',
    handler: function (req, res, srv) {
      if (typeof srv.manager.apps['shiverview-core-users'] === 'undefined') {
        res.send([{
          path: '/start',
          view: '/views/start.html',
          ctrl: 'startCtrl',
          scope: 'everyone'
        }]);
      }
    }
  }
]
