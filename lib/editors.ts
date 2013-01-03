import Meta = module("meta");

export class Editor implements Meta.Definition {
    constructor(public type: string, public template: string){};
}

export class Instance implements Meta.Instance {
    constructor(public editor: Editor, public display_text: string, public value_field: string){}
}

export class Store extends Meta.DefinitionStore {
}

export class Reference extends Meta.Reference {
}
