function Cache() {
  this.everyone = [];
  this.users = [];
  this.admin = [];
  return this;
}

module.exports = Cache;

Cache.prototype.compile = function (scope) {
  var self = this;
  var pathPatt = /^\/.*$/;
  if (typeof self.compiled === 'undefined')
    self.compiled = {};
  var apps = [];
  for (var name in self[scope]) {
    var app = {
      name: name,
      index: self[scope][name].index
    }
    if (self[scope][name].position)
      app.position = self[scope][name].position;
    if (self[scope][name].href)
      app.href = self[scope][name].href;
    else {
      app.views = [];
      for (var path in self[scope][name]) {
        if (typeof self[scope][name][path].title === 'undefined')
          continue;
        if (pathPatt.test(path))
          app.views.push({
            path: path,
            title: self[scope][name][path].title
          });
        else app[path] = self[scope][name][path];
      }
    }
    apps.push(app);
  }
  self.compiled[scope] = apps;
};

Cache.prototype.update = function (apps) {
  this.everyone = {};
  this.users = {};
  this.admin = {};
  return this.init(apps);
};

Cache.prototype.get = function (scope) {
  var self = this;
  if (typeof scope === 'undefined' || scope === 'everyone') {
    return self.everyone;
  } else if (scope === 'users') {
    return self.users;
  } else if (scope === 'admin') {
    return self.admin;
  }
};

Cache.prototype.add = function (app) {
  var self = this;
  var routes = {};
  if (app.ui) {
    if (app.ui.views) {
      var tmp = {
        everyone: [],
        users: [],
        admin: []
      }
      for (var path in app.ui.views) {
        if (typeof app.ui.views[path].scope === 'undefined' || app.ui.views[path].title === 'undefined')
          continue;
        switch (app.ui.views[path].scope) {
          case 'everyone':
            tmp.everyone.push({
              path: app.path + path,
              title: app.ui.views[path].title
            });
            if (app.ui.views[path].exclusive)
              break;
          case 'users':
            tmp.users.push({
              path: app.path + path,
              title: app.ui.views[path].title
            });
            if (app.ui.views[path].exclusive)
              break;
          case 'admin':
            tmp.admin.push({
              path: app.path + path,
              title: app.ui.views[path].title
            });
            if (app.ui.views[path].exclusive)
              break;
        }
      }
      if (tmp.everyone.length > 0)
        self.everyone.push({
          base: app.path,
          icon: app.ui.icon,
          name: app.ui.navName,
          index: app.ui.index,
          views: tmp.everyone,
          position: app.ui.position
        });
      if (tmp.users.length > 0)
        self.users.push({
          base: app.path,
          icon: app.ui.icon,
          name: app.ui.navName,
          index: app.ui.index,
          views: tmp.users,
          position: app.ui.position
        });
      if (tmp.admin.length > 0)
        self.admin.push({
          base: app.path,
          icon: app.ui.icon,
          name: app.ui.navName,
          index: app.ui.index,
          views: tmp.admin,
          position: app.ui.position
        });
    }
    if (app.ui.href) {
      var link = {
        icon: app.ui.icon,
        name: app.ui.navName,
        index: app.ui.index,
        href: app.ui.href,
        position: app.ui.position
      };
      self.everyone.push(link);
      self.users.push(link);
      self.admin.push(link);
    }
  }
  return self;
};

Cache.prototype.init = function (apps) {
  var self = this;
  for (var app in apps) {
    self.add(apps[app]);
  }
  return self;
};
