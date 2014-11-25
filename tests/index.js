var q = require('q');
var request = require('request');

var baseurl = 'http://localhost:' + (process.env.port || 80);

module.exports = {
  '/routes': function (it) {
    var d = q.defer();
    it('should retrieve a list of routes', function () {
      request.get(baseurl + '/routes', function (err, res, body) {
        if (res.statusCode !== 200)
          return d.reject('got status code ' + res.statusCode);
        else {
          obj = JSON.parse(body.toString());
          if (!obj instanceof Array)
            return d.reject('got non-array ' + body);
          else
            return d.resolve();
        }
      });
    });
    return d.promise;
  },
  '/status': function (it) {
    var d = q.defer();
    it('should respond version and uptime', function () {
      request.get(baseurl + '/status', function (err, res, body) {
        if (res.statusCode !== 200)
          return d.reject('got status code ' + res.statusCode);
        else {
          obj = JSON.parse(body.toString());
          if (typeof obj.version === 'undefined' || typeof obj.uptime === 'undefined')
            return d.reject('version and/or uptime field not found in: ' + body);
          else
            return d.resolve();
        }
      });
    });
    return d.promise;
  }
};