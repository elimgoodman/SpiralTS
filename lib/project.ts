///<reference path='../node.d.ts' />

import _ = module("underscore");
import Concepts = module("concepts");

export class Fn {
    constructor(
        public params: string[], 
        public body:string){}

    execute(...vars:any[]): any {
        console.log("EXECUTED");
        //var f = new Function;
        //var params = this.params.slice(0);

        //FIXME: This doesn't work
        //_.each(this.modules, function(mod){
            //params.push(mod.alias);
            //vars.push(require(mod.name));
        //});
        //params.push(this.body);

        //var applied = Function.apply(f, params);
        //return applied(vars);
    }
}

export class Project {

    private environment = {};
    public concepts: Concepts.Concept[] = [];
    public actions: Concepts.Instance[] = [];

    constructor(
        public name: string, 
        public concept_refs: Concepts.Reference[], 
        private action_refs: Concepts.InstanceReference[]){}

    performAction(action_name:string) {
        var action = _.find(this.getActions(), function(action){
            return action.get('name') == action_name;
        });

        action.body.execute(this.environment);
    }
    getActions() {
        //var self = this;
        //return _.filter(this.actions, function(action){
            //return action.isValid.execute(self.environment);
        //});
    }
}
