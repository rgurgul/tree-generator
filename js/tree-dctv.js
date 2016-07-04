angular
    .module('app.treeDctv', [])
    .directive('treeDctv', function () {
        return {
            scope: {
                items: "=",
                config: "="
            },
            templateUrl: "tpls/tree-dctv.html"
        }
    })
    .directive('branchDctv', function () {
        return {
            scope: {
                item: "=",
                config: "="
            },
            templateUrl: "tpls/branch-dctv.html",
            controller: function ($scope) {
                $scope.setActive = function () {
                    var paths = $scope.config.paths;
                    if (paths && paths.length) {
                        return paths.some(function (path) {
                            if (path) {
                                var last = path[path.length - 1];
                                return last === $scope.item.id;
                            }
                        })
                    }
                }
            }
        }
    });