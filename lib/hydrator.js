
var Hydrator = (function () {
    function Hydrator(concept_store, editor_store, field_store) {
        this.concept_store = concept_store;
        this.editor_store = editor_store;
        this.field_store = field_store;
    }
    Hydrator.prototype.hydrateInstanceParent = function (instance, store) {
        instance.parent = store.getByReference(instance.parent_ref);
    };
    return Hydrator;
})();

