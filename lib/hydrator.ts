import Concepts = module("concepts");
import Editors = module("editors");
import Fields = module("fields");
import Project = module("project");

import Meta = module("meta");

import _ = module("underscore");

export class Hydrator {
    constructor(
        public concept_store: Concepts.DefinitionStore,
        public editor_store: Editors.Store,
        public field_store: Fields.Store
        ){}

    private hydrateInstanceParent(instance: Meta.Instance, store: Meta.DefinitionStore):void {
        instance.parent = store.getByReference(instance.parent_ref);
        instance.postHydrate();
    }

    public hydrateInstance(instance: Concepts.Instance) {
        this.hydrateInstanceParent(instance, this.concept_store);
    }

    public hydrateEditorInstance(instance: Editors.Instance) {
        this.hydrateInstanceParent(instance, this.editor_store);
    }

    public hydrateFieldInstance(instance: Fields.Instance) {
        this.hydrateInstanceParent(instance, this.field_store);
    }

    public hydrateConceptDefition(def: Concepts.Concept) {
        var self = this;
        _.each(def.editors, function(editor) {
            self.hydrateEditorInstance(editor);
        });

        _.each(def.fields, function(field) {
            self.hydrateFieldInstance(field);
        });
    }

    public hydrateProjectInstance(project: Project.Project) {
        var self = this;
        var concepts = _.map(project.concept_refs, function(ref) {
            return self.concept_store.getByReference(ref);
        });

        project.concepts = concepts;
    }

    public hydrateConceptInstance(instance: Concepts.Instance) {
        this.hydrateInstanceParent(instance, this.concept_store);
    }
}
