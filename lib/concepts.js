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
var ConceptInstance = (function (_super) {
    __extends(ConceptInstance, _super);
    function ConceptInstance(parent, values) {
        var ref = new Reference(parent.getId());
        _super.call(this, ref);
        this.parent = parent;
        this.values = values;
        this.id = this.getUniqueId();
    }
    ConceptInstance.prototype.setValues = function (values) {
        this.values = values;
    };
    ConceptInstance.prototype.get = function (field) {
        return this.values[field];
    };
    ConceptInstance.prototype.getUniqueId = function () {
        var parent = this.parent;
        return String(this.get(parent.unique_id_field));
    };
    return ConceptInstance;
})(Meta.Instance);
exports.ConceptInstance = ConceptInstance;
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
            return instance.concept.name == concept_name;
        });
    };
    InstanceStore.prototype.getById = function (instance_id) {
        return _.find(this.instances, function (instance) {
            return instance.id == instance_id;
        });
    };
    InstanceStore.prototype.add = function (instance) {
        this.instances.push(instance);
    };
    return InstanceStore;
})();
exports.InstanceStore = InstanceStore;

