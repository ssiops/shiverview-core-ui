# shiverview-core-ui

## Symposis

This module adds ui features to the website. The ui is based on angular single page web application schemes. Each application that wishes to use this module should have a ui field in its manifest.json.

## Manifest.json
```
{
  ...
  “ui”: {
    “icon”: “favicon.png”,
    “navName”: “Boilerplate”,
    “drawerName”: “Boilerplate”,
    “index”: 1,
    “views”: {
      “/”: {“url”: “/views/index.html”, “ctrl”: “indexCtrl”, “scope”: “everyone”, “title”: “Home”},
      “/foo”: {“url”: “/views/foo.html”, “ctrl”: “fooCtrl”, “scope”: “admin”}
    },
    “scripts”: [“/js/controllers.js”, “/js/ctrl/fooCtrl.js”],
    “ngmod”: [“ngTouch”]
  }
  ...
}
```
* `icon` - icon to be shown in ui
* `navName` - name to be shown in ui’s navigation
* `index` - position of this application when displayed in navigation
* `href` - url to this application; if set, views will be ignored
* `views` - Angular ngView properties
** `url`: templateUrl
** `ctrl`: name of the controller
** `scope`: which level of user can access this view
** `title`: name displayed in navigation; if not set, this view will not show in navigation.
** `exclusive`: if true, this view will only show in navigation of users with specified scope; otherwise this view will also be shown to users with higher level (eg. views with `scope: 'everyone'` will be shown in admin's navigation)
* `scripts` - scripts to be resolved when loading this app
* `ngmod` - required angular modules

## Using toast to display a message

Use `$rootScope.$broadcast()` to display a message with a toast. Listened events are: `errorMessage`, `warningMessage`, `infoMessage`, `successMessage`. They will display a toast with different styles.

Example:
```
$rootScope.$broadcast(‘errorMessage’, ‘Oops, an error has ocurred.’);
```

## Route cache

In front-end, navCtrl utilizes a http get request to /routes to acquire information to build the navigation drawer. This information come from the route cache, which is built in core-ui's `app.finally()`. When front-end sends a request, the server will determine user's scope (everyone, users, admin) and respond with corresponding info.

## Init procedure

`shiverview-core-ui` run a series of tasks when all applications have been loaded. Those tasks include:

* Initialize route cache
* Build a list of other apps’ bower dependencies and install (using the application's bower.json)
* Inject bower dependencies into index.html (using wiredep)
* Inject angular modules into application.js (using `manifest.json.ui.ngmod`)
* Inject route information into application.js (using `manifest.json.ui.views`)
* Acquire other apps’ controllers and rebuild minified script (using uglify-js)
