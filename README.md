# tree-generator
angular json tree generator and searcher

## INSTALL:
bower install

## DEMO:
https://rgurgul.github.io/tree-generator/

## USAGE

```
VIEW:
<tree-dctv></tree-dctv>
<input type="text"
       autofocus
       ng-model="search"
       ng-change="treeData.search(search)">
<span class="label label-danger">count: {{treeData.count}}</span>
<div ng-if="treeData.loading">loading...</div>

CONFIG:
.config(function (treeDataProvider) {
    treeDataProvider.options.itemsUrl = 'data/tree-2.json';
    /*
    you can override options:
    itemsUrl
    limit
    searchForKey
    delay
    treeTpl
    branchTpl
    */
})

CONTROLLER:
.controller('Ctrl', function ($scope, treeData) {
    $scope.treeData = treeData;
});
```