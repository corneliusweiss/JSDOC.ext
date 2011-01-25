
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
    
    Ext.applyIf(this, {
        /**
         * a method with Ext.applyIf in the constructor
         *
         * @param {Number} i some number
         * @return {String} some return string
         */
        constructorAppliedMethod: function(i) {
        }
    });
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
     * this should not be shown as it becomes overriden
     * @type String
     */
    prop5: 'prop5',
     
    /**
     * this should not be shown as it becomes overriden
     * 
     * @param {String} q
     */
    overriddenMethod: function(q)
    {
    
    },
    
    /**
     * a method
     *
     * @param {Number} arg1 argument 1
     * @param {String} arg2 argument 2
     */
    method: function(arg1, arg2) {
        
    }
    
});

Ext.applyIf(App.Package.ClassA.prototype, {
    /**
     * @cfg {String} appliedifcfg1
     * appliedIf config var 1 without symbol
     */
    
    /**
     * @cfg {String} appliedifcfg2 
     * appliedIf config var 2 with whitespace after name
     */
    appliedifcfg2: 'appliedifcfg2',
    
    /**
     * appliedIf property1
     * @property appliedifprop1
     * @type String
     */
    appliedifprop1: 'appliedifprop1',
    
    /**
     * appliedIf method
     *
     * @param {Array} a some param
     * @param {Object} b some object
     * @return {Boolean}
     */
    appliedifmethod: function(a, b) {
        // this of course should not be docuemted!
        this.xyz = Ext.applyIf(this.a, {});
    }
});

Ext.override(App.Package.ClassA, {
    /**
     * overriden method property
     * @type String
     */
    prop5: 'prop5',
    
    /**
     * overriden method
     * 
     * @param {String} q
     */
    overriddenMethod: function(q)
    {
    
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

/**
 * do fancy stuff with an fn
 */
Function.prototype.fancy = function(){};