var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
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
var Store = (function (_super) {
    __extends(Store, _super);
    function Store() {
        _super.apply(this, arguments);

    }
    return Store;
})(Meta.DefinitionStore);
exports.Store = Store;
var Reference = (function (_super) {
    __extends(Reference, _super);
    function Reference() {
        _super.apply(this, arguments);

    }
    return Reference;
})(Meta.Reference);
exports.Reference = Reference;

