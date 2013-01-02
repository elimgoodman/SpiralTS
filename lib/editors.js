var Meta = require("./meta")
var Editor = (function () {
    function Editor(type, template) {
        this.type = type;
        this.template = template;
    }
    return Editor;
})();
exports.Editor = Editor;
var Instance = (function () {
    function Instance(editor, display_text, value_field) {
        this.editor = editor;
        this.display_text = display_text;
        this.value_field = value_field;
    }
    return Instance;
})();
exports.Instance = Instance;
var Store = (function () {
    function Store() {
        this.editors = [];
    }
    Store.prototype.add = function (e) {
        this.editors.push(e);
    };
    return Store;
})();
exports.Store = Store;

