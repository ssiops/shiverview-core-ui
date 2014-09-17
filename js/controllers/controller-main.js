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
  $scope.$on('setProgress', function (e, arg) {
    if (arg === 0)
      ngProgress.start();
    else if (arg >= 100)
      ngProgress.complete();
    else if (arg < 0)
      ngProgress.reset();
    else
      ngProgress.set(arg);
  });
}])
.controller('headCtrl', ['$scope', '$http', function ($scope, $http) {
  $scope.css = [];
}])
.controller('bodyCtrl', ['$scope', '$http', function ($scope, $http) {

}])
.controller('navCtrl', ['$scope', '$http', '$location', '$swipe', function ($scope, $http, $location, $swipe) {
  $scope.$loc = $location;
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
        var left = [];
        var right = [];
        data.sort(function (a, b) {return a.index - b.index});
        for (var i = 0; i < data.length; i++) {
          if (data[i].position === 'right')
            right.unshift(data[i]);
          else
            left.push(data[i]);
        }
        $scope.navList = left;
        $scope.navListRight = right;
      }
    });
  };
  $scope.checkActive = function (input) {
    return $location.path().search(input) === 0;
  };
  $scope.drawerAnimated = true;
  $scope.drawer = document.getElementById('drawer');
  var startCoords = {};
  $swipe.bind(angular.element($scope.drawer), {
    start: function (coords, e) {
      startCoords = coords;
      $scope.$apply('drawerAnimated=false');
    },
    move: function (coords, e) {
      if (coords.x < startCoords.x)
        $scope.drawer.style.left = '-' + (startCoords.x - coords.x) + 'px';
    },
    end: function (coords, e) {
      $scope.$apply('drawerAnimated=true');
      if (startCoords.x - coords.x > 80)
        $scope.$apply('drawerActive=false');
      setTimeout(function () {
        $scope.drawer.removeAttribute('style');
      }, 200);
    }
  });
  $scope.toggleDrawer = function () {
    $scope.drawer.removeAttribute('style');
    $scope.drawerQuick = false;
    $scope.drawerActive = !$scope.drawerActive;
  };
  $scope.updateNav();
  $scope.$on('userStatusUpdate', $scope.updateNav);
}])
.controller('toastCtrl', ['$scope', function ($scope) {
  $scope.show = false;
  $scope.display = function (style, msg) {
    $scope.style = style;
    $scope.message = msg;
    $scope.show = true;
  };
  $scope.dismiss = function () {
    $scope.show = false;
  };
  $scope.$on('errorMessage', function (e, msg) {
    $scope.display('alert-danger', msg);
  });
  $scope.$on('warningMessage', function (e, msg) {
    $scope.display('alert-warning', msg);
  });
  $scope.$on('infoMessage', function (e, msg) {
    $scope.display('alert-info', msg);
  });
  $scope.$on('successMessage', function (e, msg) {
    $scope.display('alert-success', msg);
  });
}])
})(window.angular);
