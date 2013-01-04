import Meta = module("meta");

export class Field implements Meta.Definition {
    constructor(public type: string){}

    getId() {
        return this.type;
    }
}

export class Instance extends Meta.Instance {
    constructor(parent_ref: Reference, public name:string){
        super(parent_ref);
    }
}

export class Store extends Meta.DefinitionStore {
}

export class Reference extends Meta.Reference {
}
