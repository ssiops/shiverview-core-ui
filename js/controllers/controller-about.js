(function (angular) {
angular.module('shiverview')
.controller('aboutCtrl', ['$scope', '$http', function ($scope, $http) {
  $http({
    url: '/status',
    method: 'get'
  })
  .then(function (res) {
    $scope.status = res.data;
    $scope.buildDate = new Date(new Date().getTime() - res.data.uptime * 1000);
  });
}]);
})(window.angular);
