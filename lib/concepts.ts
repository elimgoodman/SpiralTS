import _ = module("underscore")

import Editors = module("editors")
import Fields = module("fields")

export class Concept {
    constructor(
        public name: string, 
        public display_name: string, 
        public editors: Editors.Instance[], 
        public fields: Fields.Field[],
        public list_label_field:string )
    {};
}

export class ConceptInstance {
    public id:string;

    constructor(public concept: Concept, public values: any){
        this.id = this.getListLabel();
    }
    
    setValues(values:any) {
        this.values = values;
    }

    get(field: string) : any {
        return this.values[field];
    }

    getListLabel() {
        return String(this.get(this.concept.list_label_field));
    }
}

export class ConceptStore {
    private concepts: Concept[] = [];

    add(concept: Concept) {
        this.concepts.push(concept);
    }

    getByName(name:string): Concept {
        return _.find(this.concepts, function(concept) {
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

