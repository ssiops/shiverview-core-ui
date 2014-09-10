(function (angular) {
angular.module('shiverview')
.controller('indexCtrl', ['$scope', function ($scope) {
  $scope.message = 'Hello World!';
  $scope.date = new Date().toString();
}]);
})(window.angular);
