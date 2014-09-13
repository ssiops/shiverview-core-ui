(function (angular) {
angular.module('shiverview')
.controller('indexCtrl', ['$scope', function ($scope) {
  $scope.message = 'Hello World!';
  $scope.date = new Date().toString();
}]);
})(window.angular);

(function (angular) {
angular.module('shiverview')
.controller('progressCtrl', ['$scope', 'ngProgress', function ($scope, ngProgress) {
  ngProgress.color('#0091bf');
  $scope.$on('$routeChangeStart', function (e) {
    ngProgress.reset();
    ngProgress.start();
  });
  $scope.$on('$routeChangeSuccess', function (e) {
    ngProgress.complete();
  });
  $scope.$on('$routeChangeError', function (e) {
    ngProgress.reset();
  });
}])
.controller('headCtrl', ['$scope', '$http', function ($scope, $http) {
  $scope.css = [];
}])
.controller('bodyCtrl', ['$scope', '$http', function ($scope, $http) {

}])
.controller('navCtrl', ['$scope', '$http', '$route', function ($scope, $http, $route) {
  $scope.$route = $route;
  $scope.collapsed = true;
  $scope.toggleCollapse = function () {
    $scope.collapsed = !$scope.collapsed;
  };
  $scope.updateNav = function () {
    $http({
      url: '/routes',
      method: 'get'
    }).success(function (data) {
      if (data instanceof Array) {
        data.sort(function (a, b) {return a.index - b.index});
        $scope.navList = data;
      }
    })
  };
  $scope.updateNav();
}])
})(window.angular);
