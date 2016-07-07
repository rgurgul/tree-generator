angular
    .module('app.treeGenerator', [])
    .directive('treeDctv', function (treeData) {
        return {
            templateUrl: treeData.treeTplUrl,
            scope: true,
            controller: function ($scope, treeData) {
                $scope.treeData = treeData;
                treeData.getItems();
            }
        }
    })
    .directive('branchDctv', function (treeData) {
        return {
            scope: {
                item: "=",
                config: "="
            },
            templateUrl: treeData.branchTplUrl,
            controller: function ($scope) {
                $scope.setActive = function () {
                    var paths = $scope.config;
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
        this.options = {
            itemsJsonUrl: 'data/tree-2.json',
            limit: 1000,
            searchForKey: "code",
            delay: 1000,
            treeTplUrl: 'tree.html',
            branchTplUrl: 'branch.html'
        };

        this.$get = function ($timeout, $http) {

            var timeoutId = null;
            var options = this.options;

            return {
                items: [],
                config: [],
                loading: false,
                count: 0,
                treeTplUrl: options.treeTplUrl,
                branchTplUrl: options.branchTplUrl,
                getItems: function () {
                    return $http
                        .get(options.itemsJsonUrl)
                        .success(function (response) {
                            this.setDefault();
                            this.items = response;
                        }.bind(this));
                },
                setDefault: function () {
                    this.config = [];
                    this.count = 0;
                },
                search: function (search) {
                    this.setDefault();
                    if (!search) {
                        return;
                    }
                    this.loading = true;
                    timeoutId && $timeout.cancel(timeoutId);
                    timeoutId = $timeout(function () {
                        this.searchTxt = search;
                        this.findPaths(this.items);
                        this.loading = false;
                    }.bind(this), options.delay);
                },
                findPaths: function (items, parent) {
                    items.forEach(function (item) {
                        item.path = [item.id];
                        parent && (item.path = item.path.concat(parent.path));
                        var found = item[options.searchForKey].startsWith(this.searchTxt);
                        if (found) {
                            item.path.reverse();
                            this.count++;
                            if (options.limit && this.config.length < options.limit) {
                                this.config.push(item.path);
                            }
                        }
                        if (item.subCategories.length) {
                            this.findPaths(item.subCategories, item);
                        }
                        delete item.path;
                    }, this);
                }
            };
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
    })
    .run(function ($templateCache) {

        $templateCache.put('tree.html', '\
            <li ng-repeat="item in treeData.items | opener:treeData.config"> \
                <branch-dctv item="item" config="treeData.config"></branch-dctv> \
            </li>');

        $templateCache.put('branch.html', '\
            <div class="label label-default" ng-class="{\'label-success\':setActive()}"> \
                {{item.code}} \
            </div> \
            <button ng-if="item.subCategories.length" ng-click="item.open = !item.open">switch </button>\
            <ul ng-if="item.open"> \
                <li ng-repeat="child in item.subCategories"> \
                    <branch-dctv item="child" config="config"></branch-dctv> \
                </li> \
            </ul>\
       ');

    });