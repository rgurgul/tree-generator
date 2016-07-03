angular
    .module('app.dataProvider', [])
    .service('dataProvider', function ($timeout, $http) {
        this.items = [];
        var timeoutId = null,
            limit = 10,
            searchForKey = "code",
            delayTime = 1000,
            config = {};

        this.init = function (callback) {
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
            return this.findEl(this.items);
        };

        this.findEl = function (items, parent) {
            items.forEach(function (item) {
                item.ids = [item.id];
                if (parent) item.ids = item.ids.concat(parent.ids);
                var found = item[searchForKey].indexOf(this.searchTxt);
                if (found > -1) {
                    item.ids.reverse();
                    config.count++;
                    if (limit && config.paths.length < limit) {
                        config.paths.push(item.ids);
                    }
                }
                if (item.subCategories.length) {
                    this.findEl(item.subCategories, item);
                }
            }, this);
            return config;
        };
    })
    .filter('opener', function () {
        var result;
        var oldConfig;
        return function (items, config) {
            if (
                items
                && items.length
                && config
                && !angular.equals(config, oldConfig)
            ) {
                oldConfig = angular.copy(config);
                result = angular.copy(items);
                config.forEach(function (ids) {
                    var currentNode = result;
                    ids.forEach(function (id) {
                        if (id) {
                            var elFound = _.findWhere(currentNode, {id: id});
                            if (elFound) {
                                currentNode = elFound.subCategories;
                                elFound.open = true;
                            }
                        }
                    });
                });
                console.log(config);
            }
            return result;
        }
    });