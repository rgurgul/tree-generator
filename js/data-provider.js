angular
    .module('app.dataProvider', [])
    .service('dataProvider', function ($timeout, $http) {
        this.items = [];
        var timeoutId = null,
            limit = 1000,
            searchForKey = "code",
            delayTime = 1000,
            config;

        this.getItems = function (callback) {
            return $http
                .get('data/tree-2.json')
                .success(function (response) {
                    this.items = response;
                    callback(this.items);
                }.bind(this));
        };

        this.setDefault = function () {
            return {
                paths: [],
                count: 0
            };
        };

        this.delay = function (callback) {
            timeoutId && $timeout.cancel(timeoutId);
            timeoutId = $timeout(function () {
                callback();
            }, delayTime);
        };

        this.search = function (search) {
            config = this.setDefault();
            this.searchTxt = search;
            return this.findPaths(this.items);
        };

        this.findPaths = function (items, parent) {
            items.forEach(function (item) {
                item.path = [item.id];
                parent && (item.path = item.path.concat(parent.path));
                var found = item[searchForKey].startsWith(this.searchTxt);
                if (found) {
                    item.path.reverse();
                    config.count++;
                    if (limit && config.paths.length < limit) {
                        config.paths.push(item.path);
                    }
                }
                if (item.subCategories.length) {
                    this.findPaths(item.subCategories, item);
                }
            }, this);
            return config;
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