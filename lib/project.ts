///<reference path='../node.d.ts' />

import _ = module("underscore");
import Concepts = module("concepts");

export class Module {
    constructor(
        public name: string, 
        public alias: string){}
}

export class Fn {
    constructor(
        public params: string[], 
        public body:string, 
        public modules: Module[]){}

    execute(...vars:any[]): any {
        var f = new Function;
        var params = this.params.slice(0);

        //FIXME: This doesn't work
        _.each(this.modules, function(mod){
            params.push(mod.alias);
            vars.push(require(mod.name));
        });
        params.push(this.body);

        var applied = Function.apply(f, params);
        return applied(vars);
    }
}

export class Action {
    constructor(
        public name: string, 
        public display_name:string, 
        public body: Fn,
        public isValid: Fn){}
}

export class Project {

    private environment = {};

    constructor(
        public name: string, 
        public concepts: Concepts.Concept[], 
        private actions: Action[]){}

    performAction(action_name:string) {
        var action = _.find(this.getActions(), function(action:Action){
            return action.name == action_name;
        });

        action.body.execute(this.environment);
    }
    getConcept(name:string) {
        return _.find(this.concepts, function(concept){
            return concept.name == name;
        });
    }
    getActions() {
        var self = this;
        return _.filter(this.actions, function(action){
            return action.isValid.execute(self.environment);
        });
    }
}
