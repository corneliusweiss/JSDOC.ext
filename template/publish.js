JSDOC.ext = JSDOC.ext || {};

JSDOC.ext.publish = {
    /**
     * @property symbolSet
     * @type JSDOC.SymbolSet
     */    
    symbolSet: null,
    
    /**
     * @property symbols
     * @type Array
     */
    symbols: null,
    
    /**
     * @property classes
     * @type Array
     */
    classes: null,
    
    /**
     * @property namespaces
     * @type Array
     */
    namespaces: null,
    
    isaClass: function($) {return ($.is("CONSTRUCTOR"))},
    
    beforePublish: function(symbolSet) {
        print('before publish');
        
        JSDOC.opt.D.title = JSDOC.opt.D.title || 'API Documentation';
        
        this.symbolSet = symbolSet;
        this.symbols = this.symbolSet.toArray();
        this.classes = this.symbols.filter(this.isaClass).sort(makeSortby("alias"));
        this.namespaces = this.getNamespaces();
        
    },
    
    afterPublish: function(symbolSet) {
        print('after publish');
        
        // build tree
        var docs = {
            classData: {"id":"apidocs","iconCls":"icon-docs","text":"API Documentation","singleClickExpand":true,
                "children": this.getTreeData()},
            icons: {}};
        
        IO.mkPath(publish.conf.outDir+"/output");
        IO.saveFile(publish.conf.outDir+'/output', 'tree.js', 'Docs = ' + Ext.encode(docs));
        
        // copy welcome
        IO.copyFile(JSDOC.opt.D.extdir+'docs/welcome.html', publish.conf.outDir);
        
        // copy resources
        IO.mkPath(publish.conf.outDir+'/resources');
        IO.copyRecursive(JSDOC.opt.D.extdir+'docs/resources', publish.conf.outDir+'/resources');
        
        // copy logo
        if (JSDOC.opt.D.logo) {
            IO.copyFile(JSDOC.opt.D.logo, publish.conf.outDir+'/resources');
        }
    },
    
    getAugments: function(cls) {
        var augments = cls && cls.augments ? cls.augments : [];
        if (augments.length) {
            var augmentsCls = this.classes.filter(function($){ return $.alias == augments[0].desc})[0];
            augments = augments.concat(this.getAugments(augmentsCls));
        }
        
        return augments;
    },
    
    /**
     * get namespace list
     * 
     * @return {Array}
     */
    getNamespaces: function() {
        var nss = Ext.unique(this.classes.filter(function(c) {return !!c.memberOf}).map(function(c){ return c.memberOf;}));
        return nss.map(function(ns,i,nss){
            var parent = '_global_',
                nsParts = ns.split('.');
                
            while(nsParts.pop()) {
                if (nss.indexOf(nsParts.join('.')) >= 0) {
                    parent = nsParts.join('.');
                    break;
                }
            }
                
            return {
                name: ns,
                parent: parent
            };
        })
    },
    
    /**
     * get tree data
     * 
     * @return {Array}
     */
    getTreeData: function() {
        var currentNS = arguments[0] ? arguments[0] : '_global_',
            subNSS = this.namespaces.filter(function(n) {return n.parent == currentNS;}),
            members = this.classes.filter(function(c) {return c.memberOf == currentNS;}),
            scope = this;
            
        // packages
        var cn = subNSS.map(function(ns) {
            return {
                id: ns.name,
                text: ns.name,
                iconCls: 'icon-pkg',
                cls: 'package',
                singleClickExpand: true,
                children: scope.getTreeData(ns.name)
            };
        });
        
        // classes
        cn = cn.concat(members.map(function(c) {
    //        print(Dumper.dump(c));
            return {
                id: c.alias,
                text: c.name,
                isClass: true,
                iconCls: 'icon-cls',
                cls: 'cls',
                leaf: true,
                href: 'symbols/' + c.alias + '.html'
            }
        }));
        
        return cn;
    },
    
    makeSignature: function(params) {
        var signature = [].concat(params).filter(function($) { return $.name.indexOf(".") == -1; }).map(function($) {
            return '<code>' + $.type + ' ' + $.name + '</code>';
        });
        
        return '(' + signature.join(', ') + ')';
    }
};

IO.copyRecursive = function(src, dest, depth) {
    var files = IO.ls(src, depth || 10);
    
    for (var i=0; i<files.length; i++) {
        var file = files[i].replace(src, dest),
            path = file.split('/');
    
        path.pop();
        path = path.join('/');
        
        IO.mkPath(path);
        IO.copyFile(files[i], path);  
    }
}

try {
    window = navigator = document = {userAgent: 'rhino', location: {protocol: ''}};
    load(JSDOC.opt.D.extdir+"src/ext-core/src/core/Ext.js");
    load(JSDOC.opt.D.extdir+"src/core/Ext-more.js");
    
    Ext.util = Ext.util || {};
    load(JSDOC.opt.D.extdir+"src/util/function.js");
    load(JSDOC.opt.D.extdir+"src/util/Format.js");
    load(JSDOC.opt.D.extdir+"src/ext-core/src/util/JSON.js");
    
    load(JSDOC.opt.t + '/Link.js');
} catch(e) {
    LOG.warn("Sorry, extdir doesn't seem to be a extjs source distibution.");
    LOG.warn("You need to specify an ExtJS dir with -D=\"extdir:/path/to/extjs\"."+e);
    quit();
}

load('templates/jsdoc/publish.js');
publish = Ext.createInterceptor(publish, JSDOC.ext.publish.beforePublish, JSDOC.ext.publish);
publish = Ext.createSequence(publish, JSDOC.ext.publish.afterPublish, JSDOC.ext.publish);