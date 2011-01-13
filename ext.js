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
        onDocCommentTags: function(comment) {
            var title = comment.tags[0] ? comment.tags[0].title : '';
            
            switch(title) {
                case 'cfg' :
                    this.onCfg(comment);
                    break;
            }
            
        },
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
            switch (functionCall.name) {
                case 'Ext.extend' :
                    this.onExtend.apply(this, arguments);
                    break;
            }
        },
        
        onCfg: function(comment) {
            // shift symbol name off
            var descParts = comment.tags[0].desc.split(/\s/),
                name = descParts.shift();
            comment.tags[0].desc = comment.tags[0].desc.replace(new RegExp('^' + name), '');
            
            // add type and desc
            ['type', 'desc'].map(function(title) {
                var tag = new JSDOC.DocTag();
                tag.title = title;
                tag.desc = comment.tags[0][title]; //.replace(/^/);
                comment.tags.push(tag);
            });
            
            // auto add a symbol if not exists
            var ts = JSDOC.Parser.walker.ts;
            if (! ts.look(+1).is("NAME")) {
                ts.tokens.splice(ts.cursor+1, 0, 
                    new JSDOC.Token(name, "NAME", "NAME"),
                    new JSDOC.Token(':', "PUNC", "COLON"),
                    new JSDOC.Token("''", "STRN", "SINGLE_QUOTE"),
                    new JSDOC.Token(',', "PUNC", "COMMA")
                );
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