var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
var Meta = require("./meta")
var Field = (function () {
    function Field(type) {
        this.type = type;
    }
    Field.prototype.getId = function () {
        return this.type;
    };
    return Field;
})();
exports.Field = Field;
var Instance = (function (_super) {
    __extends(Instance, _super);
    function Instance(parent_ref, name) {
        _super.call(this, parent_ref);
        this.name = name;
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

