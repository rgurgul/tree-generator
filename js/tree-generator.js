angular
    .module('app.treeGenerator', [])
    .directive('treeDctv', function () {
        return {
            templateUrl: "tpls/tree-dctv.html",
            controller: function ($scope, treeData) {
                $scope.treeData = treeData;
                treeData.getItems();
            }
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
    })
    .provider('treeData', function () {

        // defaults. You can override it in config function
        this.itemsUrl = '';
        this.limit = 1000;
        this.searchForKey = "code";
        this.delay = 1000;

        this.$get = function ($timeout, $http) {

            var timeoutId = null;
            var itemsUrl = this.itemsUrl;
            var limit = this.limit;
            var searchForKey = this.searchForKey;
            var delay = this.delay;

            return {
                items: [],
                config: [],
                loading: false,

                getItems: function () {
                    return $http
                        .get(itemsUrl)
                        .success(function (response) {
                            this.setDefault();
                            this.items = this.items.concat(response);
                        }.bind(this));
                },
                setDefault: function () {
                    this.config = {
                        paths: [],
                        count: 0
                    };
                },
                search: function (search) {
                    if (!search) {
                        return;
                    }
                    this.loading = true;
                    timeoutId && $timeout.cancel(timeoutId);
                    timeoutId = $timeout(function () {
                        this.setDefault();
                        this.searchTxt = search;
                        this.findPaths(this.items);
                    }.bind(this), delay);
                },
                findPaths: function (items, parent) {
                    items.forEach(function (item) {
                        item.path = [item.id];
                        parent && (item.path = item.path.concat(parent.path));
                        var found = item[searchForKey].startsWith(this.searchTxt);
                        if (found) {
                            item.path.reverse();
                            this.config.count++;
                            if (limit && this.config.paths.length < limit) {
                                this.config.paths.push(item.path);
                            }
                        }
                        if (item.subCategories.length) {
                            this.findPaths(item.subCategories, item);
                        }
                    }, this);
                    this.loading = false;
                    return this.config;
                }
            }
        };
    })
    .filter('opener', function () {
        var itemsCopy;
        var oldConfig;
        return function (items, config) {
            if (
                items
                && items.length
                && config
                && !angular.equals(config, oldConfig)
            ) {
                oldConfig = angular.copy(config);
                itemsCopy = angular.copy(items);
                config.forEach(function (path) {
                    var currentNodes = itemsCopy;
                    path.forEach(function (id) {
                        if (id) {
                            var foundNode = _.findWhere(currentNodes, {id: id});
                            if (foundNode) {
                                currentNodes = foundNode.subCategories;
                                foundNode.open = true;
                            }
                        }
                    });
                });
            }
            return itemsCopy;
        }
    });