IO.include("frame/Dumper.js");
JSDOC.PluginManager.registerPlugin(
    "JSDOC.ext",
    {
//        onSymbol: function(symbol) {
//            print('onSymbol ' + Dumper.dump(symbol));
//        },
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
            switch (functionCall.name) {
                case 'Ext.apply' :
                    this.onApply.call(this, functionCall, false);
                    break;
                case 'Ext.applyIf' :
                    this.onApply.call(this, functionCall, true);
                    break;
                case 'Ext.override' :
                    this.onOverride.apply(this, arguments);
                    break;
                case 'Ext.extend' :
                    this.onExtend.apply(this, arguments);
                    break;
                case 'this.addEvents' :
                    this.onAddEvents.apply(this, arguments);
                    break;
            }
        },
        
        onApply: function(functionCall, applyIf) {
            var ts = JSDOC.Parser.walker.ts,
                targetParts = ts.look(+2).data.split('.'),
                keyword = targetParts.pop(),
                target;
            
            // find target class
            switch (keyword) {
                case 'this':
                    target = JSDOC.Parser.walker.namescope.last().alias.replace(/(#.*)/, '');
                    break;
                case 'prototype':
                    target = targetParts.join('.')
                    break;
                default:
                    return;
                    break;
            }
            
            var pkg = target.split('.');
            var alias = pkg.pop();
            
            var doc = '';
            doc += "@package " + pkg.join('.') + "\n";
            doc += "@class " + target + "\n";
            doc += "@alias " + alias + "\n";
            doc += "@scope " + target + ".prototype\n";
            
            functionCall.doc = doc;
            
            // remove existing symbols
            if (! applyIf) {
                var cursor = ts.cursor,
                    block = new JSDOC.TokenStream(ts.balance("LEFT_PAREN"));
                    
                while (block.look()) {
                    if (block.look().is("JSDOC") && !block.look().is("VOID")) {
                        // NOTE: no @cfg without symbol yet
                        if (block.look(+1).is("NAME"))  {
                            JSDOC.Parser.symbols.deleteSymbol(target + '#' + block.look(+1).data);
                        }
                    }
                    if (!block.next()) break;
                } 
                ts.cursor = cursor;
            }
        },
        
        onOverride: function(functionCall) {
            var ts = JSDOC.Parser.walker.ts,
                target = ts.look(+2);
                
            // make it look like apply
            target.data += '.prototype';
            functionCall.name = 'Ext.apply';
            this.onApply.call(this, functionCall, false);
        },
        
        /**
         * onAddEvents
         * 
         * @param {Object} functionCall
         */
        onAddEvents: function(functionCall) {
            var ts = JSDOC.Parser.walker.ts,
                object = JSDOC.Parser.walker.namescope.last().alias.replace(/(#.*)/, ''),
                block = new JSDOC.TokenStream(ts.balance("LEFT_PAREN"));
            
            // find and parse events
            while (block.look()) {
                if (block.look().is("JSDOC") && !block.look().is("VOID")) {
                    var comment = new JSDOC.DocComment(block.look().data),
                        name = comment.getTag('event')[0].desc.split(/\s/).shift(),
                        desc = new JSDOC.DocTag();
                        
                        desc.title = 'desc';
                        desc.desc = comment.getTag('event')[0].desc.replace(new RegExp('^' + name), '');
                        comment.tags.push(desc);
                        
                        JSDOC.Parser.symbols.addSymbol(new JSDOC.Symbol(object + "#" + name, [], "FUNCTION", comment));
                }
                if (!block.next()) break;
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
                doc += "@alias " + alias + "\n";
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
            if (symbol) {
                for (var i=0, sTag, dTag; i<symbol.comment.tags.length; i++) {
                    sTag = symbol.comment.tags[i];
                    dTag = docComment.getTag(sTag.title)[0];
                    
                    if (! dTag) {
                        docComment.tags.push(sTag);
                    } else if (sTag.title === 'desc' && dTag.desc === "") {
                        dTag.desc = sTag.desc;
                    }
                }
            }
            
            JSDOC.Parser.symbols.deleteSymbol(subclass);
            JSDOC.Parser.symbols.addSymbol(new JSDOC.Symbol(subclass, [], "CONSTRUCTOR", docComment));
        }
    }
);