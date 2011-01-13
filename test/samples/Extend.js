
Ext.ns('App.Package');

/**
 * Doc bloc above explicit constructor fn
 * 
 * @author Cornelius Weiss <mail@corneliusweiss.de>
 * @param {Object} config
 */
App.Package.ClassA = function(config) {
    this.addEvents(
        /**
         * @event random
         * Fires randomly.
         * @param {App.Package.ClassA} a this.
         * @param {Number} num1 a random number.
         * @param {Number} num2 on other random number.
         */
         'random',
         /**
         * @event other
         * Fires at other times.
         * @param {App.Package.ClassA} a this.
         * @param {Number} num1 a random number.
         * @param {Number} num2 on other random number.
         */
         'other'
    );
}

Ext.extend(App.Package.ClassA, Ext.Panel, {
    /**
     * @cfg {String} cfg1
     * config var 1 without symbol
     */
    
    /**
     * @cfg {String} cfg2 
     * config var 2 with whitespace after name
     */
    cfg2: 'cfg2',
        
    /**
     * a property without propterty tag
     * @type String
     */
    prop1: 'prop1',
        
    /**
     * prop2 is so important
     *
     * @property prop2
     * @type String
     */
     prop2: 'prop2',
     
     prop3: 'prop3',
     
     //private
     prop4: 'private',
     
    /**
     * a method
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