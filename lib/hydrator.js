




var _ = require("underscore")
var Hydrator = (function () {
    function Hydrator(concept_store, editor_store, field_store) {
        this.concept_store = concept_store;
        this.editor_store = editor_store;
        this.field_store = field_store;
    }
    Hydrator.prototype.hydrateInstanceParent = function (instance, store) {
        instance.parent = store.getByReference(instance.parent_ref);
        instance.postHydrate();
    };
    Hydrator.prototype.hydrateInstance = function (instance) {
        this.hydrateInstanceParent(instance, this.concept_store);
    };
    Hydrator.prototype.hydrateEditorInstance = function (instance) {
        this.hydrateInstanceParent(instance, this.editor_store);
    };
    Hydrator.prototype.hydrateFieldInstance = function (instance) {
        this.hydrateInstanceParent(instance, this.field_store);
    };
    Hydrator.prototype.hydrateConceptDefition = function (def) {
        var self = this;
        _.each(def.editors, function (editor) {
            self.hydrateEditorInstance(editor);
        });
        _.each(def.fields, function (field) {
            self.hydrateFieldInstance(field);
        });
    };
    Hydrator.prototype.hydrateConceptInstance = function (instance) {
        this.hydrateInstanceParent(instance, this.concept_store);
    };
    return Hydrator;
})();
exports.Hydrator = Hydrator;

