var _ = require("underscore")


var Concept = (function () {
    function Concept(name, display_name, editors, fields, list_label_field) {
        this.name = name;
        this.display_name = display_name;
        this.editors = editors;
        this.fields = fields;
        this.list_label_field = list_label_field;
    }
    return Concept;
})();
exports.Concept = Concept;
var ConceptInstance = (function () {
    function ConceptInstance(concept, values) {
        this.concept = concept;
        this.values = values;
        this.id = this.getListLabel();
    }
    ConceptInstance.prototype.setValues = function (values) {
        this.values = values;
    };
    ConceptInstance.prototype.get = function (field) {
        return this.values[field];
    };
    ConceptInstance.prototype.getListLabel = function () {
        return String(this.get(this.concept.list_label_field));
    };
    return ConceptInstance;
})();
exports.ConceptInstance = ConceptInstance;
var ConceptStore = (function () {
    function ConceptStore() {
        this.concepts = [];
    }
    ConceptStore.prototype.add = function (concept) {
        this.concepts.push(concept);
    };
    ConceptStore.prototype.getByName = function (name) {
        return _.find(this.concepts, function (concept) {
            return concept.name == name;
        });
    };
    return ConceptStore;
})();
exports.ConceptStore = ConceptStore;
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

