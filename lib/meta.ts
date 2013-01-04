import _ = module("underscore");

export interface Definition {
    getId(): string;
}
export class Instance {
    public parent: Definition = null;
    constructor(public parent_ref){}
    postHydrate(){}
}

export class Reference {
    constructor(public id:string){}
}

export class DefinitionStore {
    public defs:Definition[] = [];
    add(d:Definition): void {
        this.defs.push(d);
    }

    getAll() {
        return this.defs;
    }

    getByReference(ref:Reference) {
        return _.find(this.defs, function(def){
            return ref.id == def.getId(); 
        });
    }
}
