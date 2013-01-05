var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
var _ = require("underscore")


var Meta = require("./meta")
var Concept = (function () {
    function Concept(name, display_name, unique_id_field, editors, fields) {
        this.name = name;
        this.display_name = display_name;
        this.unique_id_field = unique_id_field;
        this.editors = editors;
        this.fields = fields;
    }
    Concept.prototype.getId = function () {
        return this.name;
    };
    return Concept;
})();
exports.Concept = Concept;
var Instance = (function (_super) {
    __extends(Instance, _super);
    function Instance(parent_ref, values) {
        _super.call(this, parent_ref);
        this.parent_ref = parent_ref;
        this.values = values;
    }
    Instance.prototype.setValues = function (values) {
        this.values = values;
    };
    Instance.prototype.get = function (field) {
        return this.values[field];
    };
    Instance.prototype.getUniqueId = function () {
        var parent = this.parent;
        return String(this.get(parent.unique_id_field));
    };
    Instance.prototype.postHydrate = function () {
        this.id = this.getUniqueId();
    };
    return Instance;
})(Meta.Instance);
exports.Instance = Instance;
var Reference = (function (_super) {
    __extends(Reference, _super);
    function Reference(id) {
        _super.call(this, id);
    }
    return Reference;
})(Meta.Reference);
exports.Reference = Reference;
var DefinitionStore = (function (_super) {
    __extends(DefinitionStore, _super);
    function DefinitionStore() {
        _super.apply(this, arguments);

    }
    DefinitionStore.prototype.getByName = function (name) {
        return _.find(this.defs, function (concept) {
            return concept.name == name;
        });
    };
    return DefinitionStore;
})(Meta.DefinitionStore);
exports.DefinitionStore = DefinitionStore;
var InstanceStore = (function () {
    function InstanceStore() {
        this.instances = [];
    }
    InstanceStore.prototype.getByConceptName = function (concept_name) {
        return _.filter(this.instances, function (instance) {
            return instance.parent.name == concept_name;
        });
    };
    InstanceStore.prototype.getByParentAndId = function (parent_name, instance_id) {
        return _.find(this.instances, function (instance) {
            return (instance.id == instance_id) && (instance.parent.name == parent_name);
        });
    };
    InstanceStore.prototype.add = function (instance) {
        this.instances.push(instance);
    };
    InstanceStore.prototype.getAll = function () {
        return this.instances;
    };
    return InstanceStore;
})();
exports.InstanceStore = InstanceStore;

