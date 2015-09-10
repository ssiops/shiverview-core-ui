var async = require('async');
var bower = require('bower');
var cluster = require('cluster');
var exec = require('child_process').exec;
var fs = require('fs');
var q = require('q');
var util = require('util');
var uglify = require('uglify-js');
var wiredep = require('wiredep');
var less = require('less');

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
  this.tests = require('./tests/index.js');
  return this;
}

var app = new App();

App.prototype.init = function (srv, callback) {
  var self = this;
  self.srv = srv;
  return callback();
};

App.prototype.finally = function (callback) {
  var self = this;
  self.srv.cache = new Cache();
  self.srv.cache.init(self.srv.manager.apps);
  if (cluster.isWorker)
    return callback();
  self.installBowerDep()
  .then(function () {
    self.injectDep();
    return self.injectNgMod();
  }, function (err) {
    return callback(err)
  })
  .then(function () {
    return self.injectRoutes();
  }, function (err) {
    return callback(err)
  })
  .then(function () {
    return self.minify();
  }, function (err) {
    return callback(err)
  })
  .then(function () {
    return self.compileCss();
  }, function (err) {
    return callback(err)
  })
  .then(function () {
    return callback();
  }, function (err) {
    return callback(err)
  });
};

App.prototype.installBowerDep = function () {
  var self = this;
  var d = q.defer();
  if (process.env.verbose) console.log('Building list of bower dependencies.');
  var bowerDeps = self.bower.dependencies;
  var bowerDepsList = [];
  for (var app in self.srv.manager.apps) {
    if (self.srv.manager.apps[app].bower && self.srv.manager.apps[app].bower.dependencies) {
      for (var dep in self.srv.manager.apps[app].bower.dependencies) {
        if (typeof bowerDeps[dep] !== 'undefined')
          continue;
        bowerDeps[dep] = self.srv.manager.apps[app].bower.dependencies[dep];
      }
    }
  }
  for (var name in bowerDeps) {
    if (repoPatt.test(bowerDeps[name]))
      bowerDepsList.push(bowerDeps[name]);
    else
      bowerDepsList.push(name + '#' + bowerDeps[name]);
  }
  if (bowerDepsList.length > 0) {
    if (process.env.verbose) console.log('Installing bower dependencies.');
    bower.commands.install(bowerDepsList, {save: false, forceLatest: true}).on('end', function (installed) {
      if (process.env.verbose) {
        console.log('Bower packages installed.');
        for (var pkg in installed)
          console.log('Installed', installed[pkg].pkgMeta.name, installed[pkg].pkgMeta.version);
      }
      return d.resolve();
    });
  } else {
    if (process.env.verbose) console.log('No bower dependency is required.');
    d.resolve();
  }
  return d.promise;
};

App.prototype.injectDep = function () {
  var self = this;
  if (process.env.verbose) console.log('Injecting bower dependencies.');
  wiredep({
    directory: process.cwd() + '/static/components',
    bowerJson: self.bower,
    src: [process.cwd() + '/static/index.html'],
    cwd: process.cwd(),
    dependencies: true,
    exclude: ['es5-shim', 'json3', 'bootstrap.js', 'jquery']
  });
  if (process.env.verbose) console.log('Bower dependencies injected.');
};

App.prototype.injectNgMod = function () {
  var self = this;
  var d = q.defer();
  var ngMods = ['ui.bootstrap', 'ngProgress', 'ngAnimate', 'ngRoute', 'ngTouch'];
  if (process.env.verbose) console.log('Building angular module dependencies.');
  for (var app in self.srv.manager.apps) {
    if (self.srv.manager.apps[app].ui && self.srv.manager.apps[app].ui.ngmod) {
      for (var i = 0; i < self.srv.manager.apps[app].ui.ngmod.length; i++) {
        if (ngMods.indexOf(self.srv.manager.apps[app].ui.ngmod[i]) >= 0)
          continue;
        ngMods.push(self.srv.manager.apps[app].ui.ngmod[i]);
      }
    }
  }
  if (process.env.verbose) console.log('Injecting angular module dependencies.');
  fs.readFile(process.cwd() + '/static/js/application.js', 'utf-8', function (err, content) {
    var patt = /\/\*<!-- Ng Mod Inject\*\/.*\/\*--!>\*\//;
    var replace = '[\'' + ngMods.join('\', \'') + '\']';
    if (err) d.reject(err);
    if (typeof content === 'string') {
      var result = content.replace(patt, replace);
      fs.writeFile(process.cwd() + '/static/js/application.js', result, 'utf-8', function (err) {
        if (err) d.reject(err);
        else {
          if (process.env.verbose) console.log('Angular module injected.');
          d.resolve();
        }
      });
    } else d.reject(new Error('Content is not string.'));
  });
  return d.promise;
};

