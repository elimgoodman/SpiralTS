import Meta = module("meta");

export class Editor implements Meta.Definition {
    constructor(
        public type: string, 
        public template: string, 
        public options: any = {}){
    };

    getId() {
        return this.type;
    }
}

export class Instance extends Meta.Instance {
    constructor(public parent_ref: Reference, public display_text: string, public value_field: string){
        super(parent_ref);
    }
}

export class Store extends Meta.DefinitionStore {
}

export class Reference extends Meta.Reference {
}
