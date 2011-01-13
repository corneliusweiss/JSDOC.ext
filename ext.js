IO.include("frame/Dumper.js");
JSDOC.PluginManager.registerPlugin(
    "JSDOC.ext",
    {
        onSymbol: function(symbol) {
//            print('onSymbol ' + Dumper.dump(symbol));
//            if (symbol.name.split('.').length == 1 && symbol.comment.isUserComment) {
//                print('onSymbol ' + Dumper.dump(symbol));
//                symbol.memberOf = 'App.Package.ClassA';
//            }
        },
//        
//        onDocCommentSrc: function(comment) {
//            print('onDocCommentSrc ' + Dumper.dump(comment));
//        },
//        
//        onDocCommentTags: function(comment) {
//            print('onDocCommentTags ' + Dumper.dump(comment));
//        },
//        
//        onDocTagSynonym: function(tag) {
//            print('onDocTagSynonym ' + Dumper.dump(tag));
//        },
//        
//        onDocTag: function(tag) {
//            print('onDocTag ' + Dumper.dump(tag));
//        },
//        
//        onSetTags: function(symbol) {
//            print('onSetTags ' + Dumper.dump(symbol));
//        },
//        
        onFunctionCall: function(functionCall) {
//            print('onFunctionCall ' + Dumper.dump(functionCall));
            switch (functionCall.name) {
                case 'Ext.extend' :
                    this.onExtend.apply(this, arguments);
                    break;
            }
        },
    
        /**
         * onExtend
         * - document Ext.extend if it's not already done via tags
         * 
         * @param {Object} functionCall
         */
        onExtend : function(functionCall) {
            var ts = JSDOC.Parser.walker.ts,
                is3argCall = ! (ts.look(-1).is("ASSIGN") && ts.look(+1).is("LEFT_PAREN")),
                subclass = is3argCall ? ts.look(+2).data : ts.look(-2).data,
                superclass = is3argCall ? ts.look(+4).data : ts.look(+2).data,
                pkg = subclass.split('.'),
                alias = pkg.pop(),
                symbol = JSDOC.Parser.symbols.getSymbol(subclass),
                doc = '';
            
            // check for DocComment
            if (ts.look(-1).is("JSDOC")) doc = ts.look(-1).data;
            else if (ts.look(-1).is("VAR") && ts.look(-2).is("JSDOC")) doc = ts.look(-2).data;
            else if (ts.look(-3).is("JSDOC")) doc = ts.look(-3).data;
            
    //        print(doc + "\n" + (is3argCall ? 
    //            ('Ext.extend(' + subclass + ', ' + superclass + ', {...})') :
    //            (subclass + ' = Ext.extend(' + superclass + ', {...})')
    //        ));
            
            doc = JSDOC.DocComment.unwrapComment(doc);
            
            if (!doc.match(/@package/)) {                                       
                doc += "@package " + pkg.join('.') + "\n";
            }                  
            if (!doc.match(/@class/)) {                    
                doc += "@class " + subclass + "\n";
            }     
            if (!doc.match(/@alias/)) {
                doc += "@alias " + subclass + "\n";
            }                           
            if (!doc.match(/@constructor/)) {
                doc += "@constructor\n";
            }
            if (!doc.match(/@extends/)) {
                doc += "@extends " + superclass + "\n";                    
            }  
            if (!doc.match(/@scope/)) {
                doc += "@scope " + subclass + ".prototype\n";
            }
            
    //        print(doc);
            functionCall.doc = doc;
        
            var docComment = new JSDOC.DocComment(doc);
            
            // copy missing props from original symbol
            for (var i=0, sTag, dTag; i<symbol.comment.tags.length; i++) {
                sTag = symbol.comment.tags[i];
                dTag = docComment.getTag(sTag.title)[0];
                
                if (! dTag) {
                    docComment.tags.push(sTag);
                } else if (sTag.title === 'desc' && dTag.desc === "") {
                    dTag.desc = sTag.desc;
                }
            }
            
            JSDOC.Parser.symbols.deleteSymbol(subclass);
            JSDOC.Parser.symbols.addSymbol(new JSDOC.Symbol(subclass, [], "CONSTRUCTOR", docComment));
        }
    }
);