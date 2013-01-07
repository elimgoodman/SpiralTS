import _ = module("underscore");
import Meta = module("meta");
import Globals = module("globals");

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
    constructor(
        public parent_ref: Reference, 
        public display_text: string, 
        public value_field: string,
        public context: any = {}){
        super(parent_ref);
    }

    toDict(globals:Globals.Globals) {
        var parent = <Editor> this.parent;
    
        //HACK CITAY
        var context = {};
        _.each(this.context, function(fn_body, key){
            var f = new Function("globals", fn_body);
            context[key] = f(globals);
        });

        return {
            body: parent.template,
            options: parent.options,
            display_text: this.display_text,
            value_field: this.value_field,
            context: context
        };
    }
}

export class Store extends Meta.DefinitionStore {
}

export class Reference extends Meta.Reference {
}
