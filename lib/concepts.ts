import _ = module("underscore")

import Editors = module("editors")
import Fields = module("fields")
import Meta = module("meta");

export class Concept implements Meta.Definition {
    constructor(
        public name: string, 
        public display_name: string, 
        public unique_id_field:string,
        public editors: Editors.Instance[], 
        public fields: Fields.Field[])
    {};

    getId() {
        return this.name;
    }
}

export class Instance extends Meta.Instance {
    public id:string;

    constructor(public parent_ref: Reference, public values: any) {
        super(parent_ref);
    }

    setValues(values:any) {
        this.values = values;
    }

    get(field: string) : any {
        return this.values[field];
    }

    getUniqueId() {
        var parent = <Concept> this.parent;
        return String(this.get(parent.unique_id_field));
    }

    postHydrate() {
        this.id = this.getUniqueId();
    }
}

export class Reference extends Meta.Reference {
    //wat
    constructor(id:string){
        super(id);
    }
}

export class DefinitionStore extends Meta.DefinitionStore {
    getByName(name:string): Concept {
        return _.find(this.defs, function(concept) {
            return concept.name == name;
        });
    }
}

export class InstanceStore {
    private instances: Instance[] = [];

    getByConceptName(concept_name:string): Instance[] {
        return _.filter(this.instances, function(instance) {
            return instance.parent.name == concept_name;
        });
    }

    getById(instance_id:string): Instance {
        return _.find(this.instances, function(instance) {
            return instance.id == instance_id;
        });
    }

    add(instance: Instance) {
        this.instances.push(instance);
    }

    getAll() {
        return this.instances;
    }
}

