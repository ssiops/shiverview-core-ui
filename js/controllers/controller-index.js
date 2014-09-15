(function (angular) {
angular.module('shiverview')
.controller('indexCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {
  $scope.$rs = $rootScope;
  $scope.message = 'Hello World!';
  $scope.date = new Date().toString();
  $scope.broadcast = function (event, msg) {
    $rootScope.$broadcast(event, msg);
  };
}]);
})(window.angular);
