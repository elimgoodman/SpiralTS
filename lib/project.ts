///<reference path='../node.d.ts' />

import _ = module("underscore");
import Concepts = module("concepts");

export class CodeBlock {
    constructor(public params:string[], public body:string){}
}

export class Action {
    constructor(
        public name:string,
        public display_name:string,
        public code:CodeBlock,
        public isValid:CodeBlock
    ){}
}

export class Project {

    private environment = {};

    constructor(
        public name: string, 
        public concept_refs: Concepts.Reference[], 
        public actions: Action[]){}
}
