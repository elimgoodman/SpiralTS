import Meta = module("meta");

class Hydrator {
    constructor(
        public concept_store: Meta.DefinitionStore,
        public editor_store: Meta.DefinitionStore,
        public field_store: Meta.DefinitionStore
        ){}

    private hydrateInstanceParent(instance: Meta.Instance, store: Meta.DefinitionStore):void {
        instance.parent = store.getByReference(instance.parent_ref);
    }
}
