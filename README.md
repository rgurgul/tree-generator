# tree-generator
angular json tree generator and searcher

INSTALL:
bower install

-------------------

DEMO AND USAGE:
https://rgurgul.github.io/tree-generator/

-------------------

You can override options in config function

.config(function (treeDataProvider) {
            treeDataProvider.options.itemsUrl = 'data/tree-2.json';
        })
            
this.options = {
    itemsUrl: 'data/tree-2.json',
    limit: 1000,
    searchForKey: "code",
    delay: 1000,
    treeTpl: 'tree.html',
    branchTpl: 'branch.html'
};
        
