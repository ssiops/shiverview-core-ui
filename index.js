var async = require('async');
var spawn = require('child_process').spawn;

var repoPatt = /^[A-Za-z]+\/.+$/;

function App() {
  var manifest = require('./manifest.json');
  for (var prop in manifest) {
    this[prop] = manifest[prop];
  }
  this.routes = require('./routes.js');
  this.pkg = require('./package.json');
  this.bower = require('./bower.json');
  return this;
}

var app = new App();

App.prototype.init = function (srv, callback) {
  var self = this;
  srv.manager.server.on('ready', function () {
    if (process.env.verbose) console.log('Init bower for all applications.');
    var bowerDep = [];
    for (var app in srv.manager.apps) {
      if (srv.manager.apps[app].bower && srv.manager.apps[app].bower.dependencies) {
        for (var dep in srv.manager.apps[app].bower.denpendencies) {
          if (bowerDep.indexOf(dep) >= 0)
            continue;
          if (repoPatt.test(srv.manager.apps[app].bower.dependencies[dep]))
            bowerDep.push(srv.manager.apps[app].bower.dependencies[dep]);
          else
            bowerDep.push(dep + '#' + srv.manager.apps[app].bower.dependencies[dep]);
        }
      }
    }
    var bower = spawn('bower', ['install'].concat(bowerDep));
    bower.on('close', function (code) {
      if (code !== 0) {
        var e = new Error('Failed to install bower dependencies.');
        e.data = bowerDep;
        return callback(e);
      }
      if (process.env.verbose && bowerDep.length > 0) console.log('Bower packages installed:\n' + bowerDep.join(' '));
    });
  });
  return callback();
};

module.exports = app;
