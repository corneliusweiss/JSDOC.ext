JSDOC.PluginManager.registerPlugin(
    "JSDOC.ext.lazyDesc",
    {
        /**
         * prepend desciptions with @desc if they are at palces jsdoc normaly don't reconizes them
         * 
         * @param {JSDOC.DocComment} comment
         */
        onDocCommentSrc: function(comment) {
            comment.src = comment.src.replace(/(@(?:extends|class|constructor).*\n\s*)([^@])/gm, '$1@desc $2');
        }
    }
);