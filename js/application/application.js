(function (angular) {
var sv = document.sv = angular.module('shiverview', /*<!-- Ng Mod Inject*/['ui.bootstrap', 'ngProgress', 'ngAnimate', 'ngRoute', 'ngTouch']/*--!>*/);
sv.config(['$routeProvider', function ($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: '/views/index.html',
    controller: 'indexCtrl'
  })
  .when('/404', {
    templateUrl: '/views/404.html'
  })
  .when('/about', {
    templateUrl: '/views/about.html',
    controller: 'aboutCtrl'
  })
  /*<!-- Ng Route Inject --!>*/
  .otherwise({
    templateUrl: '/views/404.html'
  });
}]);
})(window.angular);
