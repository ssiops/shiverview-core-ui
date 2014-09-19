(function (angular) {
angular.module('shiverview')
.controller('aboutCtrl', ['$scope', '$http', function ($scope, $http) {
  $http({
    url: '/status',
    method: 'get'
  })
  .success(function (data) {
    $scope.status = data;
    $scope.buildDate = new Date(new Date().getTime() - data.uptime * 1000);
  });
}]);
})(window.angular);
