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

(function (angular) {
angular.module('shiverview')
.controller('progressCtrl', ['$scope', 'ngProgressFactory', function ($scope, ngProgressFactory) {
  $scope.bar = ngProgressFactory.createInstance();
  $scope.bar.setColor('#0091bf');
  $scope.$on('$routeChangeStart', function (e) {
    $scope.bar.reset();
    $scope.bar.start();
  });
  $scope.$on('$routeChangeSuccess', function (e) {
    $scope.bar.complete();
  });
  $scope.$on('$routeChangeError', function (e) {
    $scope.bar.reset();
  });
  $scope.$on('setProgress', function (e, arg) {
    if (arg === 0)
      $scope.bar.start();
    else if (arg >= 100)
      $scope.bar.complete();
    else if (arg < 0)
      $scope.bar.reset();
    else
      $scope.bar.set(arg);
  });
}])
.controller('bodyCtrl', ['$scope', '$http', function ($scope, $http) {
  setTimeout(function () {
    $scope.initDone = true;
  }, 10);
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
    }).then(function (res) {
      if (res.data instanceof Array) {
        res.data.sort(function (a, b) {return a.index - b.index});
        $scope.navList = res.data;
      }
    });
  };
  $scope.checkActive = function (input) {
    if (typeof input === 'undefined') return false;
    return $location.path().search(input) === 0;
  };
  $scope.drawerAnimated = true;
  $scope.drawer = document.getElementById('drawer');
  var startCoords = {};
  $swipe.bind(angular.element($scope.drawer), {
    start: function (coords, e) {
      startCoords = coords;
    },
    move: function (coords, e) {
      var delta = startCoords.x - coords.x;
      if (delta > 10)
        $scope.$apply('drawerAnimated=false');
      if (delta > 0)
        $scope.drawer.style.left = '-' + (delta + Math.pow(1.5, delta/10 - 7)) + 'px';
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
    $scope.drawerAnimated = true;
    $scope.drawerActive = !$scope.drawerActive;
  };
  $scope.updateNav();
  $scope.$on('userStatusUpdate', $scope.updateNav);
  $scope.$on('$routeChangeStart', function () {
    $scope.drawerActive = false;
  });
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
