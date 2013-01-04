var _ = require("underscore")
var Instance = (function () {
    function Instance(parent_ref) {
        this.parent_ref = parent_ref;
        this.parent = null;
    }
    Instance.prototype.postHydrate = function () {
    };
    return Instance;
})();
exports.Instance = Instance;
var Reference = (function () {
    function Reference(id) {
        this.id = id;
    }
    return Reference;
})();
exports.Reference = Reference;
var DefinitionStore = (function () {
    function DefinitionStore() {
        this.defs = [];
    }
    DefinitionStore.prototype.add = function (d) {
        this.defs.push(d);
    };
    DefinitionStore.prototype.getAll = function () {
        return this.defs;
    };
    DefinitionStore.prototype.getByReference = function (ref) {
        return _.find(this.defs, function (def) {
            return ref.id == def.getId();
        });
    };
    return DefinitionStore;
})();
exports.DefinitionStore = DefinitionStore;

