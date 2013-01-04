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

export class ConceptInstance extends Meta.Instance {
    public id:string;
    public values:any;
    public parent:Concept;
    public parent_ref:Reference;

    constructor(parent: Concept, values: any){
        var ref = new Reference(parent.getId());
        super(ref);
        this.parent = parent;
        this.values = values;
        this.id = this.getUniqueId();
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

