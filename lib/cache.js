function Cache() {
  this.everyone = {};
  this.users = {};
  this.admin = {};
  return this;
}

module.exports = Cache;

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
  if (app.ui && app.ui.views) {
    for (var path in app.ui.views) {
      if (app.ui.views[path].scope === 'everyone') {
        if (typeof self.everyone[app.ui.navName] === 'undefined') self.everyone[app.ui.navName] = {};
        self.everyone[app.ui.navName][path] = app.ui.views[path];
        if (typeof self.users[app.ui.navName] === 'undefined') self.users[app.ui.navName] = {};
        self.users[app.ui.navName][path] = app.ui.views[path];
        if (typeof self.admin[app.ui.navName] === 'undefined') self.admin[app.ui.navName] = {};
        self.admin[app.ui.navName][path] = app.ui.views[path];
      }
      if (app.ui.views[path].scope === 'users') {
        if (typeof self.users[app.ui.navName] === 'undefined') self.users[app.ui.navName] = {};
        self.users[app.ui.navName][path] = app.ui.views[path];
        if (typeof self.admin[app.ui.navName] === 'undefined') self.admin[app.ui.navName] = {};
        self.admin[app.ui.navName][path] = app.ui.views[path];
      }
      if (app.ui.views[path].scope === 'admin') {
        if (typeof self.admin[app.ui.navName] === 'undefined') self.admin[app.ui.navName] = {};
        self.admin[app.ui.navName][path] = app.ui.views[path];
      }
    }
    if (typeof self.everyone[app.ui.navName] !== 'undefined') self.everyone[app.ui.navName].index = app.ui.index;
    if (typeof self.users[app.ui.navName] !== 'undefined') self.users[app.ui.navName].index = app.ui.index;
    if (typeof self.admin[app.ui.navName] !== 'undefined') self.admin[app.ui.navName].index = app.ui.index;
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