App.prototype.injectRoutes = function () {
  var self = this;
  var d = q.defer();
  var views = [];
  if (process.env.verbose) console.log('Building angular route list.');
  for (var app in self.srv.manager.apps) {
    if (self.srv.manager.apps[app].ui && self.srv.manager.apps[app].ui.views) {
      for (var path in self.srv.manager.apps[app].ui.views) {
        views.push({
          path: self.srv.manager.apps[app].path + path,
          url: self.srv.manager.apps[app].path + self.srv.manager.apps[app].ui.views[path].url,
          ctrl: self.srv.manager.apps[app].ui.views[path].ctrl
        });
      }
    }
  }
  if (process.env.verbose) console.log('Injecting angular routes.');
  fs.readFile(process.cwd() + '/static/js/application.js', 'utf-8', function (err, content) {
    var patt = /\/\*<!-- Ng Route Inject --!>\*\//;
    var template = '.when(\'%s\', {templateUrl: \'%s\', controller: \'%s\'})';
    var replace = '';
    for (var i = 0; i < views.length; i++)
      replace += util.format(template, views[i].path, views[i].url, views[i].ctrl);
    if (err) d.reject(err);
    if (typeof content === 'string') {
      var result = content.replace(patt, replace);
      fs.writeFile(process.cwd() + '/static/js/application.js', result, 'utf-8', function (err) {
        if (err) d.reject(err);
        else {
          if (process.env.verbose) console.log('Angular routes injected.');
          d.resolve();
        }
      });
    } else d.reject(new Error('Content is not string.'));
  });
  return d.promise;
}

App.prototype.minify = function () {
  var self = this;
  var d = q.defer();
  var files = [];
  if (process.env.verbose) console.log('Building list of application scripts.');
  for (var app in self.srv.manager.apps) {
    if (self.srv.manager.apps[app].ui && self.srv.manager.apps[app].ui.scripts) {
      var basepath = process.cwd() + '/static' + self.srv.manager.apps[app].path + '/';
      if (typeof self.srv.manager.apps[app].ui.scripts === 'string')
        files.push(basepath + self.srv.manager.apps[app].ui.scripts);
      else if (self.srv.manager.apps[app].ui.scripts instanceof Array)
        for (var i = 0; i < self.srv.manager.apps[app].ui.scripts.length; i++) {
          files.push(basepath + self.srv.manager.apps[app].ui.scripts[i]);
        }
    }
  }
  if (process.env.verbose) console.log('Minifying application scripts.');
  var appMin = uglify.minify([process.cwd() + '/static/js/application.js'], {
    outSourceMap: 'application.min.js.map'
  });
  var patt = /"sources".+"names"/;
  var appReplace = '"sources":["application.js"],"names"';
  var toWrite = [
    {
      path: process.cwd() + '/static/js/application.min.js',
      content: appMin.code
    },
    {
      path: process.cwd() + '/static/js/application.min.js.map',
      content: appMin.map.replace(patt, appReplace)
    }
  ];
  if (files.length > 0) {
    var ctrlMin = uglify.minify([process.cwd() + '/static/js/controllers.js'].concat(files), {
      outSourceMap: 'controllers.min.js.map'
    });
    var ctrlReplace = [];
    for (var l = 0; l < files.length; l++)
      ctrlReplace.push(files[l].replace(/^.*\/static/, ''));
    ctrlReplace = '"sources":["' + ctrlReplace.join('", "') + '"],"names"';
    toWrite.push({
      path: process.cwd() + '/static/js/controllers.min.js',
      content: ctrlMin.code
    });
    toWrite.push({
      path: process.cwd() + '/static/js/controllers.min.js.map',
      content: ctrlMin.map.replace(patt, ctrlReplace)
    });
  }
  if (process.env.verbose) console.log('Saving minified application scripts.');
  async.each(toWrite, function (item, callback) {
    fs.writeFile(item.path, item.content, callback);
  }, function (err) {
    if (err) d.reject();
    else {
      if (process.env.verbose) console.log('Minified application scripts saved.');
      d.resolve();
    }
  });
  return d.promise;
};

App.prototype.compileCss = function () {
  var self = this;
  var d = q.defer();
  var files = [];
  if (process.env.verbose) console.log('Building list of application stylesheets.');
  for (var app in self.srv.manager.apps) {
    if (self.srv.manager.apps[app].ui && self.srv.manager.apps[app].ui.less) {
      var basepath = process.cwd() + '/static' + self.srv.manager.apps[app].path + '/';
      if (typeof self.srv.manager.apps[app].ui.less === 'string')
        files.push(basepath + self.srv.manager.apps[app].ui.less);
      else if (self.srv.manager.apps[app].ui.less instanceof Array)
      for (var i = 0; i < self.srv.manager.apps[app].ui.less.length; i++) {
        files.push(basepath + self.srv.manager.apps[app].ui.less[i]);
      }
    }
  }
  if (files.length > 0) {
    var src = '';
    for (var j = 0; j < files.length; j++)
      src += fs.readFileSync(files[j]);
    less.render(src, {compress: true})
    .then(function (output) {
      fs.appendFileSync(process.cwd() + '/static/css/main.min.css', output.css);
      if (process.env.verbose) console.log('Application stylesheets compiled.');
      d.resolve();
    }, function (err) {
      d.reject(err);
    });
  } else {
    if (process.env.verbose) console.log('No application stylesheet found.');
    d.resolve();
  }
  return d.promise;
}

module.exports = app;
