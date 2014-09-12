var async = require('async');
var exec = require('child_process').exec;

var Cache = require('./lib/cache.js');

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
  self.srv = srv;
  var bowerDep = [];
  if (process.env.verbose) console.log('Installing bower dependencies.');
  for (var dep in self.bower.dependencies) {
    if (repoPatt.test(self.bower.dependencies[dep]))
      bowerDep.push(self.bower.dependencies[dep]);
    else
      bowerDep.push(dep + '#' + self.bower.dependencies[dep]);
  }
  var bower = exec(['bower', 'install', '--quiet', '--allow-root'].concat(bowerDep).join(' '));
  bower.on('close', function (code) {
    if (code !== 0) {
      var e = new Error('Failed to install bower dependencies.');
      e.data = bowerDep;
      return callback(e);
    }
    if (process.env.verbose && bowerDep.length > 0) console.log('Bower packages installed:\n' + bowerDep.join(' '));
    return callback();
  });
};

App.prototype.finally = function (callback) {
  var self = this;
  self.srv.cache = new Cache();
  self.srv.cache.init(self.srv.manager.apps);
  return callback();
};

module.exports = app;
