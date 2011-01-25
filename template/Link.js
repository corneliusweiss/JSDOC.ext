
/**
 * spechialized link handling
 * 
 * @class JSDOC.ext.Link
 * @extends Link
 */
JSDOC.ext.Link = Ext.extend(Link, {
    
    /**
     * adds attributes in ext namespace like ext:member="#name"
     * 
     * @param {String} alias
     * @return {String}
     */
    _makeSymbolLink:  function(alias) {
        var link = JSDOC.ext.Link.superclass._makeSymbolLink.apply(this, arguments);
            member = this.innerName ? this.innerName : alias.match(/^#/) ? alias : null,
            cls = alias.match(/^#/) ? null : alias;
            attrs = '';
            
        attrs += member ? ' ext:member="#' + member + '"' : '';
        attrs += cls ? ' ext:cls="' + cls + '"' : '';
        
        return link.replace(/>(.*<\/a>)/,  attrs + '>$1');
    }
});