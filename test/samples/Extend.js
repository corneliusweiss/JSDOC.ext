
Ext.ns('App.Package');

/**
 * Doc bloc above explicit constructor fn
 * 
 * @param {Object} config
 */
App.Package.ClassA = function(config) {
    
}

Ext.extend(App.Package.ClassA, Ext.Panel, {
    /**
     * @cfg cfg1
     * config var 1
     */
    
    /**
     * @cfg cfg2 config var 2
     */
    cfg2: 'cfg2',
    
    /**
     * a property
     * @type String
     */
    prop1: 'prop1',
    
    /**
     * 
     * @param {Number} arg1 argument 1
     * @param {String} arg2 argument 2
     */
    method: function(arg1, arg2) {
        
    }
});



App.Package.ClassB = function(config) {
    
}

/**
 * doc block above Ext.extend fn
 * @param {Object} config
 */
Ext.extend(App.Package.ClassB, Ext.Panel, {});



/**
 * 2 arguments form
 */
App.Package.ClassC = Ext.extend(Ext.Panel, {});