var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
var Meta = require("./meta")
var Editor = (function () {
    function Editor(type, template, options) {
        if (typeof options === "undefined") { options = {
        }; }
        this.type = type;
        this.template = template;
        this.options = options;
    }
    Editor.prototype.getId = function () {
        return this.type;
    };
    return Editor;
})();
exports.Editor = Editor;
var Instance = (function (_super) {
    __extends(Instance, _super);
    function Instance(parent_ref, display_text, value_field) {
        _super.call(this, parent_ref);
        this.parent_ref = parent_ref;
        this.display_text = display_text;
        this.value_field = value_field;
    }
    return Instance;
})(Meta.Instance);
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

