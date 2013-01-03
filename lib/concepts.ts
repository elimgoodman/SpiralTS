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
}

export class ConceptInstance implements Meta.Instance {
    public id:string;

    constructor(public concept: Concept, public values: any){
        this.id = this.getUniqueId();
    }
    
    setValues(values:any) {
        this.values = values;
    }

    get(field: string) : any {
        return this.values[field];
    }

    getUniqueId() {
        return String(this.get(this.concept.unique_id_field));
    }
}

export class Reference extends Meta.Reference {
}

export class DefinitionStore extends Meta.DefinitionStore {
    getByName(name:string): Concept {
        return _.find(this.defs, function(concept) {
            return concept.name == name;
        });
    }
}

export class InstanceStore {
    private instances: ConceptInstance[] = [];

    getByConceptName(concept_name:string): ConceptInstance[] {
        return _.filter(this.instances, function(instance) {
            return instance.concept.name == concept_name;
        });
    }

    getById(instance_id:string): ConceptInstance {
        return _.find(this.instances, function(instance) {
            return instance.id == instance_id;
        });
    }

    add(instance: ConceptInstance) {
        this.instances.push(instance);
    }
}

