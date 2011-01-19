JSDOC.PluginManager.registerPlugin(
    "JSDOC.ext.cfgTag",
    {
        /**
         * support for @cfg tag
         * 
         * @param {JSDOC.DocComment} comment
         */
        onDocCommentTags: function(comment) {
            var title = comment.tags[0] ? comment.tags[0].title : '';
            
            if (title !== 'cfg') return;
            
            // shift symbol name off
            var descParts = comment.tags[0].desc.split(/\s/),
                name = descParts.shift().replace(/[^a-zA-z0-9]/, '');
                
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
        }
    }
);